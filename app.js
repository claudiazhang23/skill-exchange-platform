const STORAGE_KEY = "huanji-full-demo-v2";

const partners = [
  {
    id: "heyu",
    name: "何雨",
    role: "摄影师",
    meta: "已完成 34 次交换 · 信用 4.9",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    teaches: ["人像摄影", "自然光构图"],
    wants: ["演示表达", "故事结构"],
    title: "自然光人像，从构图到引导",
    description: "一次讲清光线、构图和与被摄者沟通的起步方法。",
    modes: ["swap", "coin"],
    coinCost: 20,
    availability: "本周可约 4 个时段",
    response: "通常 5 分钟内回复",
    online: true,
    slots: ["2026-09-20 20:00", "2026-09-21 10:30", "2026-09-21 15:00"],
  },
  {
    id: "zhouye",
    name: "周野",
    role: "数据产品经理",
    meta: "已完成 27 次交换 · 回复快",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=85",
    teaches: ["Python 自动化", "数据清洗"],
    wants: ["Notion 整理", "项目管理"],
    title: "用 Python 告别重复办公",
    description: "从表格清洗到批量文件处理，做出第一个自动化脚本。",
    modes: ["swap", "coin"],
    coinCost: 22,
    availability: "今晚和周末有空",
    response: "通常 15 分钟内回复",
    online: true,
    slots: ["2026-09-20 19:30", "2026-09-21 14:00", "2026-09-22 20:30"],
  },
  {
    id: "chenmo",
    name: "陈默",
    role: "独立设计师",
    meta: "已完成 41 次交换 · 信用 4.9",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    teaches: ["Figma 入门", "页面设计"],
    wants: ["演示表达", "公开表达"],
    title: "从 0 到 1 做出能讲清的页面",
    description: "建立组件意识，用一小时复刻一个清爽的移动端页面。",
    modes: ["swap", "coin"],
    coinCost: 24,
    availability: "周六上午优先",
    response: "通常 20 分钟内回复",
    online: false,
    slots: ["2026-09-21 20:00", "2026-09-22 20:00", "2026-09-23 19:30"],
  },
  {
    id: "sunqi",
    name: "孙祺",
    role: "吉他老师",
    meta: "已教 120 人 · 信用 4.8",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=85",
    teaches: ["吉他弹唱", "乐理入门"],
    wants: ["个人作品集", "演示表达"],
    title: "七天弹出一首完整的歌",
    description: "零基础也能跟着节拍走，先拿下四个万能和弦。",
    modes: ["coin"],
    coinCost: 18,
    availability: "周末下午可约",
    response: "通常当天回复",
    online: true,
    slots: ["2026-09-20 15:00", "2026-09-21 16:30", "2026-09-22 19:00"],
  },
  {
    id: "linwen",
    name: "林雯",
    role: "视频创作者",
    meta: "回应率 100% · 已完成 19 次交换",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=85",
    teaches: ["短视频剪辑", "内容脚本"],
    wants: ["Python 自动化", "效率工具"],
    title: "用手机剪出节奏感和故事",
    description: "不堆模板，学会用节奏、声音和转场讲清一个观点。",
    modes: ["swap"],
    coinCost: 0,
    availability: "未来 7 天可约",
    response: "通常 10 分钟内回复",
    online: true,
    slots: ["2026-09-20 21:00", "2026-09-22 18:30", "2026-09-23 20:00"],
  },
  {
    id: "jiangfan",
    name: "蒋帆",
    role: "咖啡师",
    meta: "在线小班主理人 · 信用 4.7",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    teaches: ["手冲咖啡", "风味品鉴"],
    wants: ["公开表达", "线上课程设计"],
    title: "一杯稳定好喝的手冲咖啡",
    description: "理解研磨、水温和注水节奏，在家也能还原喜欢的风味。",
    modes: ["coin"],
    coinCost: 16,
    availability: "工作日午间有空",
    response: "通常 1 小时内回复",
    online: false,
    slots: ["2026-09-20 12:30", "2026-09-22 12:00", "2026-09-23 13:00"],
  },
];

const icons = {
  swap: "repeat-2",
  coin: "coins",
  incoming: "inbox",
  pending: "clock-3",
  confirmed: "calendar-check-2",
  live: "video",
  completed: "badge-check",
  cancelled: "circle-x",
  declined: "circle-x",
};

const modeLabels = {
  swap: "技能互换",
  coin: "技能币",
};

const bookingLabels = {
  incoming: "待你确认",
  pending: "等待对方确认",
  confirmed: "已确认",
  live: "进行中",
  completed: "已完成",
  cancelled: "已取消",
  declined: "已拒绝",
};

function createDefaultState() {
  return {
    version: 2,
    profile: {
      id: "linan",
      name: "林安",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=85",
      city: "线上",
      bio: "喜欢把复杂的事情讲得清楚，也在持续学习更有创造力的表达方式。",
      credit: 4.9,
      completedBase: 18,
      canTeach: [
        {
          id: "skill-teach-presentation",
          name: "演示表达",
          category: "职场技能",
          level: "熟练",
          duration: "60 分钟",
          description: "帮你把散乱的信息整理成有说服力的表达。",
          modes: ["swap", "coin"],
        },
        {
          id: "skill-teach-notion",
          name: "Notion 整理",
          category: "效率工具",
          level: "熟练",
          duration: "45 分钟",
          description: "搭一个能长期维护的个人项目和知识系统。",
          modes: ["swap", "coin"],
        },
      ],
      wantToLearn: [
        {
          id: "skill-learn-portrait",
          name: "人像摄影",
          category: "摄影",
          level: "入门",
          duration: "60 分钟",
          description: "先学会拍出自然、舒服的人像。",
          modes: [],
        },
        {
          id: "skill-learn-python",
          name: "Python 自动化",
          category: "效率工具",
          level: "入门",
          duration: "60 分钟",
          description: "想从真实的重复工作开始写第一个脚本。",
          modes: [],
        },
      ],
    },
    coinBalance: 128,
    wallet: [
      {
        id: "ledger-completed-1",
        kind: "earn",
        title: "完成互换 · 演示表达",
        detail: "9 月 17 日 · 已结算",
        amount: 18,
        status: "已结算",
      },
      {
        id: "ledger-zhou",
        kind: "spend",
        title: "预约 · Python 自动化",
        detail: "9 月 19 日 · 已锁定",
        amount: -22,
        status: "已锁定",
        bookingId: "booking-zhou",
      },
      {
        id: "ledger-completed-2",
        kind: "earn",
        title: "守约奖励 · Notion 整理",
        detail: "9 月 15 日 · 已结算",
        amount: 12,
        status: "已结算",
      },
    ],
    bookings: [
      {
        id: "booking-zhou",
        partnerId: "zhouye",
        requester: "user",
        mode: "coin",
        status: "confirmed",
        requestedSkill: "Python 自动化",
        offerSkill: "",
        coinAmount: 22,
        coinTransactionId: "ledger-zhou",
        note: "我想从批量整理表格开始。",
        createdAt: "今天 11:20",
        sessions: [
          {
            id: "session-zhou-python",
            kind: "learn",
            skill: "Python 自动化",
            when: "2026-09-19 19:30",
            status: "confirmed",
          },
        ],
      },
      {
        id: "booking-chen",
        partnerId: "chenmo",
        requester: "partner",
        mode: "swap",
        status: "incoming",
        requestedSkill: "Figma 入门",
        offerSkill: "演示表达",
        coinAmount: 0,
        note: "我想把一次项目汇报讲得更有逻辑，可以用 Figma 入门和你互换。",
        createdAt: "12 分钟前",
        sessions: [
          {
            id: "session-chen-teach",
            kind: "teach",
            skill: "演示表达",
            when: "2026-09-21 20:00",
            status: "pending",
          },
          {
            id: "session-chen-learn",
            kind: "learn",
            skill: "Figma 入门",
            when: "2026-09-22 20:00",
            status: "pending",
          },
        ],
      },
      {
        id: "booking-heyu-completed",
        partnerId: "heyu",
        requester: "user",
        mode: "swap",
        status: "completed",
        requestedSkill: "人像摄影",
        offerSkill: "演示表达",
        coinAmount: 0,
        rewarded: true,
        reviewed: true,
        note: "完成了第一次人像摄影练习。",
        createdAt: "9 月 14 日",
        sessions: [
          {
            id: "session-heyu-learn",
            kind: "learn",
            skill: "人像摄影",
            when: "2026-09-14 15:00",
            status: "completed",
          },
          {
            id: "session-heyu-teach",
            kind: "teach",
            skill: "演示表达",
            when: "2026-09-16 20:00",
            status: "completed",
          },
        ],
      },
    ],
    conversations: {
      heyu: [
        { id: "msg-heyu-1", sender: "partner", text: "嗨，看到你也在找人像摄影的入门课！", time: "今天 16:24", unread: true },
        { id: "msg-heyu-2", sender: "partner", text: "我很想跟你学做演示，能先聊聊彼此的目标吗？", time: "今天 16:25", unread: true },
      ],
      zhouye: [
        { id: "msg-zhou-1", sender: "partner", text: "今晚见。我会准备一个真实表格，我们从最有用的场景开始。", time: "今天 12:06", unread: false },
      ],
      chenmo: [
        { id: "msg-chen-1", sender: "partner", text: "我刚发了一份互换邀请，期待一起把这两个技能都推进一点。", time: "12 分钟前", unread: false },
      ],
    },
    notifications: [
      {
        id: "notice-chen-request",
        type: "incoming",
        title: "陈默向你发来技能互换邀请",
        body: "用 Figma 入门交换你的演示表达。",
        time: "12 分钟前",
        read: false,
        bookingId: "booking-chen",
      },
      {
        id: "notice-zhou-confirmed",
        type: "confirmed",
        title: "Python 自动化已确认",
        body: "今天 19:30，和周野在线见。",
        time: "1 小时前",
        read: true,
        bookingId: "booking-zhou",
      },
    ],
    reviews: [
      {
        id: "review-heyu",
        bookingId: "booking-heyu-completed",
        partnerId: "heyu",
        rating: 5,
        comment: "讲解很有条理，课后还给了我一个可以继续练习的小任务。",
        time: "9 月 16 日",
      },
      {
        id: "review-old",
        bookingId: "legacy",
        partnerId: "zhouye",
        rating: 5,
        comment: "准备得非常充分，整个互换过程很顺畅。",
        time: "9 月 12 日",
      },
    ],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === 2) return saved;
  } catch (error) {
    console.warn("Unable to read local demo data", error);
  }
  return createDefaultState();
}

