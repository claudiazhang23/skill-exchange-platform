const state = {
  data: null,
  view: "discover",
  query: "",
  matchFilter: "all",
  scheduleFilter: "all",
  activePartnerId: null,
  conversation: null,
  modal: null,
  demoAccounts: [],
  notificationOpen: false,
};

const heroImages = {
  heyu: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
  zhouye: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=85",
  chenmo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  sunqi: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=85",
  linwen: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=85",
};

const bookingLabels = {
  pending: "等待对方确认",
  confirmed: "已确认",
  live: "进行中",
  reschedule_pending: "等待确认改期",
  completed: "已完成",
  cancelled: "已取消",
  declined: "未确认",
};

const notificationIcons = {
  incoming: "inbox",
  confirmed: "calendar-check-2",
  pending: "clock-3",
  live: "video",
  completed: "badge-check",
  declined: "circle-x",
  cancelled: "circle-x",
  message: "message-circle",
  review: "star",
};

const dom = {
  view: document.querySelector("#viewContent"),
  search: document.querySelector("#skillSearch"),
  modal: document.querySelector("#appModal"),
  modalContent: document.querySelector("#modalContent"),
  notificationMenu: document.querySelector("#notificationMenu"),
  toast: document.querySelector("#toast"),
  chatDrawer: document.querySelector("#chatDrawer"),
  scrim: document.querySelector("#scrim"),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconize() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.85 } });
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => dom.toast.classList.remove("show"), 3200);
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "请求没有成功");
    error.status = response.status;
    throw error;
  }
  return body;
}

function matchById(id) {
  return state.data?.matches.find((match) => Number(match.id) === Number(id));
}

function bookingById(id) {
  return state.data?.bookings.find((booking) => Number(booking.id) === Number(id));
}

function activeBookingFor(partnerId) {
  return state.data?.bookings.find(
    (booking) => Number(booking.partnerId) === Number(partnerId) && ["pending", "confirmed", "live", "reschedule_pending"].includes(booking.status),
  );
}

