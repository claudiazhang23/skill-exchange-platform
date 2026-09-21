const pages = document.querySelectorAll('[data-page-view]');
const navLinks = document.querySelectorAll('.nav-link');
const searchDrawer = document.getElementById('searchDrawer');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');

function initMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  const { gsap } = window;
  const quotes = gsap.utils.toArray('.reference-quote');
  gsap.fromTo(quotes, { autoAlpha: 0, y: 22, scale: .96 }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: .75,
    stagger: .08,
    ease: 'power3.out',
    delay: .1,
  });
  gsap.fromTo('.reference-collab', { autoAlpha: 0, y: 46 }, {
    autoAlpha: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.reference-collab', start: 'top 88%', once: true },
  });
  gsap.utils.toArray('.skill-post-media img, .saved-card-photo img').forEach((image) => {
    gsap.fromTo(image, { scale: .86, autoAlpha: .45 }, {
      scale: 1,
      autoAlpha: 1,
      ease: 'none',
      scrollTrigger: { trigger: image, start: 'top 92%', end: 'bottom 46%', scrub: true },
    });
  });
  gsap.fromTo('.skill-feed-card', { autoAlpha: 0, y: 28 }, {
    autoAlpha: 1,
    y: 0,
    duration: .7,
    stagger: .07,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.skill-feed-grid', start: 'top 88%', once: true },
  });
  gsap.to('.reference-collab', {
    y: -18,
    ease: 'none',
    scrollTrigger: { trigger: '.reference-collab', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  window.ScrollTrigger.refresh();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function closeSearch() {
  searchDrawer.classList.remove('is-open');
  searchDrawer.setAttribute('aria-hidden', 'true');
}

function switchPage(pageName) {
  pages.forEach((page) => page.classList.toggle('is-visible', page.dataset.pageView === pageName));
  navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.page === pageName));
  closeSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.ScrollTrigger) window.setTimeout(() => window.ScrollTrigger.refresh(), 80);
}

document.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => switchPage(button.dataset.page)));

document.getElementById('searchToggle').addEventListener('click', () => {
  const open = searchDrawer.classList.toggle('is-open');
  searchDrawer.setAttribute('aria-hidden', String(!open));
  if (open) window.setTimeout(() => searchInput.focus(), 120);
});
document.getElementById('searchClose').addEventListener('click', closeSearch);
document.querySelectorAll('.search-suggestions button').forEach((button) => button.addEventListener('click', () => {
  searchInput.value = button.textContent;
  showToast(`正在查找「${button.textContent}」`);
}));

const postModal = document.getElementById('postModal');
const swapModal = document.getElementById('swapModal');
const postText = document.getElementById('postText');
const postTypeButtons = document.querySelectorAll('.post-type');
let currentPostType = 'teach';

function openPostModal(type = 'teach') {
  currentPostType = type;
  postTypeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.postType === type));
  closeSearch();
  postModal.classList.add('is-open');
  postModal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => document.getElementById('skillName').focus(), 120);
}

function closePostModal() {
  postModal.classList.remove('is-open');
  postModal.setAttribute('aria-hidden', 'true');
}

document.getElementById('newPost').addEventListener('click', () => openPostModal('teach'));
document.getElementById('profileAddSkill').addEventListener('click', () => openPostModal('teach'));
document.getElementById('modalClose').addEventListener('click', closePostModal);
postTypeButtons.forEach((button) => button.addEventListener('click', () => {
  currentPostType = button.dataset.postType;
  postTypeButtons.forEach((item) => item.classList.toggle('is-active', item === button));
}));
postModal.addEventListener('click', (event) => { if (event.target === postModal) closePostModal(); });

document.getElementById('publishPost').addEventListener('click', () => {
  const skill = document.getElementById('skillName').value.trim();
  const swapSkill = document.getElementById('swapSkill').value.trim();
  if (!skill || !swapSkill) {
    showToast('请先填写技能和想交换的技能');
    document.getElementById(!skill ? 'skillName' : 'swapSkill').focus();
    return;
  }
  closePostModal();
  document.getElementById('skillName').value = '';
  document.getElementById('swapSkill').value = '';
  postText.value = '';
  showToast(currentPostType === 'teach' ? '已发布你的可教技能' : '已发布你的学习需求');
});