let state = loadState();
const ui = {
  view: "discover",
  search: "",
  matchFilter: "all",
  scheduleFilter: "all",
  notificationOpen: false,
  activeConversation: "heyu",
  chatPartnerId: null,
  modal: null,
  request: null,
  rating: 5,
};

const dom = {
  view: document.querySelector("#viewContent"),
  search: document.querySelector("#skillSearch"),
  modal: document.querySelector("#appModal"),
  modalContent: document.querySelector("#modalContent"),
  chatDrawer: document.querySelector("#chatDrawer"),
  scrim: document.querySelector("#scrim"),
  toast: document.querySelector("#toast"),
  notificationMenu: document.querySelector("#notificationMenu"),
};

function saveState() {
  state.version = 2;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPartner(partnerId) {
  return partners.find((partner) => partner.id === partnerId);
}

function normalize(value) {
  return String(value || "").toLowerCase().replaceAll(/\s+/g, "");
}

function hasSkillOverlap(source, target) {
  return source.some((sourceSkill) =>
    target.some((targetSkill) => {
      const left = normalize(sourceSkill.name || sourceSkill);
      const right = normalize(targetSkill.name || targetSkill);
      return left.includes(right) || right.includes(left);
    }),
  );
}

function matchingSkills(source, target) {
  return source.filter((sourceSkill) =>
    target.some((targetSkill) => {
      const left = normalize(sourceSkill.name || sourceSkill);
      const right = normalize(targetSkill.name || targetSkill);
      return left.includes(right) || right.includes(left);
    }),
  );
}

function getMatchScore(partner) {
  const desired = matchingSkills(partner.teaches, state.profile.wantToLearn);
  const reciprocal = matchingSkills(partner.wants, state.profile.canTeach);
  const methodBonus = partner.modes.includes("swap") ? 4 : 0;
  const score = 58 + desired.length * 18 + reciprocal.length * 15 + methodBonus;
  return Math.min(99, Math.max(71, score));
}

function getMatchReasons(partner) {
  const desired = matchingSkills(partner.teaches, state.profile.wantToLearn);
  const reciprocal = matchingSkills(partner.wants, state.profile.canTeach);
  const reasons = [];
  if (desired.length) reasons.push(`她能教你 ${desired[0]}`);
  if (reciprocal.length) reasons.push(`你能教她 ${reciprocal[0]}`);
  if (partner.online) reasons.push("支持在线实时约课");
  return reasons.length ? reasons : ["可用技能币直接开始", partner.availability];
}

function getFilteredPartners() {
  const query = normalize(ui.search);
  return partners
    .filter((partner) => ui.matchFilter === "all" || partner.modes.includes(ui.matchFilter))
    .filter((partner) => {
      if (!query) return true;
      const searchable = [
        partner.name,
        partner.role,
        partner.title,
        partner.description,
        ...partner.teaches,
        ...partner.wants,
      ]
        .join(" ")
        .toLowerCase();
      return normalize(searchable).includes(query);
    })
    .sort((left, right) => getMatchScore(right) - getMatchScore(left));
}

function getBooking(bookingId) {
  return state.bookings.find((booking) => booking.id === bookingId);
}

function getActiveBooking(partnerId) {
  return state.bookings.find(
    (booking) =>
      booking.partnerId === partnerId &&
      ["incoming", "pending", "confirmed", "live"].includes(booking.status),
  );
}

function getAllSessions() {
  return state.bookings.flatMap((booking) =>
    booking.sessions.map((session) => ({ ...session, booking })),
  );
}

function getUpcomingSessions() {
  return getAllSessions()
    .filter((item) => ["confirmed", "live"].includes(item.status))
    .sort((left, right) => left.when.localeCompare(right.when));
}

function getCompletedCount() {
  return state.profile.completedBase + state.bookings.filter((booking) => booking.status === "completed").length;
}

function unreadMessageCount() {
  return Object.values(state.conversations)
    .flat()
    .filter((message) => message.sender === "partner" && message.unread).length;
}

function unreadNoticeCount() {
  return state.notifications.filter((notification) => !notification.read).length;
}

function pendingBookingCount() {
  return state.bookings.filter((booking) => booking.status === "incoming").length;
}

function formatWhen(value) {
  if (!value) return "待协商";
  const [date, time] = value.split(" ");
  const parsed = new Date(`${date}T12:00:00`);
  const labels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${parsed.getMonth() + 1} 月 ${parsed.getDate()} 日 ${labels[parsed.getDay()]} ${time}`;
}

function compactWhen(value) {
  if (!value) return "待协商";
  const [date, time] = value.split(" ");
  const parsed = new Date(`${date}T12:00:00`);
  return `${parsed.getMonth() + 1}/${parsed.getDate()} ${time}`;
}

function getDateStrip() {
  const now = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index - 2);
    const label = index === 2 ? "今天" : weekdays[date.getDay()];
    return `<button type="button" class="${index === 2 ? "selected" : ""}" data-action="select-agenda-date" data-day="${date.getDate()}"><small>${label}</small><strong>${date.getDate()}</strong></button>`;
  }).join("");
}

function createIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.85 } });
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => dom.toast.classList.remove("show"), 3200);
}

function addNotification({ type = "confirmed", title, body, bookingId, partnerId }) {
  state.notifications.unshift({
    id: createId("notice"),
    type,
    title,
    body,
    time: "刚刚",
    read: false,
    bookingId,
    partnerId,
  });
}

function addMessage(partnerId, sender, text, unread = false) {
  if (!state.conversations[partnerId]) state.conversations[partnerId] = [];
  state.conversations[partnerId].push({
    id: createId("message"),
    sender,
    text,
    time: "刚刚",
    unread,
  });
}

function markConversationRead(partnerId) {
  (state.conversations[partnerId] || []).forEach((message) => {
    if (message.sender === "partner") message.unread = false;
  });
  saveState();
}

function modeTags(modes) {
  return modes
    .map(
      (mode) => `<span class="exchange-tag ${mode}"><i data-lucide="${icons[mode]}"></i>${modeLabels[mode]}</span>`,
    )
    .join("");
}

function renderSkillToken(skill, type, removable = false) {
  return `
    <span class="skill-token ${type}">
      ${escapeHtml(skill.name)}
      ${removable ? `<button type="button" data-action="remove-skill" data-skill-type="${type === "teach" ? "teach" : "learn"}" data-skill-id="${skill.id}" aria-label="删除 ${escapeHtml(skill.name)}" title="删除"><i data-lucide="x"></i></button>` : ""}
    </span>`;
}

function renderProfileSnapshot() {
  const teachTokens = state.profile.canTeach.map((skill) => renderSkillToken(skill, "teach", true)).join("");
  const learnTokens = state.profile.wantToLearn.map((skill) => renderSkillToken(skill, "learn", true)).join("");
  return `
    <section class="profile-snapshot panel" aria-label="我的技能档案">
      <div class="skill-group teaches">
        <div class="skill-group-head"><span><i data-lucide="badge-check"></i>我能教</span><button class="text-button" type="button" data-action="open-skill-form" data-skill-type="teach">管理</button></div>
        <div class="skill-token-list">${teachTokens}<button class="skill-token add-skill-token" type="button" data-action="open-skill-form" data-skill-type="teach" aria-label="新增能教的技能" title="新增能教的技能"><i data-lucide="plus"></i></button></div>
      </div>
      <div class="divider"></div>
      <div class="skill-group learns">
        <div class="skill-group-head"><span><i data-lucide="graduation-cap"></i>我想学</span><button class="text-button" type="button" data-action="open-skill-form" data-skill-type="learn">管理</button></div>
        <div class="skill-token-list">${learnTokens}<button class="skill-token add-skill-token" type="button" data-action="open-skill-form" data-skill-type="learn" aria-label="新增想学的技能" title="新增想学的技能"><i data-lucide="plus"></i></button></div>
      </div>
    </section>`;
}

function renderPartnerCard(partner, detailed = false) {
  const score = getMatchScore(partner);
  const activeBooking = getActiveBooking(partner.id);
  const reasons = getMatchReasons(partner);
  const action = activeBooking ? "view-booking" : "open-request";
  const actionText = activeBooking ? "查看约课" : "发起交换";
  return `
    <article class="partner-card">
      <div class="partner-cover">
        <img src="${partner.cover}" alt="${escapeHtml(partner.teaches[0])}课程画面" />
        <span class="online-tag"><i data-lucide="${partner.online ? "video" : "users-round"}"></i>${partner.online ? "在线实时" : "线上小班"}</span>
      </div>
      <div class="partner-body">
        <div class="person-line">
          <img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" />
          <div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.role)} · ${escapeHtml(partner.meta.split(" · ")[0])}</small></div>
          ${partner.online ? '<span class="online-dot" title="当前在线"></span>' : ""}
        </div>
        <h3>${escapeHtml(partner.title)}</h3>
        <p>${escapeHtml(partner.description)}</p>
        ${detailed ? `<div class="match-detail-list">${reasons.slice(0, 2).map((reason) => `<div><i data-lucide="check"></i>${escapeHtml(reason)}</div>`).join("")}</div>` : ""}
        <div class="card-detail-row"><div class="exchange-tags">${modeTags(partner.modes)}</div><span class="match-percent">${score}%</span></div>
      </div>
      <footer class="partner-card-footer">
        <span>${activeBooking ? bookingLabels[activeBooking.status] : escapeHtml(partner.availability)}</span>
        <button type="button" data-action="${action}" data-partner-id="${partner.id}"${activeBooking ? ` data-booking-id="${activeBooking.id}"` : ""}>${actionText}<i data-lucide="arrow-up-right"></i></button>
      </footer>
    </article>`;
}

function renderAgendaPanel() {
  const sessions = getUpcomingSessions().slice(0, 2);
  return `
    <section class="agenda-panel panel">
      <div class="panel-heading"><div><span class="section-kicker">我的约课</span><h2>接下来</h2></div><button class="icon-button" type="button" data-view="schedule" aria-label="查看完整日程" title="查看完整日程"><i data-lucide="calendar-days"></i></button></div>
      <div class="date-strip" aria-label="本周日期">${getDateStrip()}</div>
      <div class="agenda-list">
        ${sessions.length ? sessions.map((item) => {
          const partner = getPartner(item.booking.partnerId);
          return `<article class="agenda-item ${item.kind}"><time>${item.when.split(" ")[1]}</time><div><span>${item.kind === "teach" ? "教：" : "学："}${escapeHtml(item.skill)}</span><small>与 ${escapeHtml(partner.name)} · 在线</small></div><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /></article>`;
        }).join("") : '<div class="notification-empty"><i data-lucide="calendar-x"></i>还没有已确认的约课</div>'}
      </div>
      <button class="text-button full-width-link" type="button" data-view="schedule">查看全部约课 <i data-lucide="arrow-right"></i></button>
    </section>`;
}

function renderWalletSummary() {
  const earned = state.wallet.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const locked = state.wallet.filter((item) => item.status === "已锁定").reduce((sum, item) => sum + Math.abs(item.amount), 0);
  return `
    <section class="wallet-summary panel">
      <div class="wallet-summary-top"><span><i data-lucide="wallet-cards"></i>技能钱包</span><button class="icon-button" type="button" data-view="wallet" aria-label="打开技能钱包" title="打开技能钱包"><i data-lucide="arrow-up-right"></i></button></div>
      <div class="wallet-amount"><strong>${state.coinBalance}</strong><span>技能币</span></div>
      <div class="wallet-stats"><span><small>累计获得</small><b>+${earned}</b></span><span><small>当前锁定</small><b>${locked}</b></span></div>
    </section>`;
}

function renderTrustSummary() {
  return `
    <section class="trust-summary panel">
      <div class="trust-score"><span>信用分</span><strong>${state.profile.credit.toFixed(1)}</strong><i data-lucide="star"></i></div>
      <p>完成 ${getCompletedCount()} 次守约交换<br />你的回复速度超过 91% 的用户</p>
      <button type="button" data-view="profile">查看信用档案 <i data-lucide="arrow-up-right"></i></button>
    </section>`;
}

function renderDiscover() {
  const suggested = getFilteredPartners().slice(0, 4);
  const incoming = state.bookings.find((booking) => booking.status === "incoming");
  const journey = incoming
    ? `<section class="journey-banner"><div class="journey-icon"><i data-lucide="inbox"></i></div><div><h2>${escapeHtml(getPartner(incoming.partnerId).name)} 想和你完成一次技能互换</h2><p>她用 ${escapeHtml(incoming.requestedSkill)} 交换你的 ${escapeHtml(incoming.offerSkill)}，等待你确认时段。</p></div><button class="secondary-button" type="button" data-view="schedule">处理邀请 <i data-lucide="arrow-right"></i></button></section>`
    : `<section class="journey-banner"><div class="journey-icon"><i data-lucide="target"></i></div><div><h2>本周学习目标正在推进</h2><p>你已经完成 ${getCompletedCount()} 次守约交换，再约 1 次就能保持本周学习节奏。</p></div><button class="secondary-button" type="button" data-view="matches">继续匹配 <i data-lucide="arrow-right"></i></button></section>`;

  return `
    <section class="page">
      <header class="page-heading">
        <div><span class="eyebrow"><i data-lucide="sun-medium"></i>今天，适合交换一点新能力</span><h1>把会的，换成想学的。</h1><p>你的技能、学习目标和可约时间正在一起工作，优先推荐更容易开始的线上搭档。</p></div>
        <div class="page-heading-actions"><button class="outline-button" type="button" data-view="profile"><i data-lucide="user-round"></i>完善档案</button><button class="primary-button" type="button" data-action="open-skill-form" data-skill-type="teach"><i data-lucide="plus"></i>发布技能</button></div>
      </header>
      <div class="dashboard-layout">
        <div class="main-column">
          ${renderProfileSnapshot()}
          ${journey}
          <section class="discovery-section">
            <div class="section-title"><div><span class="section-kicker">为你推荐</span><h2>今天的高质量匹配 <span>${getFilteredPartners().length}</span></h2></div><button class="text-button" type="button" data-view="matches">查看全部 <i data-lucide="arrow-right"></i></button></div>
            ${suggested.length ? `<div class="match-grid">${suggested.map((partner) => renderPartnerCard(partner)).join("")}</div>` : renderEmptyState("没有符合条件的匹配", "试着添加一个新的学习目标，系统会重新计算推荐。")}
          </section>
        </div>
        <aside class="right-column">${renderAgendaPanel()}${renderWalletSummary()}${renderTrustSummary()}</aside>
      </div>
    </section>`;
}

function renderEmptyState(title, body) {
  return `<div class="empty-state"><i data-lucide="search-x"></i><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></div>`;
}

function renderMatches() {
  const items = getFilteredPartners();
  return `
    <section class="page">
      <header class="page-heading">
        <div><span class="eyebrow"><i data-lucide="sparkles"></i>动态匹配</span><h1>更适合开始的技能搭档。</h1><p>匹配度综合了你能教、想学、对方的交换需求和在线可约时间。发布或调整技能后会立即重新计算。</p></div>
        <div class="page-heading-actions"><button class="outline-button" type="button" data-action="clear-search"${ui.search ? "" : " disabled"}><i data-lucide="x"></i>清除搜索</button><button class="primary-button" type="button" data-action="open-skill-form" data-skill-type="learn"><i data-lucide="plus"></i>添加想学</button></div>
      </header>
      <section class="match-explainer" aria-label="匹配依据"><div><i data-lucide="graduation-cap"></i><strong>学习目标</strong><span>优先匹配能教你目标技能的人。</span></div><div><i data-lucide="repeat-2"></i><strong>互换互补</strong><span>你会的正好是对方想学的，排名更靠前。</span></div><div><i data-lucide="calendar-clock"></i><strong>可约时间</strong><span>在线时段越多，越容易快速开始。</span></div></section>
      <div class="section-title"><div><span class="section-kicker">${ui.search ? `“${escapeHtml(ui.search)}” 的结果` : "全部结果"}</span><h2>共找到 <span>${items.length}</span> 位搭档</h2></div></div>
      <div class="filter-row" role="toolbar" aria-label="匹配筛选">
        <button class="filter-button ${ui.matchFilter === "all" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="all">全部 <span class="filter-total">${partners.length}</span></button>
        <button class="filter-button ${ui.matchFilter === "swap" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="swap"><i data-lucide="repeat-2"></i>可互换</button>
        <button class="filter-button ${ui.matchFilter === "coin" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="coin"><i data-lucide="coins"></i>技能币</button>
        <button class="filter-button right" type="button" data-action="refresh-matches"><i data-lucide="refresh-cw"></i>重新计算</button>
      </div>
      ${items.length ? `<div class="match-grid" style="margin-top:16px">${items.map((partner) => renderPartnerCard(partner, true)).join("")}</div>` : renderEmptyState("没有找到对应的技能", "换一个关键词，或者新增一个你想学的技能。")}
    </section>`;
}

function conversationPartnerIds() {
  const ids = new Set([...Object.keys(state.conversations), ...state.bookings.map((booking) => booking.partnerId)]);
  return [...ids].filter((id) => getPartner(id));
}

function getConversationPreview(partnerId) {
  const messages = state.conversations[partnerId] || [];
  return messages[messages.length - 1];
}

function renderConversationList() {
  const ids = conversationPartnerIds();
  if (!ids.includes(ui.activeConversation)) ui.activeConversation = ids[0] || partners[0].id;
  return `
    <aside class="conversation-list">
      <div class="conversation-list-heading"><h2>消息</h2><span>${unreadMessageCount()} 条未读</span></div>
      ${ids.map((partnerId) => {
        const partner = getPartner(partnerId);
        const preview = getConversationPreview(partnerId);
        const unread = (state.conversations[partnerId] || []).some((message) => message.sender === "partner" && message.unread);
        return `<button class="conversation-button ${partnerId === ui.activeConversation ? "active" : ""}" type="button" data-action="select-conversation" data-partner-id="${partnerId}"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div><span><strong>${escapeHtml(partner.name)}</strong>${unread ? '<i class="unread-dot"></i>' : ""}</span><small>${preview ? escapeHtml(preview.text) : "还没有消息"}</small></div></button>`;
      }).join("")}
    </aside>`;
}

function renderMessageStream(partnerId) {
  const messages = state.conversations[partnerId] || [];
  return messages
    .map((message) => {
      if (message.sender === "system") return `<div class="message-time">${escapeHtml(message.text)}</div>`;
      return `<div class="message ${message.sender === "user" ? "user" : "partner"}">${escapeHtml(message.text)}</div>`;
    })
    .join("");
}

function renderMessagePane(partnerId) {
  const partner = getPartner(partnerId);
  const activeBooking = getActiveBooking(partnerId);
  const relation = activeBooking
    ? `你们正在${activeBooking.mode === "swap" ? "协商技能互换" : "准备技能币约课"}`
    : `你们因「${partner.teaches[0]}」与「${partner.wants[0]}」匹配`;
  return `
    <section class="message-pane">
      <header class="message-pane-head"><div class="message-person"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.response)}</small></div></div><button class="text-button" type="button" data-action="open-request" data-partner-id="${partner.id}">${activeBooking ? "查看约课" : "发起交换"}<i data-lucide="arrow-up-right"></i></button></header>
      <div class="match-context"><i data-lucide="sparkles"></i><span>${escapeHtml(relation)}</span></div>
      <div class="message-stream" id="messageStream">${renderMessageStream(partnerId)}</div>
      <form class="message-compose" id="messageForm" data-partner-id="${partner.id}"><input name="message" autocomplete="off" maxlength="400" placeholder="写点什么，聊聊目标和时段..." required /><button class="send-button" type="submit" aria-label="发送消息" title="发送消息"><i data-lucide="send"></i></button></form>
    </section>`;
}

function renderMessages() {
  markConversationRead(ui.activeConversation);
  const partner = getPartner(ui.activeConversation);
  if (!partner) return renderEmptyState("还没有消息", "发起一次技能交换后，你们可以在这里协商。 ");
  return `
    <section class="page">
      <header class="page-heading"><div><span class="eyebrow"><i data-lucide="message-circle"></i>开始对话</span><h1>用聊天把交换约具体。</h1><p>确认学习目标、互换内容和可约时段后，再发出正式约课请求。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="sparkles"></i>发现搭档</button></div></header>
      <div class="messages-layout">${renderConversationList()}${renderMessagePane(partner.id)}</div>
    </section>`;
}

function renderStatusBadge(status) {
  return `<span class="status-badge ${status}"><i data-lucide="${icons[status]}"></i>${bookingLabels[status]}</span>`;
}

function renderSessionRow(booking, session) {
  const partner = getPartner(booking.partnerId);
  let action = "";
  if (session.status === "confirmed") {
    action = `<button type="button" data-action="launch-session" data-booking-id="${booking.id}" data-session-id="${session.id}"><i data-lucide="video"></i>开始约课</button>`;
  } else if (session.status === "live") {
    action = `<button class="live-action" type="button" data-action="complete-session" data-booking-id="${booking.id}" data-session-id="${session.id}"><i data-lucide="check"></i>结束并确认</button>`;
  } else if (session.status === "completed") {
    action = `<span class="status-badge completed">已完成</span>`;
  } else {
    action = `<span class="status-badge pending">待确认</span>`;
  }
  return `
    <div class="session-row ${session.kind}">
      <div class="session-kind"><i data-lucide="${session.kind === "teach" ? "presentation" : "graduation-cap"}"></i></div>
      <div class="session-info"><strong>${session.kind === "teach" ? "你教" : `${escapeHtml(partner.name)} 教`}：${escapeHtml(session.skill)}</strong><span>${formatWhen(session.when)}</span></div>
      <div class="session-actions">${action}</div>
    </div>`;
}

function renderBookingCard(booking) {
  const partner = getPartner(booking.partnerId);
  const swapText = booking.mode === "swap"
    ? `你教 ${booking.offerSkill} · 向 ${partner.name} 学 ${booking.requestedSkill}`
    : `使用 ${booking.coinAmount} 技能币学习 ${booking.requestedSkill}`;
  let actions = `<button class="compact-button" type="button" data-action="open-chat" data-partner-id="${partner.id}"><i data-lucide="message-circle"></i>聊聊</button>`;
  if (booking.status === "incoming") {
    actions = `<button class="compact-button confirm" type="button" data-action="accept-booking" data-booking-id="${booking.id}"><i data-lucide="check"></i>接受邀请</button><button class="compact-button danger" type="button" data-action="decline-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>婉拒</button>${actions}`;
  } else if (booking.status === "pending") {
    actions = `<button class="compact-button confirm" type="button" data-action="simulate-accept" data-booking-id="${booking.id}"><i data-lucide="zap"></i>演示确认</button><button class="compact-button danger" type="button" data-action="cancel-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>取消</button>${actions}`;
  } else if (booking.status === "confirmed") {
    actions = `<button class="compact-button" type="button" data-action="reschedule-booking" data-booking-id="${booking.id}"><i data-lucide="calendar-pen"></i>改期</button><button class="compact-button danger" type="button" data-action="cancel-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>取消</button>${actions}`;
  } else if (booking.status === "live") {
    actions = `<button class="compact-button danger" type="button" data-action="cancel-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>取消</button>${actions}`;
  } else if (booking.status === "completed" && !booking.reviewed) {
    actions = `<button class="compact-button confirm" type="button" data-action="open-review" data-booking-id="${booking.id}"><i data-lucide="star"></i>留下评价</button>${actions}`;
  }
  return `
    <article class="booking-card" data-booking-card="${booking.id}">
      <div class="booking-card-head"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div class="booking-card-title"><div><h3>${escapeHtml(partner.name)} · ${booking.mode === "swap" ? "技能互换" : "技能币约课"}</h3>${renderStatusBadge(booking.status)}</div><p>${escapeHtml(swapText)}</p></div></div>
      ${booking.note ? `<div class="booking-message">“${escapeHtml(booking.note)}”</div>` : ""}
      <div class="booking-slots">${booking.sessions.map((session) => renderSessionRow(booking, session)).join("")}</div>
      <footer class="booking-card-footer"><span>${escapeHtml(booking.createdAt || "刚刚发起")}</span><div class="booking-actions">${actions}</div></footer>
    </article>`;
}