function formatWhen(value) {
  if (!value) return "待协商";
  const date = new Date(`${value.replace(" ", "T")}:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()]} ${value.split(" ")[1]}`;
}

function compactWhen(value) {
  if (!value) return "待协商";
  const date = new Date(`${value.replace(" ", "T")}:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()} ${value.split(" ")[1]}`;
}

function shortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "刚刚";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderModeTags(modes = []) {
  return modes.map((mode) => `<span class="exchange-tag ${mode}"><i data-lucide="${mode === "swap" ? "repeat-2" : "coins"}"></i>${mode === "swap" ? "技能互换" : "技能币"}</span>`).join("");
}

function renderEmpty(title, detail, icon = "search-x") {
  return `<div class="empty-state"><i data-lucide="${icon}"></i><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>`;
}

function snapshotFromResponse(response) {
  if (response?.snapshot) state.data = response.snapshot;
}

async function refresh({ preserveConversation = true } = {}) {
  try {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.matchFilter !== "all") params.set("mode", state.matchFilter);
    state.data = await api(`/api/bootstrap${params.size ? `?${params}` : ""}`);
    document.body.classList.remove("signed-out");
    if (!preserveConversation) state.conversation = null;
    if (state.activePartnerId && !state.data.conversations.some((conversation) => Number(conversation.partner.id) === Number(state.activePartnerId))) {
      state.activePartnerId = state.data.conversations[0]?.partner.id || null;
      state.conversation = null;
    }
    render();
  } catch (error) {
    if (error.status === 401) renderAuth();
    else renderFatal(error.message);
  }
}

function renderFatal(message) {
  document.body.classList.add("signed-out");
  const openedAsFile = window.location.protocol === "file:";
  const title = openedAsFile ? "请通过本地服务打开平台" : "暂时无法加载平台";
  const detail = openedAsFile ? "你当前是直接打开 index.html 文件。完整平台需要 Node 服务端提供登录、匹配、聊天和约课接口。请在项目目录运行 npm start，再打开下面的本地地址。" : message;
  dom.view.innerHTML = `<section class="auth-page"><div class="auth-card"><span class="auth-mark"><i data-lucide="circle-alert"></i></span><h1>${title}</h1><p>${escapeHtml(detail)}</p>${openedAsFile ? '<div class="server-guide"><code>npm start</code><a href="http://127.0.0.1:3000">打开 http://127.0.0.1:3000</a></div>' : ""}<button class="primary-button" type="button" data-action="retry-load"><i data-lucide="refresh-cw"></i>重新连接</button></div></section>`;
  iconize();
}

async function renderAuth() {
  document.body.classList.add("signed-out");
  if (!state.demoAccounts.length) {
    try {
      state.demoAccounts = (await api("/api/demo-accounts")).accounts;
    } catch (error) {
      renderFatal("服务端尚未启动。请在项目目录执行 npm start。");
      return;
    }
  }
  dom.view.innerHTML = `
    <section class="auth-page">
      <div class="auth-intro"><a class="auth-brand" href="#"><span class="brand-mark"><i data-lucide="repeat-2"></i></span>换技</a><span class="eyebrow"><i data-lucide="sparkles"></i>线上技能互换平台</span><h1>让每一项能力，找到下一位需要它的人。</h1><p>发布你能教的，也写下你想学的。匹配、聊天、约课、技能币和互评都在一个真实的账号体系里完成。</p><div class="auth-points"><span><i data-lucide="repeat-2"></i>双向技能互换</span><span><i data-lucide="coins"></i>受控技能币账本</span><span><i data-lucide="shield-check"></i>信用与评价</span></div></div>
      <div class="auth-card" id="authCard">
        <div class="auth-tabs"><button class="active" type="button" data-action="auth-tab" data-tab="login">登录</button><button type="button" data-action="auth-tab" data-tab="register">注册</button></div>
        <div id="authFormArea">${renderLoginForm()}</div>
      </div>
    </section>`;
  iconize();
}

function renderLoginForm() {
  return `
    <div class="auth-form-head"><h2>欢迎回来</h2><p>登录后继续管理你的技能交换。</p></div>
    <form id="loginForm" class="auth-form"><label>邮箱<input name="email" type="email" value="linan@huanji.local" autocomplete="email" required /></label><label>密码<input name="password" type="password" value="demo1234" autocomplete="current-password" required /></label><button class="primary-button full-button" type="submit">登录换技 <i data-lucide="arrow-right"></i></button></form>
    <div class="demo-accounts"><div><strong>演示账号</strong><span>密码均为 <code>demo1234</code></span></div>${state.demoAccounts.map((account) => `<button type="button" data-action="demo-login" data-email="${escapeHtml(account.email)}"><span><b>${escapeHtml(account.name)}</b><small>${escapeHtml(account.headline)}</small></span><i data-lucide="arrow-up-right"></i></button>`).join("")}</div>`;
}

function renderRegisterForm() {
  return `
    <div class="auth-form-head"><h2>创建你的技能档案</h2><p>先用一个昵称和邮箱开始，之后可以继续完善技能卡。</p></div>
    <form id="registerForm" class="auth-form"><label>昵称<input name="name" maxlength="20" autocomplete="name" required /></label><label>邮箱<input name="email" type="email" autocomplete="email" required /></label><label>密码<input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="至少 8 位" required /></label><button class="primary-button full-button" type="submit">创建账号 <i data-lucide="arrow-right"></i></button></form>`;
}

function renderChrome() {
  const { user, stats } = state.data;
  document.querySelector("#sideCoinBalance").textContent = user.coinBalance;
  document.querySelector("#sideProfileName").textContent = user.name;
  document.querySelector("#sideProfileAvatar").src = user.avatar;
  document.querySelector("#sideProfileAvatar").alt = user.name;
  document.querySelector("#matchNavBadge").textContent = state.data.matches.length;
  const messageBadge = document.querySelector("#messageNavBadge");
  messageBadge.textContent = stats.unreadMessages;
  messageBadge.hidden = stats.unreadMessages === 0;
  const scheduleBadge = document.querySelector("#scheduleNavBadge");
  const pendingCount = state.data.bookings.filter((booking) => booking.status === "pending" && booking.canAccept).length;
  scheduleBadge.textContent = pendingCount;
  scheduleBadge.hidden = pendingCount === 0;
  document.querySelector("#notificationDot").hidden = stats.unreadNotifications === 0;
  document.querySelectorAll(".nav-item[data-view], .mobile-nav [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
}

function renderSkillToken(skill, type, removable = false) {
  return `<span class="skill-token ${type}">${escapeHtml(skill.name)}${removable ? `<button type="button" data-action="confirm-delete-skill" data-skill-id="${skill.id}" aria-label="删除 ${escapeHtml(skill.name)}" title="删除"><i data-lucide="x"></i></button>` : ""}</span>`;
}

function renderProfileSnapshot() {
  const { user } = state.data;
  return `
    <section class="profile-snapshot panel">
      <div class="skill-group teaches"><div class="skill-group-head"><span><i data-lucide="badge-check"></i>我能教</span><button class="text-button" type="button" data-view="profile">管理</button></div><div class="skill-token-list">${user.canTeach.map((skill) => renderSkillToken(skill, "teach", true)).join("")}<button class="skill-token add-skill-token" type="button" data-action="open-skill-modal" data-skill-type="teach" aria-label="新增能教的技能" title="新增能教的技能"><i data-lucide="plus"></i></button></div></div>
      <div class="divider"></div>
      <div class="skill-group learns"><div class="skill-group-head"><span><i data-lucide="graduation-cap"></i>我想学</span><button class="text-button" type="button" data-view="profile">管理</button></div><div class="skill-token-list">${user.wantToLearn.map((skill) => renderSkillToken(skill, "learn", true)).join("")}<button class="skill-token add-skill-token" type="button" data-action="open-skill-modal" data-skill-type="learn" aria-label="新增想学的技能" title="新增想学的技能"><i data-lucide="plus"></i></button></div></div>
    </section>`;
}

function renderMatchCard(match, detailed = false) {
  const booking = activeBookingFor(match.id);
  const hero = heroImages[match.name === "何雨" ? "heyu" : match.name === "周野" ? "zhouye" : match.name === "陈默" ? "chenmo" : match.name === "孙祺" ? "sunqi" : "linwen"] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85";
  const skill = match.highlightedSkill || match.teaches[0];
  const action = booking ? "view-booking" : "open-request";
  return `
    <article class="partner-card">
      <div class="partner-cover"><img src="${hero}" alt="${escapeHtml(skill?.name || "技能")}课程画面" /><span class="online-tag"><i data-lucide="video"></i>在线实时</span></div>
      <div class="partner-body">
        <div class="person-line"><img src="${match.avatar}" alt="${escapeHtml(match.name)}" /><div><strong>${escapeHtml(match.name)}</strong><small>${escapeHtml(match.headline)}</small></div><span class="online-dot" title="可在线沟通"></span></div>
        <h3>${escapeHtml(skill?.name || "技能交流")}</h3><p>${escapeHtml(skill?.description || match.bio)}</p>
        ${detailed ? `<div class="match-detail-list">${match.reasons.slice(0, 2).map((reason) => `<div><i data-lucide="check"></i>${escapeHtml(reason)}</div>`).join("")}</div>` : ""}
        <div class="card-detail-row"><div class="exchange-tags">${renderModeTags(match.modes)}</div><span class="match-percent">${match.score}%</span></div>
      </div>
      <footer class="partner-card-footer"><span>${booking ? bookingLabels[booking.status] : match.commonSlots.length ? `${match.commonSlots.length} 个共同可约时段` : "可先聊聊时段"}</span><button type="button" data-action="${action}" data-partner-id="${match.id}"${booking ? ` data-booking-id="${booking.id}"` : ""}>${booking ? "查看约课" : "发起交换"}<i data-lucide="arrow-up-right"></i></button></footer>
    </article>`;
}

function getUpcomingSessions() {
  return state.data.bookings
    .flatMap((booking) => booking.sessions.map((session) => ({ booking, session })))
    .filter(({ session }) => ["scheduled", "live", "completion_pending"].includes(session.status))
    .sort((left, right) => left.session.startAt.localeCompare(right.session.startAt));
}

function renderAgendaPanel() {
  const sessions = getUpcomingSessions().slice(0, 2);
  return `
    <section class="agenda-panel panel"><div class="panel-heading"><div><span class="section-kicker">我的约课</span><h2>接下来</h2></div><button class="icon-button" type="button" data-view="schedule" aria-label="查看完整日程" title="查看完整日程"><i data-lucide="calendar-days"></i></button></div>
      <div class="date-strip">${[0, 1, 2, 3, 4].map((offset) => { const date = new Date(); date.setDate(date.getDate() + offset - 2); const label = offset === 2 ? "今天" : ["周日","周一","周二","周三","周四","周五","周六"][date.getDay()]; return `<button class="${offset === 2 ? "selected" : ""}" type="button" data-view="schedule"><small>${label}</small><strong>${date.getDate()}</strong></button>`; }).join("")}</div>
      <div class="agenda-list">${sessions.length ? sessions.map(({ booking, session }) => `<article class="agenda-item ${session.kind}"><time>${session.startAt.split(" ")[1]}</time><div><span>${session.kind === "teach" ? "教：" : "学："}${escapeHtml(session.skill)}</span><small>与 ${escapeHtml(booking.partner.name)} · 在线</small></div><img src="${booking.partner.avatar}" alt="${escapeHtml(booking.partner.name)}" /></article>`).join("") : '<div class="notification-empty"><i data-lucide="calendar-x"></i>还没有已确认的约课</div>'}</div>
      <button class="text-button full-width-link" type="button" data-view="schedule">查看全部约课 <i data-lucide="arrow-right"></i></button>
    </section>`;
}

function renderWalletSummary() {
  const earned = state.data.wallet.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
  const locked = state.data.wallet.filter((entry) => entry.status === "locked").reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  return `<section class="wallet-summary panel"><div class="wallet-summary-top"><span><i data-lucide="wallet-cards"></i>技能钱包</span><button class="icon-button" type="button" data-view="wallet" aria-label="打开技能钱包" title="打开技能钱包"><i data-lucide="arrow-up-right"></i></button></div><div class="wallet-amount"><strong>${state.data.user.coinBalance}</strong><span>技能币</span></div><div class="wallet-stats"><span><small>累计获得</small><b>+${earned}</b></span><span><small>当前锁定</small><b>${locked}</b></span></div></section>`;
}

function renderTrustSummary() {
  return `<section class="trust-summary panel"><div class="trust-score"><span>信用分</span><strong>${Number(state.data.user.credit).toFixed(1)}</strong><i data-lucide="star"></i></div><p>完成 ${state.data.stats.completedCount} 次守约交换<br />评价与守约记录都在服务端留痕</p><button type="button" data-view="profile">查看信用档案 <i data-lucide="arrow-up-right"></i></button></section>`;
}

function partnerImage(match) {
  const key = match.name === "何雨" ? "heyu" : match.name === "周野" ? "zhouye" : match.name === "陈默" ? "chenmo" : match.name === "孙祺" ? "sunqi" : "linwen";
  return heroImages[key] || heroImages.chenmo;
}

function renderTasteHero(matches) {
  const lead = matches[0];
  const wanted = state.data.user.wantToLearn[0]?.name || "新技能";
  const leadSkill = lead?.highlightedSkill?.name || "适合你的技能";
  return `<section class="taste-hero">
    <div class="taste-hero-copy">
      <span class="eyebrow"><i data-lucide="sun-medium"></i>今天，适合交换一点新能力</span>
      <h1><span class="hero-line">把会的，<span class="hero-inline-image" style="background-image:url('${partnerImage(lead || { name: "chenmo" })}')" aria-hidden="true"></span></span><span class="hero-line">换成想学的。</span></h1>
      <p>你正在寻找「${escapeHtml(wanted)}」。换技把学习目标、可教技能与共同可约时间放在同一张桌面上。</p>
      <div class="taste-hero-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="sparkles"></i>查看 ${escapeHtml(leadSkill)} 匹配</button><button class="outline-button" type="button" data-action="open-skill-modal" data-skill-type="teach"><i data-lucide="plus"></i>发布我能教的</button></div>
      <div class="taste-hero-note"><span class="hero-note-line"></span><span>匹配由技能互补与共同可约时间实时计算</span></div>
    </div>
    <div class="taste-hero-visual" aria-label="技能交换中的学习伙伴">
      <img src="${partnerImage(lead || { name: "chenmo" })}" alt="${escapeHtml(lead?.name || "技能伙伴")} 的技能课程" />
      <div class="taste-hero-caption"><span><i data-lucide="sparkles"></i>当前最合适的起点</span><strong>${escapeHtml(lead?.name || "技能伙伴")} · ${escapeHtml(leadSkill)}</strong><small>${escapeHtml(lead?.reasons?.[0] || "根据你的学习目标推荐")}</small></div>
    </div>
  </section>`;
}

function renderSkillMarquee() {
  const names = [...state.data.user.canTeach.map((skill) => skill.name), ...state.data.user.wantToLearn.map((skill) => skill.name)];
  const items = names.length ? names : ["人像摄影", "Python 自动化", "演示表达", "Notion 整理"];
  const row = [...items, ...items].map((name, index) => `<span class="marquee-item"><i data-lucide="${index % 2 ? "arrow-up-right" : "sparkle"}"></i>${escapeHtml(name)}</span>`).join("");
  return `<div class="skill-marquee" aria-label="我的技能方向"><div class="skill-marquee-track">${row}</div></div>`;
}

function renderFocusAccordion(matches) {
  const focusMatches = matches.slice(0, 3);
  if (!focusMatches.length) return "";
  return `<section class="focus-section"><div class="section-title"><div><span class="section-kicker">先从一个具体目标开始</span><h2>一眼看懂，下一步学什么。</h2></div><button class="text-button" type="button" data-view="matches">浏览全部 <i data-lucide="arrow-right"></i></button></div><div class="focus-accordion">${focusMatches.map((match, index) => { const skill = match.highlightedSkill || match.teaches[0]; return `<article class="focus-accordion-item ${index === 0 ? "is-open" : ""}" data-action="open-request" data-partner-id="${match.id}"><div class="focus-accordion-image"><img src="${partnerImage(match)}" alt="${escapeHtml(skill.name)}" /></div><div class="focus-accordion-copy"><span>${escapeHtml(match.name)} · ${match.score}% 匹配</span><h3>${escapeHtml(skill.name)}</h3><p>${escapeHtml(skill.description || match.bio)}</p><strong>查看交换方案 <i data-lucide="arrow-up-right"></i></strong></div></article>`; }).join("")}</div></section>`;
}

function renderDiscover() {
  const matches = state.data.matches.slice(0, 4);
  const incoming = state.data.bookings.find((booking) => booking.canAccept);
  const journey = incoming
    ? `<section class="journey-banner"><div class="journey-icon"><i data-lucide="inbox"></i></div><div><h2>${escapeHtml(incoming.partner.name)} 向你发来技能互换邀请</h2><p>她希望用 ${escapeHtml(incoming.requestedSkillName)} 与你的 ${escapeHtml(incoming.offerSkillName)} 开始一次线上互换。</p></div><button class="secondary-button" type="button" data-view="schedule">处理邀请 <i data-lucide="arrow-right"></i></button></section>`
    : `<section class="journey-banner"><div class="journey-icon"><i data-lucide="target"></i></div><div><h2>从一条技能卡开始，完成一次真实交换</h2><p>发布技能、选中搭档、共同确认时段；每一步都会写入你的约课和信用记录。</p></div><button class="secondary-button" type="button" data-view="matches">开始匹配 <i data-lucide="arrow-right"></i></button></section>`;
  return `
    <section class="page">${renderTasteHero(matches)}${renderSkillMarquee()}<div class="dashboard-layout"><div class="main-column">${renderProfileSnapshot()}${journey}${renderFocusAccordion(matches)}<section class="discovery-section"><div class="section-title"><div><span class="section-kicker">为你推荐</span><h2>今天的高质量匹配 <span>${state.data.matches.length}</span></h2></div><button class="text-button" type="button" data-view="matches">查看全部 <i data-lucide="arrow-right"></i></button></div>${matches.length ? `<div class="match-grid">${matches.map((match) => renderMatchCard(match)).join("")}</div>` : renderEmpty("先补充一个学习目标", "发布想学的技能后，系统会立即生成匹配。", "sparkles")}</section></div><aside class="right-column">${renderAgendaPanel()}${renderWalletSummary()}${renderTrustSummary()}</aside></div></section>`;
}

function renderMatches() {
  const matches = state.data.matches;
  return `
    <section class="page"><header class="page-heading"><div><span class="eyebrow"><i data-lucide="sparkles"></i>动态匹配</span><h1>更适合开始的技能搭档。</h1><p>匹配度会综合你能教、想学、对方的技能卡和共同可约时间。更新档案后会从数据库重新计算。</p></div><div class="page-heading-actions"><button class="outline-button" type="button" data-action="clear-search"${state.query ? "" : " disabled"}><i data-lucide="x"></i>清除搜索</button><button class="primary-button" type="button" data-action="open-skill-modal" data-skill-type="learn"><i data-lucide="plus"></i>添加想学</button></div></header><section class="match-explainer"><div><i data-lucide="graduation-cap"></i><strong>学习目标</strong><span>优先匹配能教你目标技能的人。</span></div><div><i data-lucide="repeat-2"></i><strong>互换互补</strong><span>你会的正好是对方想学的，排名更靠前。</span></div><div><i data-lucide="calendar-clock"></i><strong>共同可约</strong><span>服务端只允许双方空闲的时段进入约课。</span></div></section><div class="section-title"><div><span class="section-kicker">${state.query ? `“${escapeHtml(state.query)}” 的结果` : "全部结果"}</span><h2>共找到 <span>${matches.length}</span> 位搭档</h2></div></div><div class="filter-row"><button class="filter-button ${state.matchFilter === "all" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="all">全部 <span class="filter-total">${matches.length}</span></button><button class="filter-button ${state.matchFilter === "swap" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="swap"><i data-lucide="repeat-2"></i>可互换</button><button class="filter-button ${state.matchFilter === "coin" ? "active" : ""}" type="button" data-action="set-match-filter" data-filter="coin"><i data-lucide="coins"></i>技能币</button><button class="filter-button right" type="button" data-action="refresh-data"><i data-lucide="refresh-cw"></i>重新计算</button></div>${matches.length ? `<div class="match-grid" style="margin-top:16px">${matches.map((match) => renderMatchCard(match, true)).join("")}</div>` : renderEmpty("没有找到对应的技能", "换一个关键词，或者发布新的学习目标。")}</section>`;
}

async function openConversation(partnerId) {
  state.activePartnerId = Number(partnerId);
  state.conversation = await api(`/api/conversations/${partnerId}`);
  await refresh({ preserveConversation: true });
  state.conversation = await api(`/api/conversations/${partnerId}`);
  render();
}

function renderMessages() {
  const conversations = state.data.conversations;
  const activeId = state.activePartnerId || conversations[0]?.partner.id;
  const activeConversation = state.conversation && Number(state.conversation.partner.id) === Number(activeId) ? state.conversation : null;
  return `
    <section class="page"><header class="page-heading"><div><span class="eyebrow"><i data-lucide="message-circle"></i>开始对话</span><h1>用聊天把交换约具体。</h1><p>确认学习目标、互换内容和时段后，再由对方账号真实确认约课请求。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="sparkles"></i>发现搭档</button></div></header><div class="messages-layout"><aside class="conversation-list"><div class="conversation-list-heading"><h2>消息</h2><span>${state.data.stats.unreadMessages} 条未读</span></div>${conversations.length ? conversations.map((conversation) => `<button class="conversation-button ${Number(conversation.partner.id) === Number(activeId) ? "active" : ""}" type="button" data-action="select-conversation" data-partner-id="${conversation.partner.id}"><img src="${conversation.partner.avatar}" alt="${escapeHtml(conversation.partner.name)}" /><div><span><strong>${escapeHtml(conversation.partner.name)}</strong>${conversation.unreadCount ? '<i class="unread-dot"></i>' : ""}</span><small>${escapeHtml(conversation.lastMessage?.body || "关于技能交换聊一聊")}</small></div></button>`).join("") : `<div class="notification-empty"><i data-lucide="message-circle"></i>还没有消息<br />从匹配页发起一次交换吧</div>`}</aside>${renderMessagePane(activeConversation, activeId)}</div></section>`;
}

function renderMessagePane(conversation, activeId) {
  if (!activeId) return `<section class="message-pane"><div class="empty-state"><i data-lucide="message-square-dashed"></i><strong>选择一位搭档开始聊天</strong><span>沟通目标和时段，再发出正式交换请求。</span></div></section>`;
  const partner = conversation?.partner || state.data.conversations.find((item) => Number(item.partner.id) === Number(activeId))?.partner;
  if (!partner) return `<section class="message-pane">${renderEmpty("对话不可用", "请从匹配页重新发起联系。")}</section>`;
  const messages = conversation?.messages || [];
  const booking = activeBookingFor(partner.id);
  return `<section class="message-pane"><header class="message-pane-head"><div class="message-person"><img src="${partner.avatar}" alt="${escapeHtml(partner.name)}" /><div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.headline)}</small></div></div><button class="text-button" type="button" data-action="${booking ? "view-booking" : "open-request"}" data-partner-id="${partner.id}"${booking ? ` data-booking-id="${booking.id}"` : ""}>${booking ? "查看约课" : "发起交换"}<i data-lucide="arrow-up-right"></i></button></header><div class="match-context"><i data-lucide="sparkles"></i><span>${booking ? `关于「${escapeHtml(booking.requestedSkillName)}」的约课` : "先确认你们的学习目标和共同可约时间"}</span></div><div class="message-stream" id="messageStream">${messages.length ? messages.map((message) => `<div class="message ${message.own ? "user" : "partner"}">${escapeHtml(message.body)}</div>`).join("") : '<div class="message-time">还没有消息，先打个招呼吧。</div>'}</div><form class="message-compose" id="messageForm" data-partner-id="${partner.id}"><input name="body" autocomplete="off" maxlength="400" placeholder="写点什么，聊聊目标和时段..." required /><button class="send-button" type="submit" aria-label="发送消息" title="发送消息"><i data-lucide="send"></i></button></form></section>`;
}

function renderStatus(booking) {
  return `<span class="status-badge ${booking.status}"><i data-lucide="${booking.status === "pending" ? "clock-3" : booking.status === "confirmed" ? "calendar-check-2" : booking.status === "live" ? "video" : booking.status === "completed" ? "badge-check" : booking.status === "reschedule_pending" ? "calendar-clock" : "circle-x"}"></i>${bookingLabels[booking.status]}</span>`;
}

function renderSessionRow(booking, session) {
  let action = "";
  if (session.canStart) action = `<button type="button" data-action="start-session" data-booking-id="${booking.id}" data-session-id="${session.id}"><i data-lucide="video"></i>开始约课</button>`;
  else if (session.canConfirm) action = `<button class="live-action" type="button" data-action="complete-session" data-booking-id="${booking.id}" data-session-id="${session.id}"><i data-lucide="check"></i>确认完成</button>`;
  else if (session.status === "completion_pending") action = `<span class="status-badge pending">等待对方确认</span>`;
  else if (session.status === "completed") action = `<span class="status-badge completed">已完成</span>`;
  else if (session.status === "live") action = `<span class="status-badge live">课程进行中</span>`;
  else if (session.status === "scheduled") action = `<span class="status-badge confirmed">已排期</span>`;
  return `<div class="session-row ${session.kind}"><div class="session-kind"><i data-lucide="${session.kind === "teach" ? "presentation" : "graduation-cap"}"></i></div><div class="session-info"><strong>${session.kind === "teach" ? "你教" : `${escapeHtml(booking.partner.name)} 教`}：${escapeHtml(session.skill)}</strong><span>${formatWhen(session.startAt)}</span></div><div class="session-actions">${action}</div></div>`;
}

function renderBookingCard(booking) {
  const exchangeText = booking.mode === "swap" ? `你教 ${booking.offerSkillName} · 向 ${booking.partner.name} 学 ${booking.requestedSkillName}` : `使用 ${booking.coinAmount} 技能币学习 ${booking.requestedSkillName}`;
  let actions = `<button class="compact-button" type="button" data-action="open-message-view" data-partner-id="${booking.partner.id}"><i data-lucide="message-circle"></i>聊聊</button>`;
  if (booking.canAccept) actions = `<button class="compact-button confirm" type="button" data-action="accept-booking" data-booking-id="${booking.id}"><i data-lucide="check"></i>接受邀请</button><button class="compact-button danger" type="button" data-action="decline-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>婉拒</button>${actions}`;
  if (booking.canCancel) actions = `<button class="compact-button" type="button" data-action="open-reschedule-modal" data-booking-id="${booking.id}"${booking.canRequestReschedule ? "" : " disabled"}><i data-lucide="calendar-pen"></i>改期</button><button class="compact-button danger" type="button" data-action="confirm-cancel-booking" data-booking-id="${booking.id}"><i data-lucide="x"></i>取消</button>${actions}`;
  if (booking.canAcceptReschedule) actions = `<button class="compact-button confirm" type="button" data-action="respond-reschedule" data-booking-id="${booking.id}" data-approved="true"><i data-lucide="check"></i>确认新时段</button><button class="compact-button danger" type="button" data-action="respond-reschedule" data-booking-id="${booking.id}" data-approved="false"><i data-lucide="x"></i>保留原时间</button>${actions}`;
  if (booking.canReview) actions = `<button class="compact-button confirm" type="button" data-action="open-review-modal" data-booking-id="${booking.id}"><i data-lucide="star"></i>留下评价</button>${actions}`;
  return `<article class="booking-card" data-booking-card="${booking.id}"><div class="booking-card-head"><img src="${booking.partner.avatar}" alt="${escapeHtml(booking.partner.name)}" /><div class="booking-card-title"><div><h3>${escapeHtml(booking.partner.name)} · ${booking.mode === "swap" ? "技能互换" : "技能币约课"}</h3>${renderStatus(booking)}</div><p>${escapeHtml(exchangeText)}</p></div></div>${booking.note ? `<div class="booking-message">“${escapeHtml(booking.note)}”</div>` : ""}${booking.reschedule ? `<div class="booking-message">改期请求：${escapeHtml(booking.reschedule.sessionName)} → ${formatWhen(booking.reschedule.proposedStartAt)}${booking.reschedule.note ? ` · ${escapeHtml(booking.reschedule.note)}` : ""}</div>` : ""}<div class="booking-slots">${booking.sessions.map((session) => renderSessionRow(booking, session)).join("")}</div><footer class="booking-card-footer"><span>${shortDate(booking.createdAt)}</span><div class="booking-actions">${actions}</div></footer></article>`;
}

function renderSchedule() {
  const bookings = state.data.bookings.filter((booking) => state.scheduleFilter === "all" || booking.status === state.scheduleFilter);
  const pending = state.data.bookings.filter((booking) => booking.status === "pending" && booking.canAccept).length;
  const confirmed = state.data.bookings.filter((booking) => booking.status === "confirmed").length;
  const live = state.data.bookings.filter((booking) => booking.status === "live").length;
  return `<section class="page"><header class="page-heading"><div><span class="eyebrow"><i data-lucide="calendar-days"></i>完整约课流程</span><h1>从邀请到评价，每次交换都有记录。</h1><p>接受、改期、开课、双方确认完成和评价都由服务端校验真实参与者身份。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="plus"></i>发起新交换</button></div></header><section class="summary-strip"><div class="summary-stat amber"><small>待你处理</small><strong>${pending}</strong></div><div class="summary-stat teal"><small>已确认</small><strong>${confirmed}</strong></div><div class="summary-stat coral"><small>进行中</small><strong>${live}</strong></div><div class="summary-stat"><small>累计完成</small><strong>${state.data.stats.completedCount}</strong></div></section><div class="schedule-controls">${["all", "pending", "confirmed", "live", "reschedule_pending", "completed"].map((filter) => `<button class="filter-button ${state.scheduleFilter === filter ? "active" : ""}" type="button" data-action="set-schedule-filter" data-filter="${filter}">${filter === "all" ? "全部" : bookingLabels[filter]}</button>`).join("")}</div><div class="booking-list">${bookings.length ? bookings.map(renderBookingCard).join("") : renderEmpty("这个状态下没有约课", "去发现页匹配一位新的线上搭档。", "calendar-x")}</div></section>`;
}

function ledgerIcon(entry) {
  if (entry.kind === "lock") return "arrow-up-right";
  if (entry.kind === "refund") return "rotate-ccw";
  if (entry.kind === "settlement") return "hand-coins";
  if (entry.kind === "reward") return "badge-check";
  return "circle-plus";
}

function renderWallet() {
  const earned = state.data.wallet.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
  const spent = state.data.wallet.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  return `<section class="page"><header class="page-heading"><div><span class="eyebrow"><i data-lucide="wallet-cards"></i>技能钱包</span><h1>技能币只为真实的学习流动。</h1><p>用技能币约课会先锁定，双方确认课程完成后才向授课方结算；取消未开始约课会自动退款。</p></div><div class="page-heading-actions"><button class="primary-button" type="button" data-view="matches"><i data-lucide="sparkles"></i>寻找可约技能</button></div></header><section class="wallet-overview"><div class="wallet-balance-card"><span class="section-kicker">当前可用</span><strong>${state.data.user.coinBalance}<small>技能币</small></strong><p>完成双向技能互换会获得守约奖励。这里没有充值入口，也不会把技能币转换为现金。</p></div><div class="wallet-rule-card panel"><div class="rule-icon"><i data-lucide="handshake"></i></div><h2>每一笔都可追溯</h2><p>锁定、结算、退款和守约奖励都由服务器记账，便于双方确认交换是否完成。</p><button class="text-button" type="button" data-view="schedule">查看我的约课 <i data-lucide="arrow-right"></i></button></div></section><section class="ledger-panel panel"><div class="section-title" style="margin:16px 0 0"><div><span class="section-kicker">账本明细</span><h2>累计获得 <span>+${earned}</span></h2></div><span class="mini-label">累计锁定 ${spent}</span></div>${state.data.wallet.map((entry) => `<div class="ledger-row"><div class="ledger-icon ${entry.amount < 0 ? "spend" : entry.kind === "refund" ? "refund" : ""}"><i data-lucide="${ledgerIcon(entry)}"></i></div><div class="ledger-info"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.detail)}</span></div><div class="ledger-amount"><strong class="${entry.amount < 0 ? "spend" : ""}">${entry.amount > 0 ? "+" : ""}${entry.amount}</strong><small>${entry.status === "locked" ? "已锁定" : entry.status === "settled" ? "已结算" : entry.status === "refunded" ? "已退款" : "可用"}</small></div></div>`).join("")}</section></section>`;
}

