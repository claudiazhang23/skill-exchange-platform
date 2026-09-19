const matches = [
  {
    id: "heyu",
    name: "何雨",
    meta: "摄影师 · 已完成 34 次交换",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85",
    category: "人像摄影",
    title: "自然光人像，从构图到引导",
    summary: "一次讲清光线、构图和与被摄者沟通的起步方法。",
    wants: "演示表达与故事结构",
    match: 98,
    modes: ["swap", "coin"],
    price: "20 技能币 / 60 分钟",
    availability: "本周可约 4 个时段",
    online: true,
  },
  {
    id: "zhouye",
    name: "周野",
    meta: "数据产品经理 · 回复快",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=85",
    category: "Python 自动化",
    title: "用 Python 告别重复办公",
    summary: "从表格清洗到批量文件处理，做出第一个自动化脚本。",
    wants: "Notion 项目管理",
    match: 96,
    modes: ["swap", "coin"],
    price: "22 技能币 / 60 分钟",
    availability: "今晚和周末有空",
    online: true,
  },
  {
    id: "chenmo",
    name: "陈默",
    meta: "独立设计师 · 信用 4.9",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=85",
    category: "Figma 入门",
    title: "从 0 到 1 做出能讲清的页面",
    summary: "建立组件意识，用一小时复刻一个清爽的移动端页面。",
    wants: "公开表达与汇报逻辑",
    match: 94,
    modes: ["swap", "coin"],
    price: "24 技能币 / 60 分钟",
    availability: "周六上午优先",
    online: false,
  },
  {
    id: "sunqi",
    name: "孙祺",
    meta: "吉他老师 · 已教 120 人",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=85",
    category: "吉他弹唱",
    title: "七天弹出一首完整的歌",
    summary: "零基础也能跟着节拍走，先拿下四个万能和弦。",
    wants: "做一份个人作品集",
    match: 91,
    modes: ["coin"],
    price: "18 技能币 / 45 分钟",
    availability: "周末下午可约",
    online: true,
  },
  {
    id: "linwen",
    name: "林雯",
    meta: "视频创作者 · 回应率 100%",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=700&q=85",
    category: "短视频剪辑",
    title: "用手机剪出节奏感和故事",
    summary: "不堆模板，学会用节奏、声音和转场讲清一个观点。",
    wants: "Python 批量整理素材",
    match: 89,
    modes: ["swap"],
    price: "与 Python 技能互换优先",
    availability: "未来 7 天可约",
    online: true,
  },
  {
    id: "jiangfan",
    name: "蒋帆",
    meta: "咖啡师 · 在线小班主理人",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=85",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85",
    category: "手冲咖啡",
    title: "一杯稳定好喝的手冲咖啡",
    summary: "理解研磨、水温和注水节奏，在家也能还原喜欢的风味。",
    wants: "讲一堂不紧张的线上课",
    match: 87,
    modes: ["coin"],
    price: "16 技能币 / 45 分钟",
    availability: "工作日午间有空",
    online: false,
  },
];

const state = {
  filter: "all",
  query: "",
  activeMatch: matches[0],
  selectedMethod: "swap",
  selectedSlot: "周五 20:00",
  coins: 128,
  refreshIndex: 0,
};

const ui = {
  grid: document.querySelector("#matchGrid"),
  empty: document.querySelector("#emptyState"),
  matchCount: document.querySelector("#matchCount"),
  exchangeDialog: document.querySelector("#exchangeDialog"),
  publishDialog: document.querySelector("#publishDialog"),
  chatDrawer: document.querySelector("#chatDrawer"),
  scrim: document.querySelector("#scrim"),
  toast: document.querySelector("#toast"),
};

const iconForMode = { swap: "repeat-2", coin: "coins" };
const labelForMode = { swap: "技能互换", coin: "技能币" };

function createIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.9 } });
}

function tagTemplate(mode) {
  return `<span class="exchange-tag ${mode}"><i data-lucide="${iconForMode[mode]}"></i>${labelForMode[mode]}</span>`;
}

function filteredMatches() {
  const query = state.query.trim().toLowerCase();
  return matches.filter((match) => {
    const filterMatches = state.filter === "all" || match.modes.includes(state.filter);
    const searchable = `${match.name} ${match.category} ${match.title} ${match.summary} ${match.wants}`.toLowerCase();
    return filterMatches && (!query || searchable.includes(query));
  });
}