function renderSchedule() {
  const bookings = state.bookings.filter((booking) => ui.scheduleFilter === "all" || booking.status === ui.scheduleFilter);
  const confirmed = state.bookings.filter((booking) => booking.status === "confirmed").length;
  const completed = state.bookings.filter((booking) => booking.status === "completed").length + state.profile.completedBase;
  const pending = state.bookings.filter((booking) => ["incoming", "pending"].includes(booking.status)).length;
  const live = state.bookings.filter((booking) => booking.status === "live").length;
  return `
    <section class="page">
      <header class="page-heading"><div><span class="eyebrow"><i data-lucide="calendar-days"></i>完整约课流程</span><h1>从邀请到评价，每次交换都有记录。</h1><p>接受邀请后可改期、开始线上约课、确认完成，并在双方学习结束后留下评价。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="plus"></i>发起新交换</button></div></header>
      <section class="summary-strip"><div class="summary-stat amber"><small>待你处理</small><strong>${pending}</strong></div><div class="summary-stat teal"><small>已确认</small><strong>${confirmed}</strong></div><div class="summary-stat coral"><small>进行中</small><strong>${live}</strong></div><div class="summary-stat"><small>累计完成</small><strong>${completed}</strong></div></section>
      <div class="schedule-controls" role="toolbar" aria-label="约课状态筛选">
        ${["all", "incoming", "pending", "confirmed", "live", "completed"].map((filter) => `<button class="filter-button ${ui.scheduleFilter === filter ? "active" : ""}" type="button" data-action="set-schedule-filter" data-filter="${filter}">${filter === "all" ? "全部" : bookingLabels[filter]}</button>`).join("")}
      </div>
      <div class="booking-list">${bookings.length ? bookings.map(renderBookingCard).join("") : renderEmptyState("这个状态下没有约课", "去发现页匹配一位新的线上搭档。")}</div>
    </section>`;
}