function renderProfileSkill(skill) {
  return `<article class="profile-skill-row"><div class="profile-skill-icon ${skill.type === "learn" ? "learn" : ""}"><i data-lucide="${skill.type === "teach" ? "badge-check" : "graduation-cap"}"></i></div><div><h3>${escapeHtml(skill.name)}</h3><p>${escapeHtml(skill.category)} · ${escapeHtml(skill.level)} · ${escapeHtml(skill.duration)}${skill.type === "teach" ? ` · ${skill.modes.includes("coin") ? `${skill.coinCost} 技能币` : "只互换"}` : ""}</p></div><div class="row-actions"><button class="icon-button" type="button" data-action="open-skill-modal" data-skill-id="${skill.id}" aria-label="编辑 ${escapeHtml(skill.name)}" title="编辑"><i data-lucide="pencil"></i></button><button class="icon-button delete-skill" type="button" data-action="confirm-delete-skill" data-skill-id="${skill.id}" aria-label="删除 ${escapeHtml(skill.name)}" title="删除"><i data-lucide="trash-2"></i></button></div></article>`;
}

function renderProfile() {
  const { user, reviews } = state.data;
  return `<section class="page"><header class="page-heading"><div><span class="eyebrow"><i data-lucide="user-round"></i>我的技能档案</span><h1>让合适的人看见你会什么。</h1><p>个人资料、技能卡和可约时间都会真实影响匹配结果与可预约的共同时间。</p></div><div class="page-heading-actions"><button class="outline-button" type="button" data-action="logout"><i data-lucide="log-out"></i>退出登录</button><button class="primary-button" type="button" data-action="open-profile-modal"><i data-lucide="pencil"></i>编辑资料</button></div></header><section class="profile-hero panel"><img src="${user.avatar}" alt="${escapeHtml(user.name)}" /><div><h1>${escapeHtml(user.name)}</h1><p>${escapeHtml(user.bio)}</p><div class="profile-meta"><span><i data-lucide="map-pin"></i>${escapeHtml(user.city)}</span><span><i data-lucide="shield-check"></i>数据库账号已验证</span><span><i data-lucide="calendar-clock"></i>${user.availability.length} 个可约时段</span></div></div><button class="outline-button" type="button" data-action="open-skill-modal" data-skill-type="teach"><i data-lucide="plus"></i>新增技能</button></section><div class="profile-grid"><div><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">可教技能</span><h2>我能教 <span>${user.canTeach.length}</span></h2></div><button class="text-button" type="button" data-action="open-skill-modal" data-skill-type="teach">新增 <i data-lucide="plus"></i></button></div><div class="skill-list">${user.canTeach.map(renderProfileSkill).join("")}</div></section><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">学习目标</span><h2>我想学 <span>${user.wantToLearn.length}</span></h2></div><button class="text-button" type="button" data-action="open-skill-modal" data-skill-type="learn">新增 <i data-lucide="plus"></i></button></div><div class="skill-list">${user.wantToLearn.map(renderProfileSkill).join("")}</div></section></div><aside><section class="credit-card panel"><span class="section-kicker">交换信用</span><div class="credit-score-large"><strong>${Number(user.credit).toFixed(1)}</strong><span>由完成记录<br />与互评共同计算</span></div><div class="credit-breakdown"><div><span>已完成交换</span><b>${state.data.stats.completedCount}</b></div><div><span>收到评价</span><b>${reviews.length}</b></div><div><span>可约时段</span><b>${user.availability.length}</b></div></div></section><section class="profile-section panel"><div class="section-title"><div><span class="section-kicker">最近评价</span><h2>交换反馈</h2></div></div>${reviews.length ? reviews.map((review) => `<article class="review-card"><div class="review-card-top"><strong>${escapeHtml(review.author.name)}</strong><span class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><p>${escapeHtml(review.comment)}</p><small>${shortDate(review.createdAt)}</small></article>`).join("") : '<div class="notification-empty"><i data-lucide="star"></i>完成一笔约课后<br />评价会显示在这里</div>'}</section></aside></div></section>`;
}