const filterButtons = document.querySelectorAll('.filter-chip');
const topicButtons = document.querySelectorAll('.topic-chip');
const skillCards = document.querySelectorAll('.skill-card');
const skillSearch = document.getElementById('skillSearch');
let activeTopic = 'all';
function updateSkillCards() {
  const active = document.querySelector('.filter-chip.is-active')?.dataset.filter || 'all';
  const query = (skillSearch?.value || '').trim().toLowerCase();
  skillCards.forEach((card) => {
    const categoryMatch = active === 'all' || active === card.dataset.category || (active === 'high' && Number(card.dataset.match) >= 90);
    const topicMatch = activeTopic === 'all' || card.dataset.topic === activeTopic;
    const searchMatch = !query || card.dataset.search.includes(query) || card.textContent.toLowerCase().includes(query);
    card.classList.toggle('is-hidden', !(categoryMatch && topicMatch && searchMatch));
  });
}
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  updateSkillCards();
}));
topicButtons.forEach((button) => button.addEventListener('click', () => {
  activeTopic = button.dataset.topic;
  topicButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  updateSkillCards();
}));
skillSearch?.addEventListener('input', updateSkillCards);
document.getElementById('sortMatch').addEventListener('click', (event) => {
  const descending = event.currentTarget.dataset.sort !== 'desc';
  event.currentTarget.dataset.sort = descending ? 'desc' : 'asc';
  event.currentTarget.innerHTML = descending ? '匹配度最高 <span>↓</span>' : '最新发布 <span>↘</span>';
  const grid = document.querySelector('.skill-feed-grid');
  [...skillCards].sort((a, b) => (Number(b.dataset.match) - Number(a.dataset.match)) * (descending ? 1 : -1)).forEach((card) => grid.appendChild(card));
  updateSkillCards();
});

document.querySelectorAll('.skill-save').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const saved = button.classList.toggle('is-saved');
  button.textContent = saved ? '♥' : '♡';
  showToast(saved ? '已收藏这份技能档案' : '已取消收藏');
}));