function renderWallet() {
  const earned = state.wallet.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const spent = state.wallet.filter((item) => item.amount < 0 && item.status !== "已退款").reduce((sum, item) => sum + Math.abs(item.amount), 0);
  return `
    <section class="page">
      <header class="page-heading"><div><span class="eyebrow"><i data-lucide="wallet-cards"></i>技能钱包</span><h1>技能币只为真实的学习流动。</h1><p>完成互换会获得守约奖励；用技能币约课时会先锁定，课程确认完成后自动结算。不提供充值或购买入口。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="sparkles"></i>寻找可约技能</button></div></header>
      <section class="wallet-overview"><div class="wallet-balance-card"><span class="section-kicker">当前可用</span><strong>${state.coinBalance}<small>技能币</small></strong><p>可用于预约标有“技能币”的线上课程。取消未完成约课时，锁定的技能币会原路退回。</p></div><div class="wallet-rule-card panel"><div class="rule-icon"><i data-lucide="handshake"></i></div><h2>获得方式清晰</h2><p>完成双向互换可获得守约奖励；每一笔锁定、结算与退款都会留在下面的账本里。</p><button class="text-button" type="button" data-view="schedule">查看我的约课 <i data-lucide="arrow-right"></i></button></div></section>
      <section class="ledger-panel panel"><div class="section-title" style="margin:16px 0 0"><div><span class="section-kicker">账本明细</span><h2>累计获得 <span>+${earned}</span></h2></div><span class="mini-label">累计使用 ${spent}</span></div>${state.wallet.map(renderLedgerRow).join("")}</section>
    </section>`;
}

function renderLedgerRow(item) {
  const icon = item.kind === "spend" ? "arrow-up-right" : item.kind === "refund" ? "rotate-ccw" : "circle-plus";
  const amountClass = item.amount < 0 ? "spend" : "";
  const sign = item.amount > 0 ? "+" : "";
  return `
    <div class="ledger-row"><div class="ledger-icon ${item.kind === "spend" ? "spend" : item.kind === "refund" ? "refund" : ""}"><i data-lucide="${icon}"></i></div><div class="ledger-info"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div><div class="ledger-amount"><strong class="${amountClass}">${sign}${item.amount}</strong><small>${escapeHtml(item.status)}</small></div></div>`;
}