function renderNotificationMenu() {
  if (!state.notificationOpen) {
    dom.notificationMenu.hidden = true;
    return;
  }
  const notifications = state.data.notifications;
  dom.notificationMenu.hidden = false;
  dom.notificationMenu.innerHTML = `<div class="notification-head"><strong>通知</strong><button type="button" data-action="mark-notifications-read">全部已读</button></div>${notifications.length ? notifications.slice(0, 8).map((notification) => `<button class="notification-item ${notification.read ? "" : "unread"}" type="button" data-action="open-notification" data-notification-id="${notification.id}"><i data-lucide="${notificationIcons[notification.type] || "bell"}"></i><div><strong>${escapeHtml(notification.title)}</strong><span>${escapeHtml(notification.body)}</span><small>${shortDate(notification.createdAt)}</small></div></button>`).join("") : '<div class="notification-empty"><i data-lucide="bell-off"></i>暂无新通知</div>'}`;
}

function renderModal() {
  if (!state.modal) {
    if (dom.modal.open) dom.modal.close();
    return;
  }
  const renderers = {
    request: renderRequestModal,
    skill: renderSkillModal,
    profile: renderProfileModal,
    review: renderReviewModal,
    reschedule: renderRescheduleModal,
    confirm: renderConfirmModal,
  };
  dom.modalContent.innerHTML = renderers[state.modal.kind]();
  if (!dom.modal.open) dom.modal.showModal();
  document.body.classList.add("modal-open");
  iconize();
}