function renderMatches() {
  const items = filteredMatches();
  ui.grid.innerHTML = items.map((match) => `
    <article class="match-card" data-id="${match.id}">
      <div class="match-photo">
        <img src="${match.cover}" alt="${match.category}课程画面" />
        <span class="photo-type"><i data-lucide="${match.online ? "video" : "users-round"}"></i>${match.online ? "在线实时" : "线上小班"}</span>
      </div>
      <div class="match-body">
        <div class="match-person">
          <img src="${match.avatar}" alt="${match.name}" />
          <div><strong>${match.name}</strong><small>${match.meta}</small></div>
          ${match.online ? '<span class="online-dot" title="当前在线"></span>' : ""}
        </div>
        <h3>${match.title}</h3>
        <p>${match.summary}</p>
        <div class="exchange-path"><div class="exchange-tags">${match.modes.map(tagTemplate).join("")}</div><span class="match-percent">${match.match}%</span></div>
      </div>
      <footer class="match-card-footer"><span>${match.availability}</span><button type="button" data-open-match="${match.id}">查看方案 <i data-lucide="arrow-up-right"></i></button></footer>
    </article>
  `).join("");
  ui.grid.hidden = !items.length;
  ui.empty.hidden = Boolean(items.length);
  ui.matchCount.textContent = items.length;
  createIcons();
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  renderMatches();
}

function methodPrice(match, mode) {
  if (mode === "swap") return `你教 ${match.wants}`;
  return match.price.includes("技能币") ? match.price : "24 技能币 / 60 分钟";
}

function openExchange(match) {
  state.activeMatch = match;
  state.selectedMethod = match.modes.includes("swap") ? "swap" : match.modes[0];
  document.querySelector("#dialogImage").src = match.cover;
  document.querySelector("#dialogImage").alt = `${match.category}课程画面`;
  document.querySelector("#dialogAvatar").src = match.avatar;
  document.querySelector("#dialogAvatar").alt = match.name;
  document.querySelector("#dialogName").textContent = match.name;
  document.querySelector("#dialogMeta").textContent = match.meta;
  document.querySelector("#dialogMatch").textContent = `${match.match}%`;
  document.querySelector("#dialogCategory").textContent = match.category;
  document.querySelector("#exchangeTitle").textContent = `跟${match.name}一起学${match.category}`;
  document.querySelector("#dialogDescription").textContent = match.summary;
  document.querySelector("#dialogWant").textContent = match.wants;
  document.querySelector("#methodOptions").innerHTML = match.modes.map((mode) => `
    <button class="method-option ${mode === state.selectedMethod ? "active" : ""}" type="button" data-method="${mode}">
      <span><i data-lucide="${iconForMode[mode]}"></i>${labelForMode[mode]}</span>
      <small>${methodPrice(match, mode)}</small>
    </button>`).join("");
  updateConfirmButton();
  ui.exchangeDialog.showModal();
  createIcons();
}

function updateConfirmButton() {
  const method = labelForMode[state.selectedMethod];
  document.querySelector("#confirmExchange").innerHTML = `发送约课请求 <i data-lucide="arrow-right"></i>`;
  document.querySelectorAll(".method-option").forEach((button) => button.classList.toggle("active", button.dataset.method === state.selectedMethod));
  document.querySelector("#confirmExchange").dataset.method = method;
  createIcons();
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => ui.toast.classList.remove("show"), 3200);
}

function updateCoins(delta) {
  state.coins += delta;
  document.querySelector("#sideCoinBalance").textContent = state.coins;
  document.querySelector("#walletCoinBalance").textContent = state.coins;
}

function openChat(match = state.activeMatch) {
  if (match) {
    document.querySelector("#chatAvatar").src = match.avatar;
    document.querySelector("#chatAvatar").alt = match.name;
    document.querySelector("#chatName").textContent = match.name;
    document.querySelector(".chat-context span").textContent = `你们因「${match.category}」与「${match.wants}」匹配`;
  }
  if (ui.exchangeDialog.open) ui.exchangeDialog.close();
  ui.chatDrawer.classList.add("open");
  ui.chatDrawer.setAttribute("aria-hidden", "false");
  ui.scrim.hidden = false;
  document.querySelector("#chatInput").focus();
}

function closeChat() {
  ui.chatDrawer.classList.remove("open");
  ui.chatDrawer.setAttribute("aria-hidden", "true");
  ui.scrim.hidden = true;
}

function simulateRefresh() {
  state.refreshIndex += 1;
  const reordered = [...matches.slice(state.refreshIndex % 3), ...matches.slice(0, state.refreshIndex % 3)];
  matches.splice(0, matches.length, ...reordered);
  renderMatches();
  showToast("已为你更新一批相近的技能搭档");
}