function renderProfileSkillRow(skill, type) {
  const isTeach = type === "teach";
  return `
    <article class="profile-skill-row"><div class="profile-skill-icon ${isTeach ? "" : "learn"}"><i data-lucide="${isTeach ? "badge-check" : "graduation-cap"}"></i></div><div><h3>${escapeHtml(skill.name)}</h3><p>${escapeHtml(skill.category)} · ${escapeHtml(skill.level)} · ${escapeHtml(skill.duration)}</p></div><div class="row-actions"><button class="icon-button" type="button" data-action="edit-skill" data-skill-type="${type}" data-skill-id="${skill.id}" aria-label="编辑 ${escapeHtml(skill.name)}" title="编辑"><i data-lucide="pencil"></i></button><button class="icon-button delete-skill" type="button" data-action="remove-skill" data-skill-type="${type}" data-skill-id="${skill.id}" aria-label="删除 ${escapeHtml(skill.name)}" title="删除"><i data-lucide="trash-2"></i></button></div></article>`;
}

function renderProfile() {
  const profile = state.profile;
  const reviews = state.reviews.slice(0, 3);
  return `
    <section class="page">
      <header class="page-heading"><div><span class="eyebrow"><i data-lucide="user-round"></i>我的技能档案</span><h1>让合适的人看见你会什么。</h1><p>档案会直接影响智能匹配；技能卡也可以随时修改或下架。</p></div><div class="page-heading-actions"><button class="outline-button" type="button" data-action="reset-demo"><i data-lucide="rotate-ccw"></i>重置演示数据</button><button class="primary-button" type="button" data-action="edit-profile"><i data-lucide="pencil"></i>编辑资料</button></div></header>
      <section class="profile-hero panel"><img src="${profile.avatar}" alt="${escapeHtml(profile.name)}" /><div><h1>${escapeHtml(profile.name)}</h1><p>${escapeHtml(profile.bio)}</p><div class="profile-meta"><span><i data-lucide="map-pin"></i>${escapeHtml(profile.city)}</span><span><i data-lucide="shield-check"></i>已完成身份验证</span><span><i data-lucide="clock-3"></i>平均 12 分钟回复</span></div></div><button class="outline-button" type="button" data-action="open-skill-form" data-skill-type="teach"><i data-lucide="plus"></i>新增技能</button></section>
      <div class="profile-grid"><div><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">可教技能</span><h2>我能教 <span>${profile.canTeach.length}</span></h2></div><button class="text-button" type="button" data-action="open-skill-form" data-skill-type="teach">新增 <i data-lucide="plus"></i></button></div><div class="skill-list">${profile.canTeach.map((skill) => renderProfileSkillRow(skill, "teach")).join("")}</div></section><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">学习目标</span><h2>我想学 <span>${profile.wantToLearn.length}</span></h2></div><button class="text-button" type="button" data-action="open-skill-form" data-skill-type="learn">新增 <i data-lucide="plus"></i></button></div><div class="skill-list">${profile.wantToLearn.map((skill) => renderProfileSkillRow(skill, "learn")).join("")}</div></section></div><aside><section class="credit-card panel"><span class="section-kicker">交换信用</span><div class="credit-score-large"><strong>${profile.credit.toFixed(1)}</strong><span>优秀<br />守约记录</span></div><div class="credit-breakdown"><div><span>已完成交换</span><b>${getCompletedCount()}</b></div><div><span>评价完成率</span><b>100%</b></div><div><span>最近取消率</span><b>0%</b></div></div></section><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">最近评价</span><h2>交换反馈</h2></div></div>${reviews.map((review) => `<article class="review-card"><div class="review-card-top"><strong>${escapeHtml(getPartner(review.partnerId)?.name || "交换搭档")}</strong><span class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.comment)}</p><small>${escapeHtml(review.time)}</small></article>`).join("")}</section></aside></div>
    </section>`;
}

function renderNotificationMenu() {
  if (!ui.notificationOpen) {
    dom.notificationMenu.hidden = true;
    return;
  }
  dom.notificationMenu.hidden = false;
  dom.notificationMenu.innerHTML = `
    <div class="notification-head"><strong>通知</strong><button type="button" data-action="mark-notifications-read">全部已读</button></div>
    ${state.notifications.length ? state.notifications.slice(0, 6).map((notification) => `<button class="notification-item ${notification.read ? "" : "unread"}" type="button" data-action="open-notification" data-notification-id="${notification.id}"><i data-lucide="${icons[notification.type] || "bell"}"></i><div><strong>${escapeHtml(notification.title)}</strong><span>${escapeHtml(notification.body)}</span><small>${escapeHtml(notification.time)}</small></div></button>`).join("") : '<div class="notification-empty"><i data-lucide="bell-off"></i>暂无新通知</div>'}`;
}

function renderChatDrawer() {
  const partnerId = ui.chatPartnerId;
  if (!partnerId) {
    dom.chatDrawer.classList.remove("open");
    dom.chatDrawer.setAttribute("aria-hidden", "true");
    return;
  }
  const partner = getPartner(partnerId);
  const activeBooking = getActiveBooking(partnerId);
  dom.chatDrawer.innerHTML = `
    <header class="drawer-head"><div class="drawer-person"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.response)}</small></div></div><button class="icon-button" type="button" data-action="close-chat" aria-label="关闭聊天" title="关闭"><i data-lucide="x"></i></button></header>
    <div class="drawer-context"><i data-lucide="sparkles"></i><span>${activeBooking ? `关于「${escapeHtml(activeBooking.requestedSkill)}」的约课` : `你们因「${escapeHtml(partner.teaches[0])}」与「${escapeHtml(partner.wants[0])}」匹配`}</span></div>
    <div class="drawer-stream" id="drawerMessageStream">${renderMessageStream(partnerId)}</div>
    <form class="drawer-compose" id="drawerMessageForm" data-partner-id="${partnerId}"><input name="message" autocomplete="off" maxlength="400" placeholder="写点什么..." required /><button class="send-button" type="submit" aria-label="发送消息" title="发送消息"><i data-lucide="send"></i></button></form>`;
  dom.chatDrawer.classList.add("open");
  dom.chatDrawer.setAttribute("aria-hidden", "false");
  dom.scrim.hidden = false;
}

function render() {
  const renderers = {
    discover: renderDiscover,
    matches: renderMatches,
    messages: renderMessages,
    schedule: renderSchedule,
    wallet: renderWallet,
    profile: renderProfile,
  };
  dom.view.innerHTML = renderers[ui.view]();
  document.querySelectorAll("[data-view]").forEach((element) => element.classList.toggle("active", element.dataset.view === ui.view));
  document.querySelector("#sideCoinBalance").textContent = state.coinBalance;
  document.querySelector("#sideProfileName").textContent = state.profile.name;
  document.querySelector("#sideProfileAvatar").src = state.profile.avatar;
  document.querySelector("#sideProfileAvatar").alt = state.profile.name;
  document.querySelector("#matchNavBadge").textContent = getFilteredPartners().length;
  const unreadMessages = unreadMessageCount();
  const messageBadge = document.querySelector("#messageNavBadge");
  messageBadge.textContent = unreadMessages;
  messageBadge.hidden = unreadMessages === 0;
  const pending = pendingBookingCount();
  const scheduleBadge = document.querySelector("#scheduleNavBadge");
  scheduleBadge.textContent = pending;
  scheduleBadge.hidden = pending === 0;
  document.querySelector("#notificationDot").hidden = unreadNoticeCount() === 0;
  renderNotificationMenu();
  renderChatDrawer();
  createIcons();
}

function setView(view, focus = true) {
  if (!view) return;
  if (view === "messages") markConversationRead(ui.activeConversation);
  ui.view = view;
  ui.notificationOpen = false;
  render();
  if (focus) window.requestAnimationFrame(() => dom.view.focus());
}

function openChat(partnerId) {
  ui.activeConversation = partnerId;
  ui.chatPartnerId = partnerId;
  markConversationRead(partnerId);
  render();
  window.requestAnimationFrame(() => document.querySelector("#drawerMessageForm input")?.focus());
}

function closeChat() {
  ui.chatPartnerId = null;
  dom.chatDrawer.classList.remove("open");
  dom.chatDrawer.setAttribute("aria-hidden", "true");
  dom.scrim.hidden = true;
}

function renderModalContent() {
  if (!ui.modal) return;
  const renderer = {
    request: renderRequestModal,
    skill: renderSkillModal,
    profile: renderProfileModal,
    review: renderReviewModal,
    reschedule: renderRescheduleModal,
    confirm: renderConfirmModal,
  }[ui.modal.kind];
  dom.modalContent.innerHTML = renderer ? renderer() : "";
  createIcons();
}

function openModal(kind, payload = {}) {
  ui.modal = { kind, ...payload };
  if (kind === "request") {
    const partner = getPartner(payload.partnerId);
    const defaultMode = partner.modes.includes("swap") && state.profile.canTeach.length ? "swap" : "coin";
    ui.request = {
      partnerId: partner.id,
      mode: defaultMode,
      offerSkill: state.profile.canTeach[0]?.name || "",
      learnWhen: partner.slots[0],
      teachWhen: partner.slots[1] || partner.slots[0],
    };
  }
  if (kind === "review") ui.rating = 5;
  renderModalContent();
  if (!dom.modal.open) dom.modal.showModal();
  document.body.classList.add("modal-open");
}

function closeModal() {
  ui.modal = null;
  ui.request = null;
  if (dom.modal.open) dom.modal.close();
  document.body.classList.remove("modal-open");
}