function openModal(kind, payload = {}) {
  state.modal = { kind, ...payload };
  if (kind === "request") {
    const match = matchById(payload.partnerId);
    const skill = match?.highlightedSkill || match?.teaches[0];
    state.modal.requestedSkillId = skill?.id;
    state.modal.mode = skill?.modes.includes("swap") && state.data.user.canTeach.length ? "swap" : "coin";
    state.modal.learnAt = match?.commonSlots[0] || "";
    state.modal.teachAt = match?.commonSlots[1] || match?.commonSlots[0] || "";
    state.modal.offerSkillId = state.data.user.canTeach[0]?.id || "";
  }
  renderModal();
}

function closeModal() {
  state.modal = null;
  if (dom.modal.open) dom.modal.close();
  document.body.classList.remove("modal-open");
}

function renderRequestModal() {
  const match = matchById(state.modal.partnerId);
  const selectedSkill = match.teaches.find((skill) => Number(skill.id) === Number(state.modal.requestedSkillId)) || match.highlightedSkill;
  const availableModes = selectedSkill.modes;
  if (!availableModes.includes(state.modal.mode)) state.modal.mode = availableModes[0];
  const offerSkills = state.data.user.canTeach.filter((skill) => match.wants.some((wanted) => skill.name.includes(wanted.name) || wanted.name.includes(skill.name)));
  const validOfferSkills = offerSkills.length ? offerSkills : state.data.user.canTeach;
  if (!validOfferSkills.some((skill) => Number(skill.id) === Number(state.modal.offerSkillId))) state.modal.offerSkillId = validOfferSkills[0]?.id;
  return `<div class="modal-content"><button class="icon-button modal-close on-dark" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-profile"><img class="cover" src="${heroImages[match.name === "何雨" ? "heyu" : match.name === "周野" ? "zhouye" : match.name === "陈默" ? "chenmo" : match.name === "孙祺" ? "sunqi" : "linwen"] || state.data.user.avatar}" alt="" /><span class="modal-match"><i data-lucide="sparkles"></i>${match.score}% 契合</span><div class="modal-profile-content"><img src="${match.avatar}" alt="${escapeHtml(match.name)}" /><div><strong>${escapeHtml(match.name)}</strong><span>${escapeHtml(match.headline)}</span></div></div></div><form class="request-content" id="requestForm"><h3>向 ${escapeHtml(match.name)} 发起交换</h3><p>${escapeHtml(selectedSkill.description)}</p><div class="form-section"><label class="form-field"><span>我想学</span><select name="requestedSkillId" id="requestSkillSelect">${match.teaches.map((skill) => `<option value="${skill.id}"${Number(skill.id) === Number(selectedSkill.id) ? " selected" : ""}>${escapeHtml(skill.name)}</option>`).join("")}</select></label></div><div class="mode-picker">${availableModes.map((mode) => `<button class="${state.modal.mode === mode ? "active" : ""}" type="button" data-action="set-request-mode" data-mode="${mode}"><span><i data-lucide="${mode === "swap" ? "repeat-2" : "coins"}"></i>${mode === "swap" ? "技能互换" : "技能币"}</span><small>${mode === "swap" ? "用你的技能回馈对方" : `${selectedSkill.coinCost} 技能币 / 节`}</small></button>`).join("")}</div>${state.modal.mode === "swap" ? `<div class="form-section"><label class="form-field"><span>我准备教</span><select name="offerSkillId">${validOfferSkills.map((skill) => `<option value="${skill.id}"${Number(skill.id) === Number(state.modal.offerSkillId) ? " selected" : ""}>${escapeHtml(skill.name)}</option>`).join("")}</select></label><p class="helper-text">对方想学：${match.wants.map((skill) => escapeHtml(skill.name)).join("、")}</p></div>` : ""}<div class="form-section"><h4>选择共同可约时间</h4><div class="form-grid"><label class="form-field"><span>学习这节课</span><select name="learnAt">${match.commonSlots.map((slot) => `<option value="${slot}"${slot === state.modal.learnAt ? " selected" : ""}>${formatWhen(slot)}</option>`).join("")}</select></label>${state.modal.mode === "swap" ? `<label class="form-field"><span>回馈对方</span><select name="teachAt">${match.commonSlots.map((slot) => `<option value="${slot}"${slot === state.modal.teachAt ? " selected" : ""}>${formatWhen(slot)}</option>`).join("")}</select></label>` : ""}</div>${state.modal.mode === "coin" ? `<div class="method-note"><i data-lucide="coins"></i><span>发送后会锁定 ${selectedSkill.coinCost} 技能币，双方确认课程完成后才会结算给授课方。</span></div>` : ""}</div><div class="form-section"><label class="form-field"><span>给对方留一句话（可选）</span><textarea name="note" maxlength="180" placeholder="例如：我希望从最适合新手的场景开始。"></textarea></label></div><div class="modal-footer"><button class="text-button" type="button" data-action="open-message-view" data-partner-id="${match.id}"><i data-lucide="message-circle"></i>先聊聊</button><button class="primary-button" type="submit">发送约课请求 <i data-lucide="arrow-right"></i></button></div></form></div>`;
}