document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
document.querySelector("#skillSearch").addEventListener("input", (event) => { state.query = event.target.value; renderMatches(); });
document.querySelector("#skillSearch").addEventListener("keydown", (event) => { if (event.key === "Escape") { event.currentTarget.value = ""; state.query = ""; renderMatches(); event.currentTarget.blur(); } });
document.addEventListener("keydown", (event) => { if (event.key === "/" && document.activeElement.tagName !== "INPUT") { event.preventDefault(); document.querySelector("#skillSearch").focus(); } });
document.querySelector("#matchGrid").addEventListener("click", (event) => { const button = event.target.closest("[data-open-match]"); if (button) openExchange(matches.find((match) => match.id === button.dataset.openMatch)); });
document.querySelector("#refreshMatches").addEventListener("click", simulateRefresh);
document.querySelector("#sortButton").addEventListener("click", () => { matches.sort((a, b) => b.match - a.match); renderMatches(); showToast("已按匹配度从高到低排序"); });

document.querySelector("#methodOptions").addEventListener("click", (event) => { const option = event.target.closest("[data-method]"); if (!option) return; state.selectedMethod = option.dataset.method; updateConfirmButton(); });
document.querySelector("#slotOptions").addEventListener("click", (event) => { const slot = event.target.closest(".slot"); if (!slot) return; state.selectedSlot = slot.textContent; document.querySelectorAll(".slot").forEach((button) => button.classList.toggle("active", button === slot)); });
document.querySelector("#confirmExchange").addEventListener("click", () => {
  const match = state.activeMatch;
  const mode = state.selectedMethod;
  if (mode === "coin") {
    if (state.coins < 20) { showToast("技能币余额不足，先完成一次互换吧"); return; }
    updateCoins(-20);
  }
  ui.exchangeDialog.close();
  const labels = { swap: "互换请求", coin: "技能币约课" };
  showToast(`已向${match.name}发出${labels[mode]}：${state.selectedSlot}`);
});
document.querySelector("#messageFirst").addEventListener("click", () => openChat(state.activeMatch));
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));

document.querySelector("#openPublish").addEventListener("click", () => ui.publishDialog.showModal());
document.querySelector("#addTeachSkill").addEventListener("click", () => ui.publishDialog.showModal());
document.querySelector("#addLearnSkill").addEventListener("click", () => { document.querySelector("#skillSearch").focus(); showToast("告诉我们你还想学什么，系统会继续为你找人"); });
document.querySelector("#publishForm").addEventListener("submit", (event) => { event.preventDefault(); const skill = document.querySelector("#publishSkill").value.trim(); ui.publishDialog.close(); event.currentTarget.reset(); showToast(`「${skill}」已发布，正在寻找合适的学习者`); });

document.querySelector("#openChatNav").addEventListener("click", () => openChat(matches[0]));
document.querySelector("#closeChat").addEventListener("click", closeChat);
ui.scrim.addEventListener("click", closeChat);
document.querySelector("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); const input = document.querySelector("#chatInput"); const text = input.value.trim(); if (!text) return; const message = document.createElement("div"); message.className = "message sent"; message.textContent = text; document.querySelector("#messages").append(message); input.value = ""; document.querySelector("#messages").scrollTop = document.querySelector("#messages").scrollHeight; });
document.querySelector("#attachButton").addEventListener("click", () => showToast("附件功能会在接入真实聊天服务后启用"));

document.querySelector("#notificationButton").addEventListener("click", () => showToast("何雨已查看你的技能卡片，周野向你发来一条新消息"));
document.querySelector("#walletButton").addEventListener("click", () => showToast(`当前可用 ${state.coins} 技能币，本月已获得 46`));
document.querySelector("#openWallet").addEventListener("click", () => showToast("技能钱包：可兑换课程，也可由约课完成后自动结算"));
document.querySelector("#calendarButton").addEventListener("click", () => showToast("完整日程视图将在上线版接入日历同步"));
document.querySelector("#viewSchedule").addEventListener("click", () => showToast("本周共有 4 个已确认或待确认的约课"));
document.querySelector("#trustButton").addEventListener("click", () => showToast("信用档案包含守约率、评价与技能认证"));
document.querySelector("#profileButton").addEventListener("click", () => showToast("个人主页：你有 2 项可教技能，正在学习 2 项技能"));
document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.toggle("active", nav === button)); if (button.id !== "openChatNav") showToast(`「${button.dataset.view}」模块将在完整上线版中展开`); }));
document.querySelectorAll(".date-strip button").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".date-strip button").forEach((date) => date.classList.toggle("selected", date === button)); }));

renderMatches();
createIcons();