function renderRequestModal() {
  const partner = getPartner(ui.request.partnerId);
  const draft = ui.request;
  const canSwap = partner.modes.includes("swap") && state.profile.canTeach.length;
  const coinAllowed = partner.modes.includes("coin");
  const selectedMode = draft.mode;
  const swapSection = selectedMode === "swap"
    ? `
      <div class="form-section"><h4>你准备教什么？</h4><label class="form-field"><select name="offerSkill" id="requestOfferSkill">${state.profile.canTeach.map((skill) => `<option value="${escapeHtml(skill.name)}"${draft.offerSkill === skill.name ? " selected" : ""}>${escapeHtml(skill.name)}</option>`).join("")}</select></label><p class="helper-text">${escapeHtml(partner.name)} 想学：${escapeHtml(partner.wants.join("、"))}</p></div>
      <div class="form-section"><h4>先上她教你的这节课</h4>${renderSlotPicker(partner.slots, draft.learnWhen, "learnWhen")}</div>
      <div class="form-section"><h4>再约你回馈的时间</h4>${renderSlotPicker(partner.slots, draft.teachWhen, "teachWhen")}</div>`
    : `
      <div class="form-section"><h4>选择学习时段</h4>${renderSlotPicker(partner.slots, draft.learnWhen, "learnWhen")}<div class="method-note"><i data-lucide="coins"></i><span>发送请求后会先锁定 ${partner.coinCost} 技能币；课程确认完成后才会结算。</span></div></div>`;
  return `
    <div class="modal-content">
      <button class="icon-button modal-close on-dark" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button>
      <div class="modal-profile"><img class="cover" src="${partner.cover}" alt="" /><span class="modal-match"><i data-lucide="sparkles"></i>${getMatchScore(partner)}% 契合</span><div class="modal-profile-content"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div><strong>${escapeHtml(partner.name)}</strong><span>${escapeHtml(partner.role)} · ${escapeHtml(partner.response)}</span></div></div></div>
      <form class="request-content" id="requestForm">
        <h3>向 ${escapeHtml(partner.name)} 发起交换</h3><p>${escapeHtml(partner.description)}</p>
        <div class="mode-picker">
          ${canSwap ? `<button class="${selectedMode === "swap" ? "active" : ""}" type="button" data-action="set-request-mode" data-mode="swap"><span><i data-lucide="repeat-2"></i>技能互换</span><small>用你的技能回馈对方</small></button>` : ""}
          ${coinAllowed ? `<button class="${selectedMode === "coin" ? "active" : ""}" type="button" data-action="set-request-mode" data-mode="coin"><span><i data-lucide="coins"></i>技能币</span><small>${partner.coinCost} 技能币 / 节</small></button>` : ""}
        </div>
        ${swapSection}
        <div class="form-section"><label class="form-field"><span>给对方留一句话（可选）</span><textarea name="note" maxlength="180" placeholder="例如：我希望先从最适合新手的场景开始。"></textarea></label></div>
        <div class="modal-footer"><button class="text-button" type="button" data-action="open-chat" data-partner-id="${partner.id}"><i data-lucide="message-circle"></i>先聊聊</button><button class="primary-button" type="submit">发送约课请求 <i data-lucide="arrow-right"></i></button></div>
      </form>
    </div>`;
}

function renderSlotPicker(slots, selected, group) {
  return `<div class="slot-picker">${slots.map((slot) => `<button type="button" class="${slot === selected ? "active" : ""}" data-action="pick-request-slot" data-slot-group="${group}" data-slot="${slot}">${compactWhen(slot)}</button>`).join("")}</div>`;
}

function renderSkillModal() {
  const { skillType = "teach", skillId } = ui.modal;
  const list = skillType === "teach" ? state.profile.canTeach : state.profile.wantToLearn;
  const skill = list.find((item) => item.id === skillId);
  const isEditing = Boolean(skill);
  const record = skill || { name: "", category: skillType === "teach" ? "职场技能" : "创意技能", level: "入门", duration: "60 分钟", description: "", modes: ["swap", "coin"] };
  return `
    <div class="modal-content">
      <button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button>
      <div class="modal-head"><span class="section-kicker">${isEditing ? "编辑技能卡" : "新建技能卡"}</span><h2 id="modalTitle">${isEditing ? `更新「${escapeHtml(record.name)}」` : skillType === "teach" ? "分享你会的技能" : "补充一个学习目标"}</h2><p>${skillType === "teach" ? "填写后会进入你的档案，并影响适合的技能互换匹配。" : "告诉我们你想学什么，系统会优先推荐能教你的搭档。"}</p></div>
      <form id="skillForm" data-skill-id="${skill?.id || ""}" data-original-type="${skillType}">
        <div class="form-section"><div class="form-grid"><label class="form-field"><span>技能方向</span><select name="type"><option value="teach"${skillType === "teach" ? " selected" : ""}>我能教</option><option value="learn"${skillType === "learn" ? " selected" : ""}>我想学</option></select></label><label class="form-field"><span>技能名称</span><input name="name" maxlength="30" value="${escapeHtml(record.name)}" placeholder="例如：手机人像摄影" required /></label><label class="form-field"><span>分类</span><input name="category" maxlength="20" value="${escapeHtml(record.category)}" placeholder="例如：创意技能" required /></label><label class="form-field"><span>当前程度</span><select name="level">${["入门", "熟练", "进阶"].map((level) => `<option value="${level}"${record.level === level ? " selected" : ""}>${level}</option>`).join("")}</select></label><label class="form-field"><span>单次时长</span><select name="duration">${["45 分钟", "60 分钟", "90 分钟"].map((duration) => `<option value="${duration}"${record.duration === duration ? " selected" : ""}>${duration}</option>`).join("")}</select></label><label class="form-field full"><span>一句说明</span><textarea name="description" maxlength="180" placeholder="说说你想教什么，或者希望从哪里开始学习。">${escapeHtml(record.description)}</textarea></label></div></div>
        <div class="form-section"><h4>接受方式</h4><div class="choice-stack"><label class="choice-option"><input type="checkbox" name="modes" value="swap"${record.modes.includes("swap") ? " checked" : ""} />技能互换</label><label class="choice-option"><input type="checkbox" name="modes" value="coin"${record.modes.includes("coin") ? " checked" : ""} />技能币约课</label></div><p class="helper-text">学习目标不会公开接受方式，系统将使用它来计算匹配。</p></div>
        <div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">取消</button><button class="primary-button" type="submit">${isEditing ? "保存变更" : "发布技能卡"} <i data-lucide="arrow-right"></i></button></div>
      </form>
    </div>`;
}

function renderProfileModal() {
  const profile = state.profile;
  return `
    <div class="modal-content">
      <button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button>
      <div class="modal-head"><span class="section-kicker">个人资料</span><h2 id="modalTitle">让别人快速认识你</h2><p>简洁的自我介绍会帮助新的搭档判断是否适合开始交换。</p></div>
      <form id="profileForm"><div class="form-section"><div class="form-grid"><label class="form-field"><span>昵称</span><input name="name" maxlength="20" value="${escapeHtml(profile.name)}" required /></label><label class="form-field"><span>主要方式</span><input name="city" maxlength="24" value="${escapeHtml(profile.city)}" placeholder="例如：线上" required /></label><label class="form-field full"><span>个人介绍</span><textarea name="bio" maxlength="180" required>${escapeHtml(profile.bio)}</textarea></label></div></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">取消</button><button class="primary-button" type="submit">保存资料 <i data-lucide="check"></i></button></div></form>
    </div>`;
}

function renderReviewModal() {
  const booking = getBooking(ui.modal.bookingId);
  const partner = getPartner(booking.partnerId);
  return `
    <div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">完成交换</span><h2 id="modalTitle">这次和 ${escapeHtml(partner.name)} 的学习怎么样？</h2><p>评价会更新双方的信用档案，也能帮助后来的学习者判断是否适合。</p></div><form id="reviewForm" data-booking-id="${booking.id}"><div class="form-section"><h4>总体评价</h4><div class="rating-picker">${[1, 2, 3, 4, 5].map((rating) => `<button class="${ui.rating === rating ? "active" : ""}" type="button" data-action="set-rating" data-rating="${rating}" aria-label="${rating} 星">${rating}★</button>`).join("")}</div></div><div class="form-section"><label class="form-field"><span>写一点具体反馈</span><textarea name="comment" maxlength="240" required placeholder="例如：对方准备充分、解释清晰，推荐先从哪一步开始。"></textarea></label></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">稍后再说</button><button class="primary-button" type="submit">提交评价 <i data-lucide="check"></i></button></div></form></div>`;
}

function renderRescheduleModal() {
  const booking = getBooking(ui.modal.bookingId);
  const partner = getPartner(booking.partnerId);
  const adjustableSessions = booking.sessions.filter((session) => session.status === "confirmed");
  const selectedSession = adjustableSessions[0];
  return `
    <div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">调整时间</span><h2 id="modalTitle">和 ${escapeHtml(partner.name)} 换一个时段</h2><p>提交后会发送改期请求；演示环境会模拟对方确认新的时间。</p></div><form id="rescheduleForm" data-booking-id="${booking.id}"><div class="form-section"><div class="form-grid"><label class="form-field"><span>要调整哪一节</span><select name="sessionId">${adjustableSessions.map((session) => `<option value="${session.id}">${session.kind === "teach" ? "你教" : "你学"}：${escapeHtml(session.skill)} · ${compactWhen(session.when)}</option>`).join("")}</select></label><label class="form-field"><span>新时段</span><select name="when">${partner.slots.map((slot) => `<option value="${slot}"${slot === selectedSession?.when ? " selected" : ""}>${formatWhen(slot)}</option>`).join("")}</select></label></div></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">暂不调整</button><button class="primary-button" type="submit">发送改期请求 <i data-lucide="arrow-right"></i></button></div></form></div>`;
}

function renderConfirmModal() {
  const { title, body, action, actionLabel, danger = false } = ui.modal;
  return `
    <div class="modal-content confirm-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="confirm-icon"><i data-lucide="${danger ? "triangle-alert" : "circle-help"}"></i></div><div class="modal-head" style="margin-top:16px"><h2 id="modalTitle">${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">返回</button><button class="${danger ? "outline-button button-danger" : "primary-button"}" type="button" data-action="confirm-modal-action" data-confirm-action="${action}">${escapeHtml(actionLabel)} <i data-lucide="arrow-right"></i></button></div></div>`;
}