function findSkill(skillId) {
  return [...state.data.user.canTeach, ...state.data.user.wantToLearn].find((skill) => Number(skill.id) === Number(skillId));
}

function renderSkillModal() {
  const current = state.modal.skillId ? findSkill(state.modal.skillId) : null;
  const type = state.modal.skillType || current?.type || "teach";
  const skill = current || { type, name: "", category: type === "teach" ? "职场技能" : "创意技能", level: "入门", duration: "60 分钟", description: "", modes: ["swap", "coin"], coinCost: 20 };
  return `<div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">${current ? "编辑技能卡" : "新建技能卡"}</span><h2 id="modalTitle">${current ? `更新「${escapeHtml(skill.name)}」` : type === "teach" ? "分享你会的技能" : "补充一个学习目标"}</h2><p>技能档案会立即影响你的匹配结果。可教技能也会决定你能发起哪些互换。</p></div><form id="skillForm" data-skill-id="${current?.id || ""}"><div class="form-section"><div class="form-grid"><label class="form-field"><span>技能方向</span><select name="type"><option value="teach"${skill.type === "teach" ? " selected" : ""}>我能教</option><option value="learn"${skill.type === "learn" ? " selected" : ""}>我想学</option></select></label><label class="form-field"><span>技能名称</span><input name="name" value="${escapeHtml(skill.name)}" maxlength="30" required /></label><label class="form-field"><span>分类</span><input name="category" value="${escapeHtml(skill.category)}" maxlength="20" required /></label><label class="form-field"><span>当前程度</span><select name="level">${["入门", "熟练", "进阶"].map((item) => `<option${skill.level === item ? " selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span>单次时长</span><select name="duration">${["45 分钟", "60 分钟", "90 分钟"].map((item) => `<option${skill.duration === item ? " selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span>技能币</span><input name="coinCost" type="number" min="1" max="300" value="${skill.coinCost || 20}" /></label><label class="form-field full"><span>一句说明</span><textarea name="description" maxlength="180">${escapeHtml(skill.description)}</textarea></label></div></div><div class="form-section"><h4>接受方式</h4><div class="choice-stack"><label class="choice-option"><input type="checkbox" name="modes" value="swap"${skill.modes.includes("swap") ? " checked" : ""} />技能互换</label><label class="choice-option"><input type="checkbox" name="modes" value="coin"${skill.modes.includes("coin") ? " checked" : ""} />技能币约课</label></div><p class="helper-text">“我想学”的技能仅用于匹配；可教技能至少保留一种交换方式。</p></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">取消</button><button class="primary-button" type="submit">${current ? "保存变更" : "发布技能卡"} <i data-lucide="arrow-right"></i></button></div></form></div>`;
}

function renderProfileModal() {
  const { user } = state.data;
  return `<div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">个人资料与可约时间</span><h2 id="modalTitle">让搭档了解你，也让系统正确找时段</h2><p>可约时间使用 <code>YYYY-MM-DD HH:mm</code>，用逗号或换行分隔。只有双方都公开可约的时段能进入预约。</p></div><form id="profileForm"><div class="form-section"><div class="form-grid"><label class="form-field"><span>昵称</span><input name="name" value="${escapeHtml(user.name)}" maxlength="20" required /></label><label class="form-field"><span>授课方式</span><input name="city" value="${escapeHtml(user.city)}" maxlength="24" required /></label><label class="form-field full"><span>一句话介绍</span><input name="headline" value="${escapeHtml(user.headline)}" maxlength="40" required /></label><label class="form-field full"><span>个人介绍</span><textarea name="bio" maxlength="180" required>${escapeHtml(user.bio)}</textarea></label><label class="form-field full"><span>可约时间</span><textarea name="availability" maxlength="500" required>${escapeHtml(user.availability.join("\n"))}</textarea></label></div></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">取消</button><button class="primary-button" type="submit">保存资料 <i data-lucide="check"></i></button></div></form></div>`;
}

function renderReviewModal() {
  const booking = bookingById(state.modal.bookingId);
  return `<div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">完成交换</span><h2 id="modalTitle">这次和 ${escapeHtml(booking.partner.name)} 的学习怎么样？</h2><p>评价会真实更新对方的信用档案，也能帮助后来的学习者判断是否适合。</p></div><form id="reviewForm" data-booking-id="${booking.id}"><div class="form-section"><h4>总体评价</h4><div class="rating-picker">${[1,2,3,4,5].map((rating) => `<button class="${state.modal.rating === rating ? "active" : ""}" type="button" data-action="set-rating" data-rating="${rating}">${rating}★</button>`).join("")}</div></div><div class="form-section"><label class="form-field"><span>写一点具体反馈</span><textarea name="comment" maxlength="240" required placeholder="例如：对方准备充分、解释清晰，推荐先从哪一步开始。"></textarea></label></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">稍后再说</button><button class="primary-button" type="submit">提交评价 <i data-lucide="check"></i></button></div></form></div>`;
}

function renderRescheduleModal() {
  const booking = bookingById(state.modal.bookingId);
  const availableSessions = booking.sessions.filter((session) => session.status === "scheduled");
  const selectedSession = availableSessions.find((session) => Number(session.id) === Number(state.modal.sessionId)) || availableSessions[0];
  const match = matchById(booking.partnerId);
  const slots = match?.commonSlots || state.data.user.availability;
  return `<div class="modal-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="modal-head"><span class="section-kicker">调整时间</span><h2 id="modalTitle">和 ${escapeHtml(booking.partner.name)} 换一个时段</h2><p>改期需要另一位参与者在自己的账号内确认，原定时段会在确认前继续保留。</p></div><form id="rescheduleForm" data-booking-id="${booking.id}"><div class="form-section"><div class="form-grid"><label class="form-field"><span>要调整哪一节</span><select name="sessionId">${availableSessions.map((session) => `<option value="${session.id}"${Number(session.id) === Number(selectedSession.id) ? " selected" : ""}>${session.kind === "teach" ? "你教" : "你学"}：${escapeHtml(session.skill)} · ${compactWhen(session.startAt)}</option>`).join("")}</select></label><label class="form-field"><span>新时段</span><select name="startAt">${slots.map((slot) => `<option value="${slot}">${formatWhen(slot)}</option>`).join("")}</select></label><label class="form-field full"><span>说明（可选）</span><textarea name="note" maxlength="180" placeholder="例如：这个时间我可以更从容地准备。"></textarea></label></div></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">暂不调整</button><button class="primary-button" type="submit">发送改期请求 <i data-lucide="arrow-right"></i></button></div></form></div>`;
}

function renderConfirmModal() {
  const modal = state.modal;
  return `<div class="modal-content confirm-content"><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button><div class="confirm-icon"><i data-lucide="triangle-alert"></i></div><div class="modal-head" style="margin-top:16px"><h2 id="modalTitle">${escapeHtml(modal.title)}</h2><p>${escapeHtml(modal.body)}</p></div><div class="modal-footer"><button class="text-button" type="button" data-action="close-modal">返回</button><button class="outline-button button-danger" type="button" data-action="confirm-action" data-confirm-kind="${modal.confirmKind}">${escapeHtml(modal.actionLabel)} <i data-lucide="arrow-right"></i></button></div></div>`;
}

function animatePage() {
  const gsap = window.gsap;
  if (!gsap || !dom.view) return;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.__huanjiMotion) window.__huanjiMotion.revert();
  const scope = dom.view;
  window.__huanjiMotion = gsap.context(() => {
    gsap.fromTo(scope.querySelectorAll(".taste-hero-copy > *"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.08, ease: "power3.out" });
    gsap.fromTo(scope.querySelector(".taste-hero-visual"), { opacity: 0, x: 28, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, delay: 0.1, ease: "power3.out" });
    gsap.utils.toArray(scope.querySelectorAll(".partner-card, .focus-accordion-item, .panel")).forEach((element, index) => {
      gsap.fromTo(element, { opacity: 0.35, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: Math.min(index * 0.04, 0.24), ease: "power2.out", scrollTrigger: { trigger: element, start: "top 91%", end: "top 62%", scrub: 0.8 } });
    });
    gsap.utils.toArray(scope.querySelectorAll(".partner-cover img, .focus-accordion-image img")).forEach((image) => {
      gsap.fromTo(image, { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: image, start: "top 95%", end: "bottom 45%", scrub: 1 } });
    });
    const marquee = scope.querySelector(".skill-marquee-track");
    if (marquee) gsap.to(marquee, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
  }, scope);
}

