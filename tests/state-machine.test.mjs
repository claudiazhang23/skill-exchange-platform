import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appPath = new URL("../app.js", import.meta.url);
const baseSource = fs.readFileSync(appPath, "utf8");
const source = `${baseSource}
globalThis.__app = {
  getState: () => state,
  setState: (next) => { state = next; },
  acceptBooking,
  cancelBooking,
  submitRequest,
  launchSession,
  completeSession,
  submitReview,
  getMatchScore,
  getFilteredPartners,
  createDefaultState,
  partners,
  ui,
};`;

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    hidden: false,
    open: false,
    src: "",
    alt: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    focus() {},
    scrollIntoView() {},
    showModal() { this.open = true; },
    close() { this.open = false; },
    addEventListener() {},
  };
}

const elementStore = new Map();
const getElement = (selector) => {
  if (!elementStore.has(selector)) elementStore.set(selector, createElement());
  return elementStore.get(selector);
};

const localData = new Map();
const windowMock = {
  localStorage: {
    getItem: (key) => localData.get(key) ?? null,
    setItem: (key, value) => localData.set(key, value),
  },
  setTimeout: () => 1,
  clearTimeout() {},
  requestAnimationFrame(callback) { callback(); },
};

class MockFormData {
  constructor(form) {
    this.fields = form.fields || {};
  }

  get(key) {
    const value = this.fields[key];
    return Array.isArray(value) ? value[0] : value ?? null;
  }

  getAll(key) {
    const value = this.fields[key];
    return Array.isArray(value) ? value : value ? [value] : [];
  }
}

const documentMock = {
  querySelector: getElement,
  querySelectorAll: () => [],
  addEventListener() {},
  body: { classList: { add() {}, remove() {} } },
};

const context = vm.createContext({
  console,
  window: windowMock,
  document: documentMock,
  FormData: MockFormData,
  Date,
  JSON,
  Math,
  String,
  Array,
  Object,
  Set,
  Map,
  Number,
  Boolean,
  globalThis: {},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: "app.js" });

const app = context.__app;

function reset() {
  app.setState(JSON.parse(JSON.stringify(app.createDefaultState())));
}

reset();
const initial = app.getState();
assert.equal(app.getFilteredPartners().length, 6, "initial matching should list all seeded partners");
assert.ok(app.getMatchScore(app.partners[0]) >= 90, "reciprocal skill overlap should get a high match score");

app.ui.request = {
  partnerId: "heyu",
  mode: "coin",
  offerSkill: "",
  learnWhen: "2026-09-20 20:00",
  teachWhen: "2026-09-21 10:30",
};
app.submitRequest({ fields: { note: "我想从自然光构图开始。" } });
let createdBooking = app.getState().bookings[0];
assert.equal(createdBooking.status, "pending", "a sent coin request should wait for partner confirmation");
assert.equal(createdBooking.mode, "coin", "request should preserve the chosen exchange method");
assert.equal(app.getState().coinBalance, 108, "sending a coin request should lock the partner's course cost");
assert.equal(app.getState().wallet[0].status, "已锁定", "coin request should create a locked ledger entry");

reset();
app.acceptBooking("booking-chen");
let state = app.getState();
let swapBooking = state.bookings.find((booking) => booking.id === "booking-chen");
assert.equal(swapBooking.status, "confirmed", "incoming swap request should become confirmed");
assert.ok(swapBooking.sessions.every((session) => session.status === "confirmed"), "accepted swap should confirm both sessions");

for (const session of swapBooking.sessions) {
  app.launchSession(swapBooking.id, session.id);
  app.completeSession(swapBooking.id, session.id);
}
state = app.getState();
swapBooking = state.bookings.find((booking) => booking.id === "booking-chen");
assert.equal(swapBooking.status, "completed", "both reciprocal sessions should complete the swap");
assert.equal(state.coinBalance, 136, "completed swap should grant the eight-coin reliability reward");
assert.ok(state.wallet.some((entry) => entry.title.includes("守约奖励")), "swap reward should be recorded in the ledger");

app.submitReview({ dataset: { bookingId: "booking-chen" }, fields: { comment: "课程准备充分，交换目标很清楚。" } });
state = app.getState();
swapBooking = state.bookings.find((booking) => booking.id === "booking-chen");
assert.equal(swapBooking.reviewed, true, "completion review should persist on the booking");
assert.equal(state.reviews[0].bookingId, "booking-chen", "review should be linked to its booking");

reset();
app.cancelBooking("booking-zhou");
state = app.getState();
const coinBooking = state.bookings.find((booking) => booking.id === "booking-zhou");
assert.equal(coinBooking.status, "cancelled", "confirmed booking should be cancellable");
assert.equal(state.coinBalance, 150, "cancelling a locked coin booking should refund the original amount");
assert.ok(state.wallet.some((entry) => entry.kind === "refund" && entry.bookingId === "booking-zhou"), "refund must be recorded in the ledger");

reset();
const originalCompleted = app.getState().profile.completedBase;
app.launchSession("booking-zhou", "session-zhou-python");
app.completeSession("booking-zhou", "session-zhou-python");
state = app.getState();
const settledBooking = state.bookings.find((booking) => booking.id === "booking-zhou");
assert.equal(settledBooking.status, "completed", "single-session coin booking should complete after the session ends");
assert.equal(state.coinBalance, 128, "completion should settle locked coins without an additional charge");
assert.equal(state.wallet.find((entry) => entry.id === "ledger-zhou").status, "已结算", "coin booking should settle its original ledger entry");
assert.equal(state.profile.completedBase, originalCompleted, "completion should not mutate the baseline history counter");

console.log("State-machine checks passed: matching, swap lifecycle, review, coin refund, and coin settlement.");