function submitRequest(form) {
  const partner = getPartner(ui.request.partnerId);
  const formData = new FormData(form);
  const mode = ui.request.mode;
  const note = String(formData.get("note") || "").trim();
  const offerSkill = String(formData.get("offerSkill") || ui.request.offerSkill || "").trim();
  if (mode === "swap" && !offerSkill) {
    showToast("请选择你愿意回馈给对方的技能");
    return;
  }
  if (mode === "coin" && state.coinBalance < partner.coinCost) {
    showToast("技能币余额不足，先完成一次互换来获得技能币吧");
    return;
  }

  const booking = {
    id: createId("booking"),
    partnerId: partner.id,
    requester: "user",
    mode,
    status: "pending",
    requestedSkill: partner.teaches[0],
    offerSkill: mode === "swap" ? offerSkill : "",
    coinAmount: mode === "coin" ? partner.coinCost : 0,
    note,
    createdAt: "刚刚",
    sessions: mode === "swap"
      ? [
          { id: createId("session"), kind: "learn", skill: partner.teaches[0], when: ui.request.learnWhen, status: "pending" },
          { id: createId("session"), kind: "teach", skill: offerSkill, when: ui.request.teachWhen, status: "pending" },
        ]
      : [
          { id: createId("session"), kind: "learn", skill: partner.teaches[0], when: ui.request.learnWhen, status: "pending" },
        ],
  };

  if (mode === "coin") {
    state.coinBalance -= partner.coinCost;
    const transaction = {
      id: createId("ledger"),
      kind: "spend",
      title: `预约 · ${partner.teaches[0]}`,
      detail: "刚刚 · 等待对方确认",
      amount: -partner.coinCost,
      status: "已锁定",
      bookingId: booking.id,
    };
    booking.coinTransactionId = transaction.id;
    state.wallet.unshift(transaction);
  }

  state.bookings.unshift(booking);
  addMessage(partner.id, "user", note || `我想向你发起一次${mode === "swap" ? "技能互换" : "技能币约课"}，一起开始吧。`);
  addNotification({
    type: "pending",
    title: `已向 ${partner.name} 发送约课请求`,
    body: mode === "swap" ? `等待确认：${partner.teaches[0]} ⇄ ${offerSkill}` : `${partner.coinCost} 技能币已锁定，等待确认。`,
    bookingId: booking.id,
    partnerId: partner.id,
  });
  saveState();
  closeModal();
  setView("schedule");
  showToast(`邀请已发送。演示环境将模拟 ${partner.name} 的确认。`);
  window.setTimeout(() => {
    const freshBooking = getBooking(booking.id);
    if (freshBooking?.status === "pending") {
      acceptBooking(booking.id, true);
      showToast(`${partner.name} 已确认你的约课请求`);
    }
  }, 1200);
}

function acceptBooking(bookingId, automatic = false) {
  const booking = getBooking(bookingId);
  if (!booking || !["incoming", "pending"].includes(booking.status)) return;
  const partner = getPartner(booking.partnerId);
  booking.status = "confirmed";
  booking.sessions.forEach((session) => {
    if (session.status === "pending") session.status = "confirmed";
  });
  if (booking.coinTransactionId) {
    const transaction = state.wallet.find((item) => item.id === booking.coinTransactionId);
    if (transaction) {
      transaction.detail = `已确认 · ${formatWhen(booking.sessions[0].when)}`;
      transaction.status = "已锁定";
    }
  }
  addMessage(partner.id, "partner", `太好了，${booking.mode === "swap" ? "这次互换" : "这节课"}已确认。我们按约定的时间线上见。`, true);
  addNotification({
    type: "confirmed",
    title: `${partner.name} 已确认约课`,
    body: `${booking.mode === "swap" ? "双向技能互换" : "技能币约课"}已进入日程。`,
    bookingId: booking.id,
    partnerId: partner.id,
  });
  saveState();
  render();
  if (!automatic) showToast("已接受邀请，双方约课已进入日程");
}

function refundBooking(booking, reason) {
  if (!booking.coinTransactionId || booking.refunded) return;
  const original = state.wallet.find((item) => item.id === booking.coinTransactionId);
  if (!original) return;
  booking.refunded = true;
  original.status = "已退款";
  original.detail = reason;
  state.coinBalance += Math.abs(original.amount);
  state.wallet.unshift({
    id: createId("ledger"),
    kind: "refund",
    title: `退款 · ${booking.requestedSkill}`,
    detail: reason,
    amount: Math.abs(original.amount),
    status: "已退回",
    bookingId: booking.id,
  });
}

function declineBooking(bookingId) {
  const booking = getBooking(bookingId);
  if (!booking || !["incoming", "pending"].includes(booking.status)) return;
  const partner = getPartner(booking.partnerId);
  booking.status = "declined";
  booking.sessions.forEach((session) => { session.status = "cancelled"; });
  if (booking.requester === "user") refundBooking(booking, "对方未能确认，技能币已退回");
  addMessage(partner.id, "system", "本次约课未确认，已结束协商。");
  addNotification({ type: "declined", title: "约课未确认", body: `与 ${partner.name} 的这次约课没有进入日程。`, bookingId, partnerId: partner.id });
  saveState();
  render();
  showToast("已结束这次约课协商");
}

function cancelBooking(bookingId) {
  const booking = getBooking(bookingId);
  if (!booking || !["incoming", "pending", "confirmed", "live"].includes(booking.status)) return;
  const partner = getPartner(booking.partnerId);
  booking.status = "cancelled";
  booking.sessions.forEach((session) => {
    if (session.status !== "completed") session.status = "cancelled";
  });
  refundBooking(booking, "你已取消约课，技能币已退回");
  addMessage(partner.id, "system", "本次约课已取消。");
  addNotification({ type: "cancelled", title: "约课已取消", body: `与 ${partner.name} 的约课已从日程移除。`, bookingId, partnerId: partner.id });
  saveState();
  render();
  showToast("约课已取消，相关技能币已处理");
}

function launchSession(bookingId, sessionId) {
  const booking = getBooking(bookingId);
  const session = booking?.sessions.find((item) => item.id === sessionId);
  if (!booking || !session || session.status !== "confirmed") return;
  session.status = "live";
  booking.status = "live";
  saveState();
  render();
  showToast("约课已开始。结束后请双方确认完成。");
}

function completeSession(bookingId, sessionId) {
  const booking = getBooking(bookingId);
  const session = booking?.sessions.find((item) => item.id === sessionId);
  if (!booking || !session || session.status !== "live") return;
  const partner = getPartner(booking.partnerId);
  session.status = "completed";
  const allCompleted = booking.sessions.every((item) => item.status === "completed");
  if (allCompleted) {
    booking.status = "completed";
    if (booking.mode === "coin" && booking.coinTransactionId) {
      const transaction = state.wallet.find((item) => item.id === booking.coinTransactionId);
      if (transaction) {
        transaction.status = "已结算";
        transaction.detail = "课程已完成 · 已结算";
      }
    }
    if (booking.mode === "swap" && !booking.rewarded) {
      booking.rewarded = true;
      state.coinBalance += 8;
      state.wallet.unshift({
        id: createId("ledger"),
        kind: "earn",
        title: "守约奖励 · 技能互换",
        detail: `与 ${partner.name} 的互换已完成`,
        amount: 8,
        status: "已结算",
        bookingId: booking.id,
      });
    }
    addMessage(partner.id, "system", "这次技能交换已完成，欢迎留下真实评价。");
    addNotification({ type: "completed", title: "交换已完成", body: `和 ${partner.name} 的学习已结算，留下评价可以完善信用档案。`, bookingId: booking.id, partnerId: partner.id });
    saveState();
    render();
    openModal("review", { bookingId: booking.id });
    showToast("全部课程已完成，已更新你的技能币和信用记录");
  } else {
    booking.status = "confirmed";
    addNotification({ type: "completed", title: "第一节已完成", body: "完成剩余互换课程后即可获得守约奖励。", bookingId: booking.id, partnerId: partner.id });
    saveState();
    render();
    showToast("已确认本节完成，下一节仍在日程中");
  }
}

function submitReview(form) {
  const booking = getBooking(form.dataset.bookingId);
  if (!booking || booking.reviewed) return;
  const partner = getPartner(booking.partnerId);
  const comment = String(new FormData(form).get("comment") || "").trim();
  if (!comment) return;
  booking.reviewed = true;
  state.reviews.unshift({
    id: createId("review"),
    bookingId: booking.id,
    partnerId: booking.partnerId,
    rating: ui.rating,
    comment,
    time: "刚刚",
  });
  state.profile.credit = Math.min(5, Math.max(4.5, state.profile.credit + 0.02));
  addNotification({ type: "completed", title: "评价已提交", body: `你与 ${partner.name} 的交换记录已沉淀到信用档案。`, bookingId: booking.id, partnerId: partner.id });
  saveState();
  closeModal();
  render();
  showToast("感谢反馈，信用档案已更新");
}

function submitReschedule(form) {
  const booking = getBooking(form.dataset.bookingId);
  if (!booking) return;
  const formData = new FormData(form);
  const session = booking.sessions.find((item) => item.id === formData.get("sessionId"));
  const partner = getPartner(booking.partnerId);
  if (!session) return;
  session.when = String(formData.get("when"));
  session.status = "pending";
  booking.status = "pending";
  addMessage(partner.id, "user", `我想把「${session.skill}」调整到 ${formatWhen(session.when)}，这个时间你方便吗？`);
  addNotification({ type: "pending", title: "改期请求已发送", body: `正在等待 ${partner.name} 确认新的时段。`, bookingId: booking.id, partnerId: partner.id });
  saveState();
  closeModal();
  render();
  showToast("改期请求已发送。演示环境会模拟对方确认。");
  window.setTimeout(() => {
    const freshBooking = getBooking(booking.id);
    if (freshBooking?.status === "pending") {
      acceptBooking(freshBooking.id, true);
      showToast(`${partner.name} 已确认新的时间`);
    }
  }, 900);
}