function render() {
  if (!state.data) return;
  renderChrome();
  const renderer = { discover: renderDiscover, matches: renderMatches, messages: renderMessages, schedule: renderSchedule, wallet: renderWallet, profile: renderProfile }[state.view] || renderDiscover;
  dom.view.innerHTML = renderer();
  renderNotificationMenu();
  renderModal();
  iconize();
  animatePage();
}

function setView(view) {
  state.view = view;
  state.notificationOpen = false;
  render();
  window.requestAnimationFrame(() => dom.view.focus());
  if (view === "messages") {
    const partnerId = state.activePartnerId || state.data.conversations[0]?.partner.id;
    if (partnerId && (!state.conversation || Number(state.conversation.partner.id) !== Number(partnerId))) openConversation(partnerId).catch((error) => showToast(error.message));
  }
}

function openConfirm(confirmKind, payload) {
  const configs = {
    cancelBooking: { title: "确认取消这次约课？", body: "未开始的课程会从双方日程移除；使用技能币的约课将自动退款。", actionLabel: "取消约课" },
    declineBooking: { title: "确认婉拒这次邀请？", body: "对方会收到邀请未确认的通知，之后仍可以重新发起交换。", actionLabel: "婉拒邀请" },
    deleteSkill: { title: "确认删除这项技能？", body: "删除后它不会再进入新的匹配，但不会影响已有约课。", actionLabel: "删除技能" },
  };
  openModal("confirm", { confirmKind, ...payload, ...configs[confirmKind] });
}

async function runMutation(path, method = "POST", payload = {}, successMessage = "已保存") {
  const result = await api(path, { method, body: method === "DELETE" ? undefined : JSON.stringify(payload) });
  snapshotFromResponse(result);
  if (!result.snapshot) await refresh();
  else render();
  showToast(successMessage);
  return result;
}

async function submitAuth(form, type) {
  const data = Object.fromEntries(new FormData(form));
  const result = await api(`/api/auth/${type}`, { method: "POST", body: JSON.stringify(data) });
  state.data = null;
  await refresh();
  showToast(type === "login" ? `欢迎回来，${result.user.name}` : "账号创建成功，先完善你的技能档案吧");
}

