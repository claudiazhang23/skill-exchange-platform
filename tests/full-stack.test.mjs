import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { createPlatform } from "../server.mjs";

function createClient(baseUrl) {
  let cookie = "";
  return {
    async request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      if (cookie) headers.set("cookie", cookie);
      if (options.body !== undefined) headers.set("content-type", "application/json");
      const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) cookie = setCookie.split(";")[0];
      const body = response.status === 204 ? null : await response.json();
      return { response, body };
    },
  };
}

async function login(client, email) {
  const result = await client.request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "demo1234" }),
  });
  assert.equal(result.response.status, 200, `login for ${email} should succeed`);
  return result.body.user;
}

function findMatch(snapshot, name) {
  const match = snapshot.matches.find((candidate) => candidate.name === name);
  assert.ok(match, `${name} should be a match`);
  assert.ok(match.highlightedSkill, `${name} should expose a teachable skill`);
  assert.ok(match.commonSlots.length, `${name} should share at least one available time`);
  return match;
}

test("cross-account skill exchange, wallet, message, reschedule, and review lifecycle", async (t) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "huanji-test-"));
  const platform = createPlatform({ databasePath: join(temporaryDirectory, "platform.db") });
  await new Promise((resolve) => platform.server.listen(0, "127.0.0.1", resolve));
  const address = platform.server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const lin = createClient(baseUrl);
  const heyu = createClient(baseUrl);
  const zhou = createClient(baseUrl);

  t.after(async () => {
    await new Promise((resolve) => platform.server.close(resolve));
    platform.close();
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const health = await lin.request("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.ok, true);

  const linUser = await login(lin, "linan@huanji.local");
  const heyuUser = await login(heyu, "heyu@huanji.local");
  await login(zhou, "zhouye@huanji.local");

  let linBootstrap = await lin.request("/api/bootstrap");
  assert.equal(linBootstrap.response.status, 200);
  const heyuMatch = findMatch(linBootstrap.body, "何雨");
  const slot = heyuMatch.commonSlots[0];

  const coinRequest = await lin.request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({
      partnerId: heyuMatch.id,
      requestedSkillId: heyuMatch.highlightedSkill.id,
      mode: "coin",
      learnAt: slot,
      note: "我想从自然光人像的构图开始。",
    }),
  });
  assert.equal(coinRequest.response.status, 201);
  const coinBookingId = coinRequest.body.bookingId;
  assert.equal(coinRequest.body.snapshot.user.coinBalance, 108, "coin request must lock the course price");
  assert.ok(coinRequest.body.snapshot.wallet.some((entry) => entry.bookingId === coinBookingId && entry.status === "locked"));

  let heyuBootstrap = await heyu.request("/api/bootstrap");
  let incomingCoinBooking = heyuBootstrap.body.bookings.find((booking) => booking.id === coinBookingId);
  assert.equal(incomingCoinBooking.status, "pending");
  assert.equal(incomingCoinBooking.canAccept, true, "recipient must be able to accept the request");

  const acceptCoin = await heyu.request(`/api/bookings/${coinBookingId}/accept`, { method: "POST", body: "{}" });
  assert.equal(acceptCoin.response.status, 200);
  heyuBootstrap = await heyu.request("/api/bootstrap");
  incomingCoinBooking = heyuBootstrap.body.bookings.find((booking) => booking.id === coinBookingId);
  assert.equal(incomingCoinBooking.status, "confirmed");
  const coinSession = incomingCoinBooking.sessions[0];
  assert.equal(coinSession.teacherId, heyuUser.id, "the skill owner is the teacher");

  const learnerCannotStart = await lin.request(`/api/bookings/${coinBookingId}/sessions/${coinSession.id}/start`, { method: "POST", body: "{}" });
  assert.equal(learnerCannotStart.response.status, 403, "learner cannot start a teacher-owned session");

  const startCoin = await heyu.request(`/api/bookings/${coinBookingId}/sessions/${coinSession.id}/start`, { method: "POST", body: "{}" });
  assert.equal(startCoin.response.status, 200);
  const teacherFinish = await heyu.request(`/api/bookings/${coinBookingId}/sessions/${coinSession.id}/complete`, { method: "POST", body: "{}" });
  assert.equal(teacherFinish.response.status, 200);
  const learnerFinish = await lin.request(`/api/bookings/${coinBookingId}/sessions/${coinSession.id}/complete`, { method: "POST", body: "{}" });
  assert.equal(learnerFinish.response.status, 200);
  linBootstrap = await lin.request("/api/bootstrap");
  const completedCoinBooking = linBootstrap.body.bookings.find((booking) => booking.id === coinBookingId);
  assert.equal(completedCoinBooking.status, "completed");
  assert.equal(linBootstrap.body.user.coinBalance, 108, "settlement must not charge a learner twice");
  assert.ok(linBootstrap.body.wallet.some((entry) => entry.bookingId === coinBookingId && entry.status === "settled"));
  heyuBootstrap = await heyu.request("/api/bootstrap");
  assert.equal(heyuBootstrap.body.user.coinBalance, 130, "teacher must receive the settled skill coins");

  const review = await lin.request(`/api/bookings/${coinBookingId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: 5, comment: "讲解很清晰，已经能把构图原则用到自己的练习里。" }),
  });
  assert.equal(review.response.status, 201);
  const duplicateReview = await lin.request(`/api/bookings/${coinBookingId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: 5, comment: "重复评价应该被阻止。" }),
  });
  assert.equal(duplicateReview.response.status, 409, "one user can review a booking only once");

  linBootstrap = await lin.request("/api/bootstrap");
  const swapMatch = findMatch(linBootstrap.body, "何雨");
  const offerSkill = linBootstrap.body.user.canTeach.find((skill) => skill.name === "演示表达");
  const swapRequest = await lin.request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({
      partnerId: swapMatch.id,
      requestedSkillId: swapMatch.highlightedSkill.id,
      mode: "swap",
      offerSkillId: offerSkill.id,
      learnAt: swapMatch.commonSlots[1],
      teachAt: swapMatch.commonSlots[2],
      note: "我们各自准备一个真实案例来练习。",
    }),
  });
  assert.equal(swapRequest.response.status, 201);
  const swapBookingId = swapRequest.body.bookingId;
  const acceptSwap = await heyu.request(`/api/bookings/${swapBookingId}/accept`, { method: "POST", body: "{}" });
  assert.equal(acceptSwap.response.status, 200);

  for (let pass = 0; pass < 2; pass += 1) {
    heyuBootstrap = await heyu.request("/api/bootstrap");
    let swapForHeyu = heyuBootstrap.body.bookings.find((booking) => booking.id === swapBookingId);
    const sessionForHeyu = swapForHeyu.sessions.find((session) => session.teacherId === heyuUser.id && session.status === "scheduled")
      || swapForHeyu.sessions.find((session) => session.teacherId === linUser.id && session.status === "scheduled");
    const teacherClient = sessionForHeyu.teacherId === heyuUser.id ? heyu : lin;
    const learnerClient = sessionForHeyu.teacherId === heyuUser.id ? lin : heyu;
    const started = await teacherClient.request(`/api/bookings/${swapBookingId}/sessions/${sessionForHeyu.id}/start`, { method: "POST", body: "{}" });
    assert.equal(started.response.status, 200);
    const teacherComplete = await teacherClient.request(`/api/bookings/${swapBookingId}/sessions/${sessionForHeyu.id}/complete`, { method: "POST", body: "{}" });
    assert.equal(teacherComplete.response.status, 200);
    const learnerComplete = await learnerClient.request(`/api/bookings/${swapBookingId}/sessions/${sessionForHeyu.id}/complete`, { method: "POST", body: "{}" });
    assert.equal(learnerComplete.response.status, 200);
  }
  linBootstrap = await lin.request("/api/bootstrap");
  const completedSwapBooking = linBootstrap.body.bookings.find((booking) => booking.id === swapBookingId);
  assert.equal(completedSwapBooking.status, "completed");
  assert.equal(linBootstrap.body.user.coinBalance, 116, "completed swap should grant a reliability reward");
  heyuBootstrap = await heyu.request("/api/bootstrap");
  assert.equal(heyuBootstrap.body.user.coinBalance, 138, "both swap participants receive a reward");

  const zhouMatch = findMatch(linBootstrap.body, "周野");
  const preCancelBalance = linBootstrap.body.user.coinBalance;
  const cancellable = await lin.request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({
      partnerId: zhouMatch.id,
      requestedSkillId: zhouMatch.highlightedSkill.id,
      mode: "coin",
      learnAt: zhouMatch.commonSlots[0],
      note: "这笔预约将测试取消退款。",
    }),
  });
  assert.equal(cancellable.response.status, 201);
  const cancellableBookingId = cancellable.body.bookingId;
  const cancelled = await lin.request(`/api/bookings/${cancellableBookingId}/cancel`, { method: "POST", body: "{}" });
  assert.equal(cancelled.response.status, 200);
  linBootstrap = await lin.request("/api/bootstrap");
  assert.equal(linBootstrap.body.user.coinBalance, preCancelBalance, "cancelling before confirmation must refund locked coins");
  assert.ok(linBootstrap.body.wallet.some((entry) => entry.bookingId === cancellableBookingId && entry.kind === "refund"));

  const sentMessage = await lin.request(`/api/conversations/${heyuUser.id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body: "谢谢今天的课程，我会先完成一组自然光练习。" }),
  });
  assert.equal(sentMessage.response.status, 201);
  const heyuMessages = await heyu.request(`/api/conversations/${linUser.id}`);
  assert.equal(heyuMessages.response.status, 200);
  assert.ok(heyuMessages.body.messages.some((message) => message.body.includes("自然光练习")), "messages must be visible to the other account");

  const profileUpdate = await zhou.request("/api/profile", {
    method: "PUT",
    body: JSON.stringify({
      name: "周野",
      city: "线上",
      headline: "数据产品经理与 Python 自动化爱好者",
      bio: "用小工具消灭重复劳动，也乐于把经验讲清楚。",
      availability: [slot],
    }),
  });
  assert.equal(profileUpdate.response.status, 200);
  const newSkill = await zhou.request("/api/skills", {
    method: "POST",
    body: JSON.stringify({
      type: "teach",
      name: "SQL 入门",
      category: "效率工具",
      level: "熟练",
      duration: "60 分钟",
      description: "用真实数据学会常用查询。",
      modes: ["swap", "coin"],
      coinCost: 21,
    }),
  });
  assert.equal(newSkill.response.status, 201);
});