function submitSkill(form) {
  const formData = new FormData(form);
  const targetType = String(formData.get("type"));
  const originalType = form.dataset.originalType;
  const skillId = form.dataset.skillId;
  const list = originalType === "teach" ? state.profile.canTeach : state.profile.wantToLearn;
  const record = {
    id: skillId || createId("skill"),
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    level: String(formData.get("level") || "入门"),
    duration: String(formData.get("duration") || "60 分钟"),
    description: String(formData.get("description") || "").trim(),
    modes: targetType === "teach" ? formData.getAll("modes") : [],
  };
  if (!record.name || !record.category) {
    showToast("请补充技能名称和分类");
    return;
  }
  if (skillId) {
    const index = list.findIndex((skill) => skill.id === skillId);
    if (index >= 0) list.splice(index, 1);
  }
  const destination = targetType === "teach" ? state.profile.canTeach : state.profile.wantToLearn;
  destination.push(record);
  saveState();
  closeModal();
  setView("profile");
  showToast(skillId ? `「${record.name}」已更新` : `「${record.name}」已发布到你的技能档案`);
}

function submitProfile(form) {
  const formData = new FormData(form);
  state.profile.name = String(formData.get("name") || "").trim();
  state.profile.city = String(formData.get("city") || "").trim();
  state.profile.bio = String(formData.get("bio") || "").trim();
  saveState();
  closeModal();
  render();
  showToast("个人资料已更新");
}

function submitMessage(form) {
  const partnerId = form.dataset.partnerId;
  const input = form.querySelector("input[name='message']");
  const text = input.value.trim();
  if (!text) return;
  addMessage(partnerId, "user", text);
  saveState();
  render();
  const partner = getPartner(partnerId);
  window.setTimeout(() => {
    const reply = `收到，我看到了。${partner.name} 会在这个对话里和你一起把目标和时段确认清楚。`;
    addMessage(partnerId, "partner", reply, true);
    addNotification({ type: "message-circle", title: `${partner.name} 回复了你`, body: reply, partnerId });
    saveState();
    render();
  }, 700);
}

function removeSkill(type, skillId) {
  const list = type === "teach" ? state.profile.canTeach : state.profile.wantToLearn;
  if (list.length <= 1) {
    showToast("至少保留一项技能，才能让匹配继续工作");
    return;
  }
  const index = list.findIndex((skill) => skill.id === skillId);
  if (index < 0) return;
  const [removed] = list.splice(index, 1);
  saveState();
  render();
  showToast(`已从档案中移除「${removed.name}」`);
}

function openConfirmFor(action, payload) {
  const configs = {
    "cancel-booking": {
      title: "确认取消这次约课？",
      body: "未完成的课程会从日程中移除；使用技能币的约课会自动退回锁定金额。",
      actionLabel: "取消约课",
      danger: true,
    },
    "decline-booking": {
      title: "确认婉拒这次邀请？",
      body: "对方会收到本次互换未确认的通知，你可以之后再发起新的邀请。",
      actionLabel: "婉拒邀请",
      danger: true,
    },
    "remove-skill": {
      title: "确认删除这项技能？",
      body: "删除后它不会再参与智能匹配，已有约课不会受影响。",
      actionLabel: "删除技能",
      danger: true,
    },
    "reset-demo": {
      title: "重置所有演示数据？",
      body: "技能、约课、聊天、钱包和评价都会恢复到首次体验时的状态。",
      actionLabel: "重置数据",
      danger: true,
    },
  };
  openModal("confirm", { action, ...payload, ...configs[action] });
}

function handleConfirmAction(action) {
  const modal = ui.modal;
  closeModal();
  if (action === "cancel-booking") cancelBooking(modal.bookingId);
  if (action === "decline-booking") declineBooking(modal.bookingId);
  if (action === "remove-skill") removeSkill(modal.skillType, modal.skillId);
  if (action === "reset-demo") {
    state = createDefaultState();
    saveState();
    ui.view = "discover";
    ui.search = "";
    ui.matchFilter = "all";
    ui.scheduleFilter = "all";
    ui.activeConversation = "heyu";
    dom.search.value = "";
    render();
    showToast("演示数据已恢复为初始状态");
  }
}

function handleClick(event) {
  const viewTrigger = event.target.closest("[data-view]");
  if (viewTrigger) {
    event.preventDefault();
    setView(viewTrigger.dataset.view);
    return;
  }

  const actionTrigger = event.target.closest("[data-action]");
  if (!actionTrigger) return;
  const { action } = actionTrigger.dataset;
  const partnerId = actionTrigger.dataset.partnerId;
  const bookingId = actionTrigger.dataset.bookingId;

  if (action === "toggle-notifications") {
    ui.notificationOpen = !ui.notificationOpen;
    renderNotificationMenu();
    createIcons();
    return;
  }
  if (action === "mark-notifications-read") {
    state.notifications.forEach((notification) => { notification.read = true; });
    saveState();
    render();
    return;
  }
  if (action === "open-notification") {
    const notification = state.notifications.find((item) => item.id === actionTrigger.dataset.notificationId);
    if (!notification) return;
    notification.read = true;
    saveState();
    ui.notificationOpen = false;
    if (notification.bookingId) {
      ui.scheduleFilter = "all";
      setView("schedule");
      window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${notification.bookingId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } else if (notification.partnerId) {
      ui.activeConversation = notification.partnerId;
      setView("messages");
    } else {
      render();
    }
    return;
  }
  if (action === "open-skill-form") {
    openModal("skill", { skillType: actionTrigger.dataset.skillType || "teach" });
    return;
  }
  if (action === "edit-skill") {
    openModal("skill", { skillType: actionTrigger.dataset.skillType, skillId: actionTrigger.dataset.skillId });
    return;
  }
  if (action === "remove-skill") {
    openConfirmFor("remove-skill", { skillType: actionTrigger.dataset.skillType, skillId: actionTrigger.dataset.skillId });
    return;
  }
  if (action === "edit-profile") {
    openModal("profile");
    return;
  }
  if (action === "open-request") {
    const activeBooking = getActiveBooking(partnerId);
    if (activeBooking) {
      setView("schedule");
      window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${activeBooking.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } else {
      openModal("request", { partnerId });
    }
    return;
  }
  if (action === "view-booking") {
    setView("schedule");
    window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${bookingId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return;
  }
  if (action === "open-chat") {
    if (dom.modal.open) closeModal();
    openChat(partnerId);
    return;
  }
  if (action === "close-chat") {
    closeChat();
    return;
  }
  if (action === "select-conversation") {
    ui.activeConversation = partnerId;
    markConversationRead(partnerId);
    render();
    return;
  }
  if (action === "set-match-filter") {
    ui.matchFilter = actionTrigger.dataset.filter;
    render();
    return;
  }
  if (action === "refresh-matches") {
    partners.sort((left, right) => getMatchScore(right) - getMatchScore(left));
    render();
    showToast("已根据最新技能档案重新计算匹配");
    return;
  }
  if (action === "clear-search") {
    ui.search = "";
    dom.search.value = "";
    render();
    return;
  }
  if (action === "set-schedule-filter") {
    ui.scheduleFilter = actionTrigger.dataset.filter;
    render();
    return;
  }
  if (action === "accept-booking") {
    acceptBooking(bookingId);
    return;
  }
  if (action === "simulate-accept") {
    acceptBooking(bookingId, true);
    showToast("已模拟对方确认，约课进入日程");
    return;
  }
  if (action === "decline-booking") {
    openConfirmFor("decline-booking", { bookingId });
    return;
  }
  if (action === "cancel-booking") {
    openConfirmFor("cancel-booking", { bookingId });
    return;
  }
  if (action === "reschedule-booking") {
    const booking = getBooking(bookingId);
    if (booking?.sessions.some((session) => session.status === "confirmed")) openModal("reschedule", { bookingId });
    else showToast("当前没有可调整的已确认时段");
    return;
  }
  if (action === "launch-session") {
    launchSession(bookingId, actionTrigger.dataset.sessionId);
    return;
  }
  if (action === "complete-session") {
    completeSession(bookingId, actionTrigger.dataset.sessionId);
    return;
  }
  if (action === "open-review") {
    openModal("review", { bookingId });
    return;
  }
  if (action === "set-request-mode") {
    ui.request.mode = actionTrigger.dataset.mode;
    renderModalContent();
    return;
  }
  if (action === "pick-request-slot") {
    ui.request[actionTrigger.dataset.slotGroup] = actionTrigger.dataset.slot;
    renderModalContent();
    return;
  }
  if (action === "set-rating") {
    ui.rating = Number(actionTrigger.dataset.rating);
    renderModalContent();
    return;
  }
  if (action === "close-modal") {
    closeModal();
    return;
  }
  if (action === "confirm-modal-action") {
    handleConfirmAction(actionTrigger.dataset.confirmAction);
    return;
  }
  if (action === "reset-demo") {
    openConfirmFor("reset-demo", {});
    return;
  }
  if (action === "select-agenda-date") {
    showToast(`${actionTrigger.dataset.day} 日的日程已定位，可在“我的约课”中查看详情`);
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (form.id === "requestForm") submitRequest(form);
  if (form.id === "skillForm") submitSkill(form);
  if (form.id === "profileForm") submitProfile(form);
  if (form.id === "reviewForm") submitReview(form);
  if (form.id === "rescheduleForm") submitReschedule(form);
  if (form.id === "messageForm" || form.id === "drawerMessageForm") submitMessage(form);
}

function handleInput(event) {
  if (event.target.id !== "skillSearch") return;
  ui.search = event.target.value;
  if (ui.search && !["discover", "matches"].includes(ui.view)) ui.view = "matches";
  render();
}

function handleKeydown(event) {
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
    event.preventDefault();
    dom.search.focus();
  }
  if (event.key === "Escape" && ui.chatPartnerId) closeChat();
}

document.addEventListener("click", handleClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);
document.addEventListener("keydown", handleKeydown);
dom.scrim.addEventListener("click", closeChat);
dom.modal.addEventListener("close", () => {
  ui.modal = null;
  ui.request = null;
  document.body.classList.remove("modal-open");
});

render();