async function submitRequest(form) {
  const payload = Object.fromEntries(new FormData(form));
  payload.partnerId = state.modal.partnerId;
  payload.mode = state.modal.mode;
  payload.requestedSkillId = Number(payload.requestedSkillId);
  if (payload.offerSkillId) payload.offerSkillId = Number(payload.offerSkillId);
  const result = await api("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
  snapshotFromResponse(result);
  closeModal();
  state.view = "schedule";
  render();
  showToast("约课请求已发送，等待对方账号确认");
}

async function submitSkill(form) {
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  payload.modes = formData.getAll("modes");
  payload.coinCost = Number(payload.coinCost || 20);
  const skillId = form.dataset.skillId;
  const result = await api(skillId ? `/api/skills/${skillId}` : "/api/skills", { method: skillId ? "PUT" : "POST", body: JSON.stringify(payload) });
  snapshotFromResponse(result);
  closeModal();
  state.view = "profile";
  render();
  showToast(skillId ? "技能卡已更新，匹配结果已刷新" : "技能卡已发布，已加入智能匹配");
}

async function submitProfile(form) {
  const payload = Object.fromEntries(new FormData(form));
  payload.availability = String(payload.availability || "").split(/[\n,，]+/).map((value) => value.trim()).filter(Boolean);
  await runMutation("/api/profile", "PUT", payload, "个人资料和可约时间已保存");
  closeModal();
  await refresh();
}

async function submitReview(form) {
  const payload = Object.fromEntries(new FormData(form));
  payload.rating = state.modal.rating;
  const result = await api(`/api/bookings/${form.dataset.bookingId}/reviews`, { method: "POST", body: JSON.stringify(payload) });
  snapshotFromResponse(result);
  closeModal();
  render();
  showToast("评价已提交，对方的信用档案已更新");
}

async function submitReschedule(form) {
  const payload = Object.fromEntries(new FormData(form));
  const result = await api(`/api/bookings/${form.dataset.bookingId}/reschedule`, { method: "POST", body: JSON.stringify(payload) });
  snapshotFromResponse(result);
  closeModal();
  render();
  showToast("改期请求已发送，等待对方账号确认");
}

async function submitMessage(form) {
  const partnerId = form.dataset.partnerId;
  const input = form.querySelector("input[name='body']");
  const result = await api(`/api/conversations/${partnerId}/messages`, { method: "POST", body: JSON.stringify({ body: input.value }) });
  state.activePartnerId = Number(partnerId);
  state.conversation = result;
  await refresh({ preserveConversation: true });
  state.conversation = result;
  render();
}

document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-view], [data-action]");
  if (!trigger) return;
  const { action, view } = trigger.dataset;
  try {
    if (view) {
      event.preventDefault();
      setView(view);
      return;
    }
    if (action === "retry-load") return refresh();
    if (action === "auth-tab") {
      document.querySelectorAll(".auth-tabs button").forEach((button) => button.classList.toggle("active", button === trigger));
      document.querySelector("#authFormArea").innerHTML = trigger.dataset.tab === "login" ? renderLoginForm() : renderRegisterForm();
      iconize();
      return;
    }
    if (action === "demo-login") {
      const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: trigger.dataset.email, password: "demo1234" }) });
      state.data = null;
      await refresh();
      showToast(`已切换到 ${result.user.name} 的账号`);
      return;
    }
    if (action === "logout") {
      await api("/api/auth/logout", { method: "POST", body: "{}" });
      state.data = null;
      state.modal = null;
      state.conversation = null;
      renderAuth();
      return;
    }
    if (action === "toggle-notifications") {
      state.notificationOpen = !state.notificationOpen;
      renderNotificationMenu();
      iconize();
      return;
    }
    if (action === "mark-notifications-read") {
      await api("/api/notifications/read", { method: "POST", body: "{}" });
      state.notificationOpen = false;
      await refresh();
      return;
    }
    if (action === "open-notification") {
      const notification = state.data.notifications.find((item) => Number(item.id) === Number(trigger.dataset.notificationId));
      if (!notification) return;
      await api("/api/notifications/read", { method: "POST", body: JSON.stringify({ ids: [notification.id] }) });
      state.notificationOpen = false;
      if (notification.bookingId) {
        setView("schedule");
        window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${notification.bookingId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      } else if (notification.partnerId) {
        state.view = "messages";
        await openConversation(notification.partnerId);
      } else await refresh();
      return;
    }
    if (action === "open-skill-modal") return openModal("skill", { skillType: trigger.dataset.skillType || "teach", skillId: trigger.dataset.skillId });
    if (action === "open-profile-modal") return openModal("profile");
    if (action === "open-request") {
      const booking = activeBookingFor(trigger.dataset.partnerId);
      if (booking) {
        setView("schedule");
        window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${booking.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      } else openModal("request", { partnerId: Number(trigger.dataset.partnerId) });
      return;
    }
    if (action === "view-booking") {
      setView("schedule");
      window.requestAnimationFrame(() => document.querySelector(`[data-booking-card="${trigger.dataset.bookingId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    if (action === "open-message-view") {
      state.view = "messages";
      await openConversation(trigger.dataset.partnerId);
      return;
    }
    if (action === "select-conversation") return openConversation(trigger.dataset.partnerId);
    if (action === "set-match-filter") {
      state.matchFilter = trigger.dataset.filter;
      await refresh();
      return;
    }
    if (action === "set-schedule-filter") {
      state.scheduleFilter = trigger.dataset.filter;
      render();
      return;
    }
    if (action === "refresh-data") {
      await refresh();
      showToast("匹配已根据最新档案重新计算");
      return;
    }
    if (action === "clear-search") {
      state.query = "";
      dom.search.value = "";
      await refresh();
      return;
    }
    if (action === "set-request-mode") {
      state.modal.mode = trigger.dataset.mode;
      renderModal();
      return;
    }
    if (action === "close-modal") return closeModal();
    if (action === "set-rating") {
      state.modal.rating = Number(trigger.dataset.rating);
      renderModal();
      return;
    }
    if (action === "accept-booking") return runMutation(`/api/bookings/${trigger.dataset.bookingId}/accept`, "POST", {}, "已接受邀请，约课进入双方日程");
    if (action === "decline-booking") return openConfirm("declineBooking", { bookingId: trigger.dataset.bookingId });
    if (action === "confirm-cancel-booking") return openConfirm("cancelBooking", { bookingId: trigger.dataset.bookingId });
    if (action === "open-reschedule-modal") return openModal("reschedule", { bookingId: trigger.dataset.bookingId });
    if (action === "respond-reschedule") return runMutation(`/api/bookings/${trigger.dataset.bookingId}/reschedule/${trigger.dataset.approved === "true" ? "accept" : "decline"}`, "POST", {}, trigger.dataset.approved === "true" ? "已确认新的约课时间" : "已保留原定时段");
    if (action === "start-session") return runMutation(`/api/bookings/${trigger.dataset.bookingId}/sessions/${trigger.dataset.sessionId}/start`, "POST", {}, "线上约课已开始，请在结束后由双方确认");
    if (action === "complete-session") return runMutation(`/api/bookings/${trigger.dataset.bookingId}/sessions/${trigger.dataset.sessionId}/complete`, "POST", {}, "已提交课程完成确认，等待另一位参与者确认");
    if (action === "open-review-modal") return openModal("review", { bookingId: trigger.dataset.bookingId, rating: 5 });
    if (action === "confirm-delete-skill") return openConfirm("deleteSkill", { skillId: trigger.dataset.skillId });
    if (action === "confirm-action") {
      const modal = state.modal;
      closeModal();
      if (modal.confirmKind === "cancelBooking") return runMutation(`/api/bookings/${modal.bookingId}/cancel`, "POST", {}, "约课已取消，技能币已按规则处理");
      if (modal.confirmKind === "declineBooking") return runMutation(`/api/bookings/${modal.bookingId}/decline`, "POST", {}, "已婉拒这次邀请");
      if (modal.confirmKind === "deleteSkill") return runMutation(`/api/skills/${modal.skillId}`, "DELETE", undefined, "技能卡已删除，匹配结果已更新");
    }
  } catch (error) {
    showToast(error.message);
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  try {
    if (form.id === "loginForm") await submitAuth(form, "login");
    if (form.id === "registerForm") await submitAuth(form, "register");
    if (form.id === "requestForm") await submitRequest(form);
    if (form.id === "skillForm") await submitSkill(form);
    if (form.id === "profileForm") await submitProfile(form);
    if (form.id === "reviewForm") await submitReview(form);
    if (form.id === "rescheduleForm") await submitReschedule(form);
    if (form.id === "messageForm") await submitMessage(form);
  } catch (error) {
    showToast(error.message);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "requestSkillSelect" && state.modal?.kind === "request") {
    state.modal.requestedSkillId = Number(event.target.value);
    renderModal();
  }
});

let searchTimer;
dom.search.addEventListener("input", () => {
  state.query = dom.search.value.trim();
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    if (state.data) {
      state.view = "matches";
      refresh().catch((error) => showToast(error.message));
    }
  }, 260);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
    event.preventDefault();
    dom.search.focus();
  }
});

dom.modal.addEventListener("close", () => {
  state.modal = null;
  document.body.classList.remove("modal-open");
});

refresh();