const profiles = {
  linxia: { name: '林夏 Lin Xia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85', meta: '上海 · 线上 · 12 分钟前', bio: '摄影爱好者，正在学习 Python。希望把视觉经验分享给同样喜欢观察生活的人。', swap: '摄影构图 ↔ Python 入门', skills: [['摄影构图', '4', '很熟练'], ['Lightroom 后期', '3', '比较熟'], ['视觉叙事', '4', '很熟练']] },
  xiaolin: { name: '小林 Code Lin', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85', meta: '杭州 · 线上 · 昨天', bio: '喜欢把复杂的问题拆成一小步一小步，欢迎一起练习 Python 和数据思维。', swap: 'Python 入门 ↔ 吉他和弦', skills: [['Python 基础', '3', '比较熟'], ['Excel 自动化', '4', '很熟练'], ['数据可视化', '2', '有点熟'], ['吉他和弦', '1', '刚开始']] },
  ali: { name: '阿梨 A-Li', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=85', meta: '上海 · 线下 · 2 小时前', bio: '周末在家做面包，也愿意分享配方、工具和失败经验。', swap: '家庭烘焙 ↔ 数字插画', skills: [['家庭烘焙', '5', '可以教别人'], ['配方开发', '4', '很熟练'], ['手作', '3', '比较熟']] },
  mia: { name: 'Mia Chen', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85', meta: '广州 · 线上 · 昨天', bio: '用日剧、旅行和真实对话练习语言，希望认识喜欢影像的人。', swap: '日语会话 ↔ 摄影构图', skills: [['日语会话', '4', '很熟练'], ['日剧听力', '3', '比较熟'], ['旅行规划', '2', '有点熟']] },
  noah: { name: 'Noah Lin', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85', meta: '成都 · 线上 · 3 小时前', bio: '从第一个和弦开始写歌，也在找愿意一起拍音乐短片的人。', swap: '吉他和弦 ↔ 摄影', skills: [['吉他和弦', '4', '很熟练'], ['歌曲创作', '3', '比较熟'], ['家庭录音', '2', '有点熟']] },
  june: { name: 'June Studio', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=85', meta: '深圳 · 线上 · 5 小时前', bio: '喜欢把想象画成可以交换的东西，正在学习数据分析。', swap: '数字插画 ↔ Python 数据分析', skills: [['数字插画', '5', '可以教别人'], ['字体设计', '4', '很熟练'], ['拼贴创作', '4', '很熟练']] },
};

const profileModal = document.getElementById('profileModal');
const profileAction = document.getElementById('profileDetailAction');
function openProfile(key) {
  const profile = profiles[key];
  if (!profile) return;
  document.getElementById('profileDetailAvatar').src = profile.avatar;
  document.getElementById('profileDetailAvatar').alt = `${profile.name}头像`;
  document.getElementById('profileDetailName').textContent = profile.name;
  document.getElementById('profileDetailMeta').textContent = profile.meta;
  document.getElementById('profileDetailBio').textContent = profile.bio;
  document.getElementById('profileDetailSwap').textContent = `想交换 · ${profile.swap.split(' ↔ ')[1]}`;
  profileAction.dataset.swap = profile.swap;
  document.getElementById('profileDetailSkills').innerHTML = profile.skills.map(([name, stage, label]) => `<div class="detail-skill"><img src="assets/tomatoes/tomato-${stage}.png" alt="${label}" /><div><strong>${name}</strong><span>${label} · 用户自评</span></div></div>`).join('');
  profileModal.classList.add('is-open');
  profileModal.setAttribute('aria-hidden', 'false');
}
function closeProfileModal() {
  profileModal.classList.remove('is-open');
  profileModal.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.view-profile').forEach((button) => button.addEventListener('click', () => openProfile(button.dataset.profile)));
document.getElementById('profileClose').addEventListener('click', closeProfileModal);
profileModal.addEventListener('click', (event) => { if (event.target === profileModal) closeProfileModal(); });
profileAction.addEventListener('click', () => {
  const label = profileAction.dataset.swap || '摄影构图 ↔ Python 入门';
  closeProfileModal();
  openSwapModal(label);
});

const swapPreview = document.getElementById('swapPreview');
function openSwapModal(label) {
  swapPreview.textContent = label || '摄影构图 ↔ Python 入门';
  swapModal.classList.add('is-open');
  swapModal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => document.getElementById('swapMessage').focus(), 120);
}
function closeSwapModal() {
  swapModal.classList.remove('is-open');
  swapModal.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.request-swap').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  openSwapModal(button.dataset.swap);
}));
document.getElementById('swapClose').addEventListener('click', closeSwapModal);
swapModal.addEventListener('click', (event) => { if (event.target === swapModal) closeSwapModal(); });
document.getElementById('sendSwap').addEventListener('click', () => {
  if (!document.getElementById('swapMessage').value.trim()) {
    showToast('给对方留一句话吧');
    document.getElementById('swapMessage').focus();
    return;
  }
  closeSwapModal();
  document.getElementById('swapMessage').value = '';
  showToast('交换请求已发送');
});

const meTabs = document.querySelectorAll('.me-tab');
const panels = {
  skills: document.getElementById('skillsPanel'),
  bookings: document.getElementById('bookingsPanel'),
  requests: document.getElementById('requestsPanel'),
  saved: document.getElementById('savedPanel'),
};
meTabs.forEach((tab) => tab.addEventListener('click', () => {
  const target = tab.dataset.meTab;
  meTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle('is-hidden', key !== target));
}));
document.querySelectorAll('.request-accept').forEach((button) => button.addEventListener('click', () => {
  button.textContent = '已接受';
  button.classList.add('is-done');
  showToast('已接受交换请求');
}));
document.querySelectorAll('.request-decline').forEach((button) => button.addEventListener('click', () => {
  button.textContent = '已保存';
  button.classList.add('is-done');
  showToast('请求已保存到稍后处理');
}));
document.querySelectorAll('.booking-action').forEach((button) => button.addEventListener('click', () => showToast('约课详情即将打开')));
document.getElementById('bookingCalendarToggle').addEventListener('click', () => showToast('日历视图即将开放'));
document.getElementById('editProfile').addEventListener('click', () => showToast('资料编辑即将开放'));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeSearch();
  closePostModal();
  closeSwapModal();
  closeProfileModal();
});

initMotion();
