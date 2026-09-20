import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = process.env.DATABASE_PATH || join(rootDirectory, "data", "huanji.db");
const defaultPort = Number(process.env.PORT || 3000);
const sessionDurationMs = 1000 * 60 * 60 * 24 * 14;
const demoPassword = "demo1234";

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/discover", ["index.html", "text/html; charset=utf-8"]],
  ["/match", ["index.html", "text/html; charset=utf-8"]],
  ["/messages", ["index.html", "text/html; charset=utf-8"]],
  ["/profile", ["index.html", "text/html; charset=utf-8"]],
  ["/schedule", ["index.html", "text/html; charset=utf-8"]],
  ["/wallet", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

const assetRoot = join(rootDirectory, "public", "assets");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("zh-CN").replaceAll(/\s+/g, "");
}

function parseJson(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function toInteger(value, message = "参数格式不正确") {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new HttpError(400, message);
  return parsed;
}

function assertString(value, field, { min = 1, max = 240 } = {}) {
  const text = String(value || "").trim();
  if (text.length < min || text.length > max) {
    throw new HttpError(422, `${field}应为 ${min}-${max} 个字符`);
  }
  return text;
}

function passwordRecord(password) {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function passwordMatches(password, salt, storedHash) {
  const candidate = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieMap(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const delimiter = part.indexOf("=");
        return delimiter < 0 ? [part, ""] : [part.slice(0, delimiter), decodeURIComponent(part.slice(delimiter + 1))];
      }),
  );
}

function slotAt(offsetDays, time) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${time}`;
}

function defaultAvailability() {
  return [slotAt(1, "19:30"), slotAt(2, "20:00"), slotAt(3, "10:30"), slotAt(4, "15:00")];
}

function createDatabase(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      name TEXT NOT NULL,
      headline TEXT NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '线上',
      bio TEXT NOT NULL DEFAULT '',
      availability_json TEXT NOT NULL DEFAULT '[]',
      credit REAL NOT NULL DEFAULT 4.8,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('teach', 'learn')),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      modes_json TEXT NOT NULL DEFAULT '[]',
      coin_cost INTEGER NOT NULL DEFAULT 20,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL REFERENCES users(id),
      partner_id INTEGER NOT NULL REFERENCES users(id),
      mode TEXT NOT NULL CHECK(mode IN ('swap', 'coin')),
      status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'live', 'reschedule_pending', 'completed', 'cancelled', 'declined')),
      requested_skill_id INTEGER REFERENCES skills(id),
      requested_skill_name TEXT NOT NULL,
      offer_skill_id INTEGER REFERENCES skills(id),
      offer_skill_name TEXT NOT NULL DEFAULT '',
      coin_amount INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      reschedule_session_id INTEGER,
      reschedule_start_at TEXT,
      reschedule_requested_by INTEGER REFERENCES users(id),
      reschedule_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booking_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      teacher_id INTEGER NOT NULL REFERENCES users(id),
      learner_id INTEGER NOT NULL REFERENCES users(id),
      skill_name TEXT NOT NULL,
      start_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('scheduled', 'live', 'completion_pending', 'completed', 'cancelled')),
      teacher_completed INTEGER NOT NULL DEFAULT 0,
      learner_completed INTEGER NOT NULL DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      booking_id INTEGER REFERENCES bookings(id),
      kind TEXT NOT NULL CHECK(kind IN ('seed', 'lock', 'refund', 'settlement', 'reward')),
      amount INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('available', 'locked', 'settled', 'refunded')),
      title TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER NOT NULL REFERENCES users(id),
      booking_id INTEGER REFERENCES bookings(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      booking_id INTEGER REFERENCES bookings(id),
      partner_id INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(booking_id, author_id)
    );

    CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id, type, active);
    CREATE INDEX IF NOT EXISTS idx_bookings_participants ON bookings(requester_id, partner_id, status);
    CREATE INDEX IF NOT EXISTS idx_sessions_booking ON booking_sessions(booking_id, status);
    CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, recipient_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at, created_at);
  `);
  return db;
}

function one(db, sql, params = []) {
  return db.prepare(sql).get(...params) || null;
}

function all(db, sql, params = []) {
  return db.prepare(sql).all(...params);
}

function run(db, sql, params = []) {
  return db.prepare(sql).run(...params);
}

function transaction(db, operation) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function createUser(db, { email, password, name, headline, avatarUrl, city = "线上", bio = "", balance = 80, availability = defaultAvailability() }) {
  const credentials = passwordRecord(password);
  const timestamp = now();
  const inserted = run(
    db,
    `INSERT INTO users (email, password_hash, password_salt, name, headline, avatar_url, city, bio, availability_json, credit, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, credentials.hash, credentials.salt, name, headline, avatarUrl, city, bio, JSON.stringify(availability), 4.8, timestamp, timestamp],
  );
  const userId = Number(inserted.lastInsertRowid);
  run(
    db,
    `INSERT INTO wallet_transactions (user_id, kind, amount, status, title, detail, created_at)
     VALUES (?, 'seed', ?, 'available', '平台初始技能币', '用于体验技能互换和技能币约课', ?)`,
    [userId, balance, timestamp],
  );
  return userId;
}

function createSkill(db, userId, spec) {
  const timestamp = now();
  run(
    db,
    `INSERT INTO skills (user_id, type, name, category, level, duration, description, modes_json, coin_cost, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      spec.type,
      spec.name,
      spec.category,
      spec.level,
      spec.duration,
      spec.description,
      JSON.stringify(spec.modes || []),
      spec.coinCost || 20,
      timestamp,
      timestamp,
    ],
  );
}

function seedDatabase(db) {
  if (one(db, "SELECT id FROM users LIMIT 1")) return;
  transaction(db, () => {
    const linan = createUser(db, {
      email: "linan@huanji.local",
      password: demoPassword,
      name: "林安",
      headline: "职场表达与效率工具爱好者",
      avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=85",
      bio: "喜欢把复杂的事情讲清楚，也在持续学习更有创造力的表达方式。",
      balance: 128,
    });
    const heyu = createUser(db, {
      email: "heyu@huanji.local",
      password: demoPassword,
      name: "何雨",
      headline: "自然光人像摄影师",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=85",
      bio: "把镜头当作和人相处的另一种方式。",
      balance: 110,
    });
    const zhouye = createUser(db, {
      email: "zhouye@huanji.local",
      password: demoPassword,
      name: "周野",
      headline: "数据产品经理",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85",
      bio: "喜欢用小工具消灭重复劳动。",
      balance: 102,
    });
    const chenmo = createUser(db, {
      email: "chenmo@huanji.local",
      password: demoPassword,
      name: "陈默",
      headline: "独立设计师",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=85",
      bio: "用清晰的结构让想法被看见。",
      balance: 96,
    });
    const sunqi = createUser(db, {
      email: "sunqi@huanji.local",
      password: demoPassword,
      name: "孙祺",
      headline: "吉他弹唱老师",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85",
      bio: "先让手指跟上节拍，再让歌慢慢出现。",
      balance: 104,
    });
    const linwen = createUser(db, {
      email: "linwen@huanji.local",
      password: demoPassword,
      name: "林雯",
      headline: "视频创作者",
      avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=85",
      bio: "相信短视频也可以认真讲一个好故事。",
      balance: 90,
    });

    const skills = [
      [linan, { type: "teach", name: "演示表达", category: "职场技能", level: "熟练", duration: "60 分钟", description: "帮你把散乱的信息整理成有说服力的表达。", modes: ["swap", "coin"], coinCost: 18 }],
      [linan, { type: "teach", name: "Notion 整理", category: "效率工具", level: "熟练", duration: "45 分钟", description: "搭一个能长期维护的个人项目和知识系统。", modes: ["swap", "coin"], coinCost: 16 }],
      [linan, { type: "learn", name: "人像摄影", category: "摄影", level: "入门", duration: "60 分钟", description: "先学会拍出自然、舒服的人像。" }],
      [linan, { type: "learn", name: "Python 自动化", category: "效率工具", level: "入门", duration: "60 分钟", description: "从真实的重复工作开始写第一个脚本。" }],
      [heyu, { type: "teach", name: "人像摄影", category: "摄影", level: "进阶", duration: "60 分钟", description: "自然光、构图和引导，让人物在镜头前放松下来。", modes: ["swap", "coin"], coinCost: 20 }],
      [heyu, { type: "teach", name: "自然光构图", category: "摄影", level: "熟练", duration: "45 分钟", description: "理解光线方向和画面层次。", modes: ["swap", "coin"], coinCost: 16 }],
      [heyu, { type: "learn", name: "演示表达", category: "职场技能", level: "入门", duration: "60 分钟", description: "想更从容地把摄影方案讲清楚。" }],
      [heyu, { type: "learn", name: "故事结构", category: "创作表达", level: "入门", duration: "45 分钟", description: "把作品背后的想法讲得更完整。" }],
      [zhouye, { type: "teach", name: "Python 自动化", category: "效率工具", level: "熟练", duration: "60 分钟", description: "从表格清洗到批量文件处理，做出第一个自动化脚本。", modes: ["swap", "coin"], coinCost: 22 }],
      [zhouye, { type: "teach", name: "数据清洗", category: "效率工具", level: "熟练", duration: "60 分钟", description: "把混乱的数据整理成可以继续分析的样子。", modes: ["coin"], coinCost: 20 }],
      [zhouye, { type: "learn", name: "Notion 整理", category: "效率工具", level: "入门", duration: "45 分钟", description: "希望把个人项目和资料收纳得更清楚。" }],
      [chenmo, { type: "teach", name: "Figma 入门", category: "设计", level: "熟练", duration: "60 分钟", description: "建立组件意识，用一小时复刻一个清爽的移动端页面。", modes: ["swap", "coin"], coinCost: 24 }],
      [chenmo, { type: "teach", name: "页面设计", category: "设计", level: "熟练", duration: "60 分钟", description: "让版式、层级和阅读路径更清晰。", modes: ["coin"], coinCost: 22 }],
      [chenmo, { type: "learn", name: "演示表达", category: "职场技能", level: "入门", duration: "60 分钟", description: "希望汇报时不再被信息淹没。" }],
      [sunqi, { type: "teach", name: "吉他弹唱", category: "音乐", level: "进阶", duration: "45 分钟", description: "零基础先拿下四个万能和弦。", modes: ["coin"], coinCost: 18 }],
      [sunqi, { type: "learn", name: "个人作品集", category: "创意技能", level: "入门", duration: "60 分钟", description: "想把教学经历整理成一份作品。" }],
      [linwen, { type: "teach", name: "短视频剪辑", category: "创作表达", level: "熟练", duration: "60 分钟", description: "用节奏、声音和转场讲清一个观点。", modes: ["swap"], coinCost: 0 }],
      [linwen, { type: "teach", name: "内容脚本", category: "创作表达", level: "熟练", duration: "45 分钟", description: "让一个视频有明确的开头、推进和落点。", modes: ["swap", "coin"], coinCost: 17 }],
      [linwen, { type: "learn", name: "Python 自动化", category: "效率工具", level: "入门", duration: "60 分钟", description: "希望批量整理视频素材和文件。" }],
    ];
    skills.forEach(([userId, spec]) => createSkill(db, userId, spec));
  });
}

function getUser(db, userId) {
  return one(db, "SELECT * FROM users WHERE id = ?", [userId]);
}

function getSkills(db, userId, type) {
  const params = [userId];
  let sql = "SELECT * FROM skills WHERE user_id = ? AND active = 1";
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  sql += " ORDER BY id DESC";
  return all(db, sql, params).map((skill) => ({
    id: Number(skill.id),
    type: skill.type,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    duration: skill.duration,
    description: skill.description,
    modes: parseJson(skill.modes_json, []),
    coinCost: Number(skill.coin_cost),
  }));
}

function walletBalance(db, userId) {
  const result = one(db, "SELECT COALESCE(SUM(amount), 0) AS balance FROM wallet_transactions WHERE user_id = ?", [userId]);
  return Number(result?.balance || 0);
}

function completionCount(db, userId) {
  const result = one(
    db,
    `SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed' AND (requester_id = ? OR partner_id = ?)`,
    [userId, userId],
  );
  return Number(result?.count || 0);
}

function publicUser(db, userId) {
  const user = getUser(db, userId);
  if (!user) return null;
  return {
    id: Number(user.id),
    name: user.name,
    headline: user.headline,
    avatar: user.avatar_url,
    city: user.city,
    bio: user.bio,
    credit: Number(user.credit).toFixed(1),
    availability: parseJson(user.availability_json, []),
    completedCount: completionCount(db, userId),
  };
}

function privateUser(db, userId) {
  const user = publicUser(db, userId);
  if (!user) return null;
  return {
    ...user,
    email: getUser(db, userId).email,
    canTeach: getSkills(db, userId, "teach"),
    wantToLearn: getSkills(db, userId, "learn"),
    coinBalance: walletBalance(db, userId),
  };
}

function skillsOverlap(left, right) {
  return left.filter((leftSkill) =>
    right.some((rightSkill) => {
      const leftName = normalizeText(leftSkill.name || leftSkill);
      const rightName = normalizeText(rightSkill.name || rightSkill);
      const leftCategory = normalizeText(leftSkill.category || "");
      const rightCategory = normalizeText(rightSkill.category || "");
      return leftName.includes(rightName) || rightName.includes(leftName) || (leftCategory && leftCategory === rightCategory && leftName.slice(0, 2) === rightName.slice(0, 2));
    }),
  );
}

function commonSlots(left, right) {
  const rightSet = new Set(right);
  return left.filter((slot) => rightSet.has(slot)).sort();
}

function getMatches(db, userId, { query = "", mode = "all" } = {}) {
  const currentTeach = getSkills(db, userId, "teach");
  const currentLearn = getSkills(db, userId, "learn");
  const currentAvailability = publicUser(db, userId).availability;
  const otherUsers = all(db, "SELECT id FROM users WHERE id <> ? ORDER BY id", [userId]);
  const normalizedQuery = normalizeText(query);

  return otherUsers
    .map(({ id }) => {
      const partner = publicUser(db, Number(id));
      const teaches = getSkills(db, Number(id), "teach");
      const wants = getSkills(db, Number(id), "learn");
      const learnMatches = skillsOverlap(teaches, currentLearn);
      const reciprocalMatches = skillsOverlap(currentTeach, wants);
      const highlightedSkill = learnMatches[0] || teaches[0];
      const availableModes = [...new Set(highlightedSkill?.modes || [])];
      const slots = commonSlots(currentAvailability, partner.availability);
      const score = Math.min(99, Math.max(58, 58 + learnMatches.length * 18 + reciprocalMatches.length * 15 + (slots.length ? 5 : 0)));
      const searchText = [partner.name, partner.headline, ...teaches.map((skill) => skill.name), ...wants.map((skill) => skill.name), highlightedSkill?.description || ""].join(" ");
      return {
        ...partner,
        teaches,
        wants,
        highlightedSkill,
        modes: availableModes,
        commonSlots: slots,
        score,
        reasons: [
          learnMatches[0] ? `她能教你 ${learnMatches[0].name}` : "可从她的技能卡开始了解",
          reciprocalMatches[0] ? `你能回馈她 ${reciprocalMatches[0].name}` : "可以用技能币直接约课",
          slots.length ? `你们有 ${slots.length} 个共同可约时段` : "可先通过聊天协商时段",
        ],
        searchText,
      };
    })
    .filter((partner) => mode === "all" || partner.modes.includes(mode))
    .filter((partner) => !normalizedQuery || normalizeText(partner.searchText).includes(normalizedQuery))
    .sort((left, right) => right.score - left.score)
    .map(({ searchText, ...partner }) => partner);
}

function bookingSessions(db, booking, viewerId) {
  return all(db, "SELECT * FROM booking_sessions WHERE booking_id = ? ORDER BY start_at, id", [booking.id]).map((session) => ({
    id: Number(session.id),
    skill: session.skill_name,
    startAt: session.start_at,
    status: session.status,
    teacherId: Number(session.teacher_id),
    learnerId: Number(session.learner_id),
    kind: Number(session.teacher_id) === viewerId ? "teach" : "learn",
    teacherCompleted: Boolean(session.teacher_completed),
    learnerCompleted: Boolean(session.learner_completed),
    canStart: session.status === "scheduled" && Number(session.teacher_id) === viewerId,
    canConfirm: ["live", "completion_pending"].includes(session.status) && (Number(session.teacher_id) === viewerId || Number(session.learner_id) === viewerId) && !(Number(session.teacher_id) === viewerId ? session.teacher_completed : session.learner_completed),
  }));
}

function listBookings(db, userId) {
  const rows = all(
    db,
    `SELECT * FROM bookings WHERE requester_id = ? OR partner_id = ? ORDER BY
      CASE status WHEN 'pending' THEN 0 WHEN 'reschedule_pending' THEN 1 WHEN 'live' THEN 2 WHEN 'confirmed' THEN 3 ELSE 4 END,
      updated_at DESC`,
    [userId, userId],
  );
  return rows.map((booking) => {
    const partnerId = Number(booking.requester_id) === userId ? Number(booking.partner_id) : Number(booking.requester_id);
    const sessions = bookingSessions(db, booking, userId);
    const rescheduleSession = booking.reschedule_session_id ? sessions.find((session) => session.id === Number(booking.reschedule_session_id)) : null;
    const anyStarted = sessions.some((session) => !["scheduled", "cancelled"].includes(session.status));
    return {
      id: Number(booking.id),
      requesterId: Number(booking.requester_id),
      partnerId,
      partner: publicUser(db, partnerId),
      mode: booking.mode,
      status: booking.status,
      requestedSkillName: booking.requested_skill_name,
      offerSkillName: booking.offer_skill_name,
      coinAmount: Number(booking.coin_amount),
      note: booking.note,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      sessions,
      reschedule: booking.status === "reschedule_pending" ? {
        sessionId: Number(booking.reschedule_session_id),
        sessionName: rescheduleSession?.skill || "课程",
        originalStartAt: rescheduleSession?.startAt || "",
        proposedStartAt: booking.reschedule_start_at,
        requestedBy: Number(booking.reschedule_requested_by),
        note: booking.reschedule_note,
      } : null,
      canAccept: booking.status === "pending" && Number(booking.partner_id) === userId,
      canDecline: booking.status === "pending" && Number(booking.partner_id) === userId,
      canCancel: ["pending", "confirmed", "reschedule_pending"].includes(booking.status) && !anyStarted && (Number(booking.requester_id) === userId || booking.status !== "pending"),
      canRequestReschedule: booking.status === "confirmed" && !anyStarted,
      canAcceptReschedule: booking.status === "reschedule_pending" && Number(booking.reschedule_requested_by) !== userId,
      canDeclineReschedule: booking.status === "reschedule_pending" && Number(booking.reschedule_requested_by) !== userId,
      canReview: booking.status === "completed" && !one(db, "SELECT id FROM reviews WHERE booking_id = ? AND author_id = ?", [booking.id, userId]),
    };
  });
}

function listWallet(db, userId) {
  return all(
    db,
    "SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50",
    [userId],
  ).map((entry) => ({
    id: Number(entry.id),
    bookingId: entry.booking_id ? Number(entry.booking_id) : null,
    kind: entry.kind,
    amount: Number(entry.amount),
    status: entry.status,
    title: entry.title,
    detail: entry.detail,
    createdAt: entry.created_at,
  }));
}

function listNotifications(db, userId) {
  return all(
    db,
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 30",
    [userId],
  ).map((notification) => ({
    id: Number(notification.id),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    bookingId: notification.booking_id ? Number(notification.booking_id) : null,
    partnerId: notification.partner_id ? Number(notification.partner_id) : null,
    createdAt: notification.created_at,
    read: Boolean(notification.read_at),
  }));
}

function listConversations(db, userId) {
  const peerRows = all(
    db,
    `SELECT DISTINCT CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS partner_id
     FROM messages WHERE sender_id = ? OR recipient_id = ?
     UNION
     SELECT DISTINCT CASE WHEN requester_id = ? THEN partner_id ELSE requester_id END AS partner_id
     FROM bookings WHERE requester_id = ? OR partner_id = ?`,
    [userId, userId, userId, userId, userId, userId],
  );
  return peerRows
    .map(({ partner_id: partnerId }) => {
      const last = one(
        db,
        `SELECT * FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [userId, partnerId, partnerId, userId],
      );
      const unread = one(
        db,
        "SELECT COUNT(*) AS count FROM messages WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL",
        [partnerId, userId],
      );
      return {
        partner: publicUser(db, Number(partnerId)),
        lastMessage: last ? { body: last.body, createdAt: last.created_at } : null,
        unreadCount: Number(unread?.count || 0),
      };
    })
    .filter((conversation) => conversation.partner)
    .sort((left, right) => String(right.lastMessage?.createdAt || "").localeCompare(String(left.lastMessage?.createdAt || "")));
}

function listConversationMessages(db, userId, partnerId) {
  run(db, "UPDATE messages SET read_at = ? WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL", [now(), partnerId, userId]);
  return all(
    db,
    `SELECT * FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
     ORDER BY created_at, id`,
    [userId, partnerId, partnerId, userId],
  ).map((message) => ({
    id: Number(message.id),
    senderId: Number(message.sender_id),
    recipientId: Number(message.recipient_id),
    body: message.body,
    createdAt: message.created_at,
    own: Number(message.sender_id) === userId,
  }));
}

function listReviews(db, userId) {
  return all(
    db,
    `SELECT r.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM reviews r JOIN users u ON u.id = r.author_id
     WHERE r.recipient_id = ? ORDER BY r.created_at DESC LIMIT 8`,
    [userId],
  ).map((review) => ({
    id: Number(review.id),
    rating: Number(review.rating),
    comment: review.comment,
    createdAt: review.created_at,
    author: { id: Number(review.author_id), name: review.author_name, avatar: review.author_avatar },
  }));
}

function platformSnapshot(db, userId, search = "", mode = "all") {
  const user = privateUser(db, userId);
  return {
    user,
    matches: getMatches(db, userId, { query: search, mode }),
    bookings: listBookings(db, userId),
    wallet: listWallet(db, userId),
    notifications: listNotifications(db, userId),
    conversations: listConversations(db, userId),
    reviews: listReviews(db, userId),
    stats: {
      completedCount: completionCount(db, userId),
      unreadMessages: Number(one(db, "SELECT COUNT(*) AS count FROM messages WHERE recipient_id = ? AND read_at IS NULL", [userId])?.count || 0),
      unreadNotifications: Number(one(db, "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL", [userId])?.count || 0),
    },
  };
}

function notify(db, userId, type, title, body, { bookingId = null, partnerId = null } = {}) {
  run(
    db,
    `INSERT INTO notifications (user_id, type, title, body, booking_id, partner_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, title, body, bookingId, partnerId, now()],
  );
}

function addMessage(db, senderId, recipientId, body, bookingId = null) {
  const result = run(
    db,
    "INSERT INTO messages (sender_id, recipient_id, booking_id, body, created_at) VALUES (?, ?, ?, ?, ?)",
    [senderId, recipientId, bookingId, body, now()],
  );
  return Number(result.lastInsertRowid);
}

function getBooking(db, bookingId) {
  return one(db, "SELECT * FROM bookings WHERE id = ?", [bookingId]);
}

function assertBookingParticipant(booking, userId) {
  if (!booking || (Number(booking.requester_id) !== userId && Number(booking.partner_id) !== userId)) {
    throw new HttpError(404, "未找到这条约课记录");
  }
}

function findMatchingSkill(skills, targetSkills) {
  return skillsOverlap(skills, targetSkills)[0] || null;
}

function refundLockedCoins(db, booking, detail) {
  if (booking.mode !== "coin" || Number(booking.coin_amount) <= 0) return;
  const lock = one(
    db,
    "SELECT * FROM wallet_transactions WHERE booking_id = ? AND user_id = ? AND kind = 'lock' LIMIT 1",
    [booking.id, booking.requester_id],
  );
  if (!lock || lock.status !== "locked") return;
  run(db, "UPDATE wallet_transactions SET status = 'refunded', detail = ? WHERE id = ?", [detail, lock.id]);
  run(
    db,
    `INSERT INTO wallet_transactions (user_id, booking_id, kind, amount, status, title, detail, created_at)
     VALUES (?, ?, 'refund', ?, 'available', ?, ?, ?)`,
    [booking.requester_id, booking.id, Math.abs(Number(lock.amount)), `退款 · ${booking.requested_skill_name}`, detail, now()],
  );
}

function settleBooking(db, booking) {
  if (booking.mode === "coin") {
    const lock = one(
      db,
      "SELECT * FROM wallet_transactions WHERE booking_id = ? AND user_id = ? AND kind = 'lock' LIMIT 1",
      [booking.id, booking.requester_id],
    );
    if (lock?.status === "locked") {
      run(db, "UPDATE wallet_transactions SET status = 'settled', detail = ? WHERE id = ?", ["课程已完成，已结算", lock.id]);
      run(
        db,
        `INSERT INTO wallet_transactions (user_id, booking_id, kind, amount, status, title, detail, created_at)
         VALUES (?, ?, 'settlement', ?, 'settled', ?, ?, ?)`,
        [booking.partner_id, booking.id, booking.coin_amount, `授课结算 · ${booking.requested_skill_name}`, "学习双方已确认完成", now()],
      );
    }
    return;
  }

  for (const userId of [booking.requester_id, booking.partner_id]) {
    const reward = one(db, "SELECT id FROM wallet_transactions WHERE booking_id = ? AND user_id = ? AND kind = 'reward'", [booking.id, userId]);
    if (!reward) {
      run(
        db,
        `INSERT INTO wallet_transactions (user_id, booking_id, kind, amount, status, title, detail, created_at)
         VALUES (?, ?, 'reward', 8, 'settled', '守约奖励 · 技能互换', '双方完成全部互换课程', ?)`,
        [userId, booking.id, now()],
      );
    }
  }
}

function recomputeBookingStatus(db, booking) {
  const sessions = all(db, "SELECT status FROM booking_sessions WHERE booking_id = ?", [booking.id]);
  if (sessions.length && sessions.every((session) => session.status === "completed")) {
    run(db, "UPDATE bookings SET status = 'completed', updated_at = ? WHERE id = ?", [now(), booking.id]);
    settleBooking(db, booking);
    return "completed";
  }
  if (sessions.some((session) => ["live", "completion_pending"].includes(session.status))) {
    run(db, "UPDATE bookings SET status = 'live', updated_at = ? WHERE id = ?", [now(), booking.id]);
    return "live";
  }
  run(db, "UPDATE bookings SET status = 'confirmed', updated_at = ? WHERE id = ?", [now(), booking.id]);
  return "confirmed";
}

function updateCredit(db, userId) {
  const row = one(db, "SELECT AVG(rating) AS average FROM reviews WHERE recipient_id = ?", [userId]);
  const completed = completionCount(db, userId);
  const average = Number(row?.average || 4.5);
  const credit = Math.min(5, Math.max(4.0, 4.08 + average * 0.16 + Math.min(20, completed) * 0.006));
  run(db, "UPDATE users SET credit = ?, updated_at = ? WHERE id = ?", [credit, now(), userId]);
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new HttpError(413, "请求内容过大");
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, "请求内容不是有效 JSON");
  }
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, error) {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError ? error.message : "服务器处理请求时出现问题";
  if (!(error instanceof HttpError)) console.error(error);
  sendJson(response, status, { error: message });
}

function sessionUser(db, request) {
  const cookies = cookieMap(request.headers.cookie);
  const token = cookies.huanji_session;
  if (!token) return null;
  const session = one(
    db,
    `SELECT s.*, u.id AS user_id FROM auth_sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    [tokenHash(token), now()],
  );
  return session ? Number(session.user_id) : null;
}

function requireSession(db, request) {
  const userId = sessionUser(db, request);
  if (!userId) throw new HttpError(401, "请先登录后再继续");
  return userId;
}

function issueSession(db, response, userId) {
  const token = randomBytes(32).toString("base64url");
  const expiration = new Date(Date.now() + sessionDurationMs).toISOString();
  run(db, "INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", [tokenHash(token), userId, expiration, now()]);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `huanji_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionDurationMs / 1000)}${secure}`;
}

function clearSession(db, request) {
  const token = cookieMap(request.headers.cookie).huanji_session;
  if (token) run(db, "DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash(token)]);
}

function hasMode(skill, mode) {
  return parseJson(skill.modes_json, []).includes(mode);
}

function validateSlot(slot, allowedSlots) {
  if (!allowedSlots.includes(slot)) throw new HttpError(422, "所选时段不在双方共同可约时间内");
  return slot;
}

function createBooking(db, requesterId, input) {
  const partnerId = toInteger(input.partnerId, "搭档信息不正确");
  const requestedSkillId = toInteger(input.requestedSkillId, "请选择想学的技能");
  const mode = input.mode === "swap" ? "swap" : input.mode === "coin" ? "coin" : null;
  if (!mode) throw new HttpError(422, "请选择交换方式");
  if (partnerId === requesterId) throw new HttpError(422, "不能向自己发起交换");
  const partner = getUser(db, partnerId);
  if (!partner) throw new HttpError(404, "这位搭档暂时不可用");
  const requestedSkill = one(db, "SELECT * FROM skills WHERE id = ? AND user_id = ? AND type = 'teach' AND active = 1", [requestedSkillId, partnerId]);
  if (!requestedSkill || !hasMode(requestedSkill, mode)) throw new HttpError(422, "这个技能当前不支持所选交换方式");

  const existing = one(
    db,
    `SELECT id FROM bookings WHERE requester_id = ? AND partner_id = ? AND requested_skill_id = ?
     AND status IN ('pending', 'confirmed', 'live', 'reschedule_pending')`,
    [requesterId, partnerId, requestedSkillId],
  );
  if (existing) throw new HttpError(409, "你们已经有一条进行中的相同约课");

  const requesterAvailability = publicUser(db, requesterId).availability;
  const partnerAvailability = publicUser(db, partnerId).availability;
  const slots = commonSlots(requesterAvailability, partnerAvailability);
  if (!slots.length) throw new HttpError(422, "你们暂时没有共同可约时间，可先更新个人可约时间");
  const learnAt = validateSlot(assertString(input.learnAt, "学习时段", { max: 32 }), slots);
  const note = String(input.note || "").trim().slice(0, 180);
  let offerSkill = null;
  let teachAt = null;
  let coinAmount = 0;

  if (mode === "swap") {
    const offerSkillId = toInteger(input.offerSkillId, "请选择用于互换的技能");
    offerSkill = one(db, "SELECT * FROM skills WHERE id = ? AND user_id = ? AND type = 'teach' AND active = 1", [offerSkillId, requesterId]);
    if (!offerSkill) throw new HttpError(422, "互换技能已不可用");
    const partnerWants = getSkills(db, partnerId, "learn");
    if (!findMatchingSkill([{ name: offerSkill.name, category: offerSkill.category }], partnerWants)) {
      throw new HttpError(422, "请选择对方明确想学习的技能进行互换");
    }
    teachAt = validateSlot(assertString(input.teachAt, "回馈时段", { max: 32 }), slots);
  } else {
    coinAmount = Number(requestedSkill.coin_cost);
    if (walletBalance(db, requesterId) < coinAmount) throw new HttpError(422, "技能币余额不足，暂时无法发起这次约课");
  }

  return transaction(db, () => {
    const timestamp = now();
    const inserted = run(
      db,
      `INSERT INTO bookings (requester_id, partner_id, mode, status, requested_skill_id, requested_skill_name, offer_skill_id, offer_skill_name, coin_amount, note, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [requesterId, partnerId, mode, requestedSkillId, requestedSkill.name, offerSkill?.id || null, offerSkill?.name || "", coinAmount, note, timestamp, timestamp],
    );
    const bookingId = Number(inserted.lastInsertRowid);
    run(
      db,
      `INSERT INTO booking_sessions (booking_id, teacher_id, learner_id, skill_name, start_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'scheduled', ?)`,
      [bookingId, partnerId, requesterId, requestedSkill.name, learnAt, timestamp],
    );
    if (mode === "swap") {
      run(
        db,
        `INSERT INTO booking_sessions (booking_id, teacher_id, learner_id, skill_name, start_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'scheduled', ?)`,
        [bookingId, requesterId, partnerId, offerSkill.name, teachAt, timestamp],
      );
    } else {
      run(
        db,
        `INSERT INTO wallet_transactions (user_id, booking_id, kind, amount, status, title, detail, created_at)
         VALUES (?, ?, 'lock', ?, 'locked', ?, ?, ?)`,
        [requesterId, bookingId, -coinAmount, `锁定 · ${requestedSkill.name}`, "等待对方确认约课", timestamp],
      );
    }
    const requester = getUser(db, requesterId);
    notify(
      db,
      partnerId,
      "incoming",
      `${requester.name} 向你发起${mode === "swap" ? "技能互换" : "技能币约课"}`,
      mode === "swap" ? `用「${offerSkill.name}」交换你的「${requestedSkill.name}」。` : `希望学习你的「${requestedSkill.name}」。`,
      { bookingId, partnerId: requesterId },
    );
    if (note) addMessage(db, requesterId, partnerId, note, bookingId);
    return bookingId;
  });
}

function acceptBooking(db, bookingId, userId) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "pending" || Number(booking.partner_id) !== userId) throw new HttpError(409, "这条邀请当前不能接受");
    run(db, "UPDATE bookings SET status = 'confirmed', updated_at = ? WHERE id = ?", [now(), bookingId]);
    const partner = getUser(db, userId);
    notify(db, booking.requester_id, "confirmed", `${partner.name} 已确认约课`, `「${booking.requested_skill_name}」已进入双方日程。`, { bookingId, partnerId: userId });
    addMessage(db, userId, booking.requester_id, "我已确认这次约课，期待线上见。", bookingId);
  });
}

function declineBooking(db, bookingId, userId) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "pending" || Number(booking.partner_id) !== userId) throw new HttpError(409, "这条邀请当前不能婉拒");
    run(db, "UPDATE bookings SET status = 'declined', updated_at = ? WHERE id = ?", [now(), bookingId]);
    run(db, "UPDATE booking_sessions SET status = 'cancelled' WHERE booking_id = ?", [bookingId]);
    refundLockedCoins(db, booking, "对方未能确认，技能币已退回");
    const partner = getUser(db, userId);
    notify(db, booking.requester_id, "declined", `${partner.name} 未能确认约课`, "相关日程未创建；若使用了技能币，金额已退回钱包。", { bookingId, partnerId: userId });
  });
}

function cancelBooking(db, bookingId, userId) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (!["pending", "confirmed", "reschedule_pending"].includes(booking.status)) throw new HttpError(409, "这条约课当前不能取消");
    if (booking.status === "pending" && Number(booking.requester_id) !== userId) throw new HttpError(403, "等待你处理的邀请请使用接受或婉拒");
    const started = one(db, "SELECT id FROM booking_sessions WHERE booking_id = ? AND status <> 'scheduled'", [bookingId]);
    if (started) throw new HttpError(409, "已有课程开始或完成，不能直接取消");
    run(db, "UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE id = ?", [now(), bookingId]);
    run(db, "UPDATE booking_sessions SET status = 'cancelled' WHERE booking_id = ?", [bookingId]);
    refundLockedCoins(db, booking, "约课已取消，技能币已退回");
    const otherUserId = Number(booking.requester_id) === userId ? Number(booking.partner_id) : Number(booking.requester_id);
    const actor = getUser(db, userId);
    notify(db, otherUserId, "cancelled", `${actor.name} 取消了约课`, "这次约课已从双方日程移除。", { bookingId, partnerId: userId });
  });
}

function requestReschedule(db, bookingId, userId, input) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "confirmed") throw new HttpError(409, "当前约课不能调整时间");
    const sessionId = toInteger(input.sessionId, "请选择需要调整的课程");
    const session = one(db, "SELECT * FROM booking_sessions WHERE id = ? AND booking_id = ?", [sessionId, bookingId]);
    if (!session || session.status !== "scheduled") throw new HttpError(409, "这节课当前不能调整时间");
    const otherUserId = Number(booking.requester_id) === userId ? Number(booking.partner_id) : Number(booking.requester_id);
    const slots = commonSlots(publicUser(db, userId).availability, publicUser(db, otherUserId).availability);
    const startAt = validateSlot(assertString(input.startAt, "新时段", { max: 32 }), slots);
    const note = String(input.note || "").trim().slice(0, 180);
    run(
      db,
      `UPDATE bookings SET status = 'reschedule_pending', reschedule_session_id = ?, reschedule_start_at = ?, reschedule_requested_by = ?, reschedule_note = ?, updated_at = ? WHERE id = ?`,
      [sessionId, startAt, userId, note, now(), bookingId],
    );
    const actor = getUser(db, userId);
    notify(db, otherUserId, "pending", `${actor.name} 请求调整约课时间`, `${session.skill_name} 希望改到 ${startAt}${note ? `：${note}` : ""}`, { bookingId, partnerId: userId });
  });
}

function respondReschedule(db, bookingId, userId, accepted) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "reschedule_pending" || Number(booking.reschedule_requested_by) === userId) throw new HttpError(409, "当前没有需要你处理的改期请求");
    const requesterId = Number(booking.reschedule_requested_by);
    if (accepted) {
      run(db, "UPDATE booking_sessions SET start_at = ? WHERE id = ? AND booking_id = ?", [booking.reschedule_start_at, booking.reschedule_session_id, bookingId]);
    }
    run(
      db,
      `UPDATE bookings SET status = 'confirmed', reschedule_session_id = NULL, reschedule_start_at = NULL, reschedule_requested_by = NULL, reschedule_note = '', updated_at = ? WHERE id = ?`,
      [now(), bookingId],
    );
    const actor = getUser(db, userId);
    notify(
      db,
      requesterId,
      accepted ? "confirmed" : "declined",
      accepted ? `${actor.name} 已确认新时段` : `${actor.name} 未接受改期`,
      accepted ? "新时间已更新到双方日程。" : "原定时段仍然有效。",
      { bookingId, partnerId: userId },
    );
  });
}

function startSession(db, bookingId, sessionId, userId) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "confirmed") throw new HttpError(409, "约课尚未处于可开始状态");
    const session = one(db, "SELECT * FROM booking_sessions WHERE id = ? AND booking_id = ?", [sessionId, bookingId]);
    if (!session || session.status !== "scheduled") throw new HttpError(409, "这节课当前不能开始");
    if (Number(session.teacher_id) !== userId) throw new HttpError(403, "只有授课方可以开始这节线上课");
    run(db, "UPDATE booking_sessions SET status = 'live', started_at = ? WHERE id = ?", [now(), sessionId]);
    run(db, "UPDATE bookings SET status = 'live', updated_at = ? WHERE id = ?", [now(), bookingId]);
    notify(db, session.learner_id, "live", `${getUser(db, userId).name} 已开始「${session.skill_name}」`, "请进入约课页面并在结束后确认完成。", { bookingId, partnerId: userId });
  });
}

function completeSession(db, bookingId, sessionId, userId) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (!["live", "completion_pending"].includes(booking.status)) throw new HttpError(409, "这节课当前不能确认完成");
    const session = one(db, "SELECT * FROM booking_sessions WHERE id = ? AND booking_id = ?", [sessionId, bookingId]);
    if (!session || !["live", "completion_pending"].includes(session.status)) throw new HttpError(409, "这节课当前不能确认完成");
    if (Number(session.teacher_id) === userId) {
      run(db, "UPDATE booking_sessions SET teacher_completed = 1 WHERE id = ?", [sessionId]);
    } else if (Number(session.learner_id) === userId) {
      run(db, "UPDATE booking_sessions SET learner_completed = 1 WHERE id = ?", [sessionId]);
    } else {
      throw new HttpError(403, "你不在这节课的参与者名单中");
    }
    const updated = one(db, "SELECT * FROM booking_sessions WHERE id = ?", [sessionId]);
    const otherUserId = Number(updated.teacher_id) === userId ? Number(updated.learner_id) : Number(updated.teacher_id);
    if (updated.teacher_completed && updated.learner_completed) {
      run(db, "UPDATE booking_sessions SET status = 'completed', completed_at = ? WHERE id = ?", [now(), sessionId]);
      const finalStatus = recomputeBookingStatus(db, booking);
      if (finalStatus === "completed") {
        const partner = getUser(db, otherUserId);
        notify(db, booking.requester_id, "completed", "全部约课已完成", `请为 ${partner.name} 留下真实评价。`, { bookingId, partnerId: otherUserId });
        notify(db, booking.partner_id, "completed", "全部约课已完成", "这次交换已经结算，可以互相留下评价。", { bookingId, partnerId: Number(booking.requester_id) });
      } else {
        notify(db, otherUserId, "completed", `「${updated.skill_name}」已完成`, "剩余课程仍保留在日程中。", { bookingId, partnerId: userId });
      }
    } else {
      run(db, "UPDATE booking_sessions SET status = 'completion_pending' WHERE id = ?", [sessionId]);
      run(db, "UPDATE bookings SET status = 'live', updated_at = ? WHERE id = ?", [now(), bookingId]);
      notify(db, otherUserId, "pending", `${getUser(db, userId).name} 已确认课程完成`, `请确认「${updated.skill_name}」是否已结束。`, { bookingId, partnerId: userId });
    }
  });
}

function submitReview(db, bookingId, userId, input) {
  return transaction(db, () => {
    const booking = getBooking(db, bookingId);
    assertBookingParticipant(booking, userId);
    if (booking.status !== "completed") throw new HttpError(409, "完成全部课程后才能评价");
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(422, "请选择 1 到 5 星评价");
    const comment = assertString(input.comment, "评价内容", { min: 4, max: 240 });
    const recipientId = Number(booking.requester_id) === userId ? Number(booking.partner_id) : Number(booking.requester_id);
    const existing = one(db, "SELECT id FROM reviews WHERE booking_id = ? AND author_id = ?", [bookingId, userId]);
    if (existing) throw new HttpError(409, "你已经评价过这次交换");
    run(
      db,
      "INSERT INTO reviews (booking_id, author_id, recipient_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [bookingId, userId, recipientId, rating, comment, now()],
    );
    updateCredit(db, recipientId);
    notify(db, recipientId, "review", `${getUser(db, userId).name} 留下了评价`, `“${comment}”`, { bookingId, partnerId: userId });
  });
}

function updateProfile(db, userId, input) {
  const name = assertString(input.name, "昵称", { min: 1, max: 20 });
  const city = assertString(input.city, "授课方式", { min: 1, max: 24 });
  const bio = assertString(input.bio, "个人介绍", { min: 1, max: 180 });
  const headline = assertString(input.headline || "技能互换学习者", "一句话介绍", { min: 1, max: 40 });
  const availability = Array.isArray(input.availability) ? [...new Set(input.availability.map((slot) => String(slot).trim()).filter(Boolean))].slice(0, 12) : null;
  if (availability && availability.some((slot) => !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(slot))) throw new HttpError(422, "可约时间格式不正确");
  run(
    db,
    "UPDATE users SET name = ?, city = ?, bio = ?, headline = ?, availability_json = COALESCE(?, availability_json), updated_at = ? WHERE id = ?",
    [name, city, bio, headline, availability ? JSON.stringify(availability) : null, now(), userId],
  );
}

function writeSkill(db, userId, input, skillId = null) {
  const type = input.type === "teach" ? "teach" : input.type === "learn" ? "learn" : null;
  if (!type) throw new HttpError(422, "请选择技能方向");
  const name = assertString(input.name, "技能名称", { min: 1, max: 30 });
  const category = assertString(input.category, "技能分类", { min: 1, max: 20 });
  const level = assertString(input.level, "熟练程度", { min: 1, max: 12 });
  const duration = assertString(input.duration, "单次时长", { min: 1, max: 16 });
  const description = String(input.description || "").trim().slice(0, 180);
  const modes = type === "teach" ? [...new Set((Array.isArray(input.modes) ? input.modes : []).filter((mode) => ["swap", "coin"].includes(mode)))] : [];
  const coinCost = type === "teach" ? Number(input.coinCost || 20) : 0;
  if (type === "teach" && !modes.length) throw new HttpError(422, "至少选择一种交换方式");
  if (type === "teach" && (!Number.isInteger(coinCost) || coinCost < 1 || coinCost > 300)) throw new HttpError(422, "技能币价格应为 1 到 300");
  if (skillId) {
    const existing = one(db, "SELECT * FROM skills WHERE id = ? AND user_id = ?", [skillId, userId]);
    if (!existing) throw new HttpError(404, "没有找到这项技能");
    run(
      db,
      `UPDATE skills SET type = ?, name = ?, category = ?, level = ?, duration = ?, description = ?, modes_json = ?, coin_cost = ?, updated_at = ? WHERE id = ?`,
      [type, name, category, level, duration, description, JSON.stringify(modes), coinCost, now(), skillId],
    );
    return Number(skillId);
  }
  const inserted = run(
    db,
    `INSERT INTO skills (user_id, type, name, category, level, duration, description, modes_json, coin_cost, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, name, category, level, duration, description, JSON.stringify(modes), coinCost, now(), now()],
  );
  return Number(inserted.lastInsertRowid);
}

function deleteSkill(db, userId, skillId) {
  const skill = one(db, "SELECT * FROM skills WHERE id = ? AND user_id = ? AND active = 1", [skillId, userId]);
  if (!skill) throw new HttpError(404, "没有找到这项技能");
  const typeCount = one(db, "SELECT COUNT(*) AS count FROM skills WHERE user_id = ? AND type = ? AND active = 1", [userId, skill.type]);
  if (Number(typeCount.count) <= 1) throw new HttpError(422, "至少保留一项可教或想学技能，匹配才能继续工作");
  run(db, "UPDATE skills SET active = 0, updated_at = ? WHERE id = ?", [now(), skillId]);
}

function registerUser(db, input) {
  const email = assertString(input.email, "邮箱", { min: 5, max: 80 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(422, "请输入有效邮箱");
  const password = assertString(input.password, "密码", { min: 8, max: 80 });
  const name = assertString(input.name, "昵称", { min: 1, max: 20 });
  if (one(db, "SELECT id FROM users WHERE email = ?", [email])) throw new HttpError(409, "该邮箱已经注册，请直接登录");
  return transaction(db, () => createUser(db, {
    email,
    password,
    name,
    headline: "新的技能交换学习者",
    avatarUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`,
    bio: "刚来到换技，正在整理自己的技能档案。",
    balance: 80,
  }));
}

async function handleApi(db, request, response, url) {
  const method = request.method || "GET";
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, service: "huanji", database: "sqlite" });
  }
  if (method === "GET" && pathname === "/api/demo-accounts") {
    return sendJson(response, 200, {
      password: demoPassword,
      accounts: all(db, "SELECT email, name, headline FROM users ORDER BY id LIMIT 6"),
    });
  }
  if (method === "POST" && pathname === "/api/auth/register") {
    const input = await readJson(request);
    const userId = registerUser(db, input);
    const cookie = issueSession(db, response, userId);
    return sendJson(response, 201, { user: privateUser(db, userId) }, { "set-cookie": cookie });
  }
  if (method === "POST" && pathname === "/api/auth/login") {
    const input = await readJson(request);
    const email = assertString(input.email, "邮箱", { min: 5, max: 80 }).toLowerCase();
    const password = assertString(input.password, "密码", { min: 1, max: 80 });
    const user = one(db, "SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !passwordMatches(password, user.password_salt, user.password_hash)) throw new HttpError(401, "邮箱或密码不正确");
    const cookie = issueSession(db, response, user.id);
    return sendJson(response, 200, { user: privateUser(db, Number(user.id)) }, { "set-cookie": cookie });
  }
  if (method === "POST" && pathname === "/api/auth/logout") {
    clearSession(db, request);
    return sendJson(response, 204, null, { "set-cookie": "huanji_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax" });
  }

  const userId = requireSession(db, request);
  if (method === "GET" && pathname === "/api/bootstrap") {
    return sendJson(response, 200, platformSnapshot(db, userId, url.searchParams.get("q") || "", url.searchParams.get("mode") || "all"));
  }
  if (method === "GET" && pathname === "/api/me") {
    return sendJson(response, 200, { user: privateUser(db, userId) });
  }
  if (method === "PUT" && pathname === "/api/profile") {
    updateProfile(db, userId, await readJson(request));
    return sendJson(response, 200, { user: privateUser(db, userId) });
  }
  if (method === "POST" && pathname === "/api/skills") {
    const skillId = writeSkill(db, userId, await readJson(request));
    return sendJson(response, 201, { skillId, snapshot: platformSnapshot(db, userId) });
  }

  let match = pathname.match(/^\/api\/skills\/(\d+)$/);
  if (match && method === "PUT") {
    writeSkill(db, userId, await readJson(request), toInteger(match[1]));
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  if (match && method === "DELETE") {
    deleteSkill(db, userId, toInteger(match[1]));
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  if (method === "POST" && pathname === "/api/bookings") {
    const bookingId = createBooking(db, userId, await readJson(request));
    return sendJson(response, 201, { bookingId, snapshot: platformSnapshot(db, userId) });
  }

  match = pathname.match(/^\/api\/bookings\/(\d+)\/(accept|decline|cancel)$/);
  if (match && method === "POST") {
    const bookingId = toInteger(match[1]);
    if (match[2] === "accept") acceptBooking(db, bookingId, userId);
    if (match[2] === "decline") declineBooking(db, bookingId, userId);
    if (match[2] === "cancel") cancelBooking(db, bookingId, userId);
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  match = pathname.match(/^\/api\/bookings\/(\d+)\/reschedule$/);
  if (match && method === "POST") {
    requestReschedule(db, toInteger(match[1]), userId, await readJson(request));
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  match = pathname.match(/^\/api\/bookings\/(\d+)\/reschedule\/(accept|decline)$/);
  if (match && method === "POST") {
    respondReschedule(db, toInteger(match[1]), userId, match[2] === "accept");
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  match = pathname.match(/^\/api\/bookings\/(\d+)\/sessions\/(\d+)\/(start|complete)$/);
  if (match && method === "POST") {
    const bookingId = toInteger(match[1]);
    const sessionId = toInteger(match[2]);
    if (match[3] === "start") startSession(db, bookingId, sessionId, userId);
    if (match[3] === "complete") completeSession(db, bookingId, sessionId, userId);
    return sendJson(response, 200, { snapshot: platformSnapshot(db, userId) });
  }
  match = pathname.match(/^\/api\/bookings\/(\d+)\/reviews$/);
  if (match && method === "POST") {
    submitReview(db, toInteger(match[1]), userId, await readJson(request));
    return sendJson(response, 201, { snapshot: platformSnapshot(db, userId) });
  }
  match = pathname.match(/^\/api\/conversations\/(\d+)$/);
  if (match && method === "GET") {
    const partnerId = toInteger(match[1]);
    if (!getUser(db, partnerId) || partnerId === userId) throw new HttpError(404, "未找到这个对话");
    return sendJson(response, 200, { partner: publicUser(db, partnerId), messages: listConversationMessages(db, userId, partnerId) });
  }
  match = pathname.match(/^\/api\/conversations\/(\d+)\/messages$/);
  if (match && method === "POST") {
    const partnerId = toInteger(match[1]);
    if (!getUser(db, partnerId) || partnerId === userId) throw new HttpError(404, "未找到这个对话");
    const input = await readJson(request);
    const body = assertString(input.body, "消息", { min: 1, max: 400 });
    addMessage(db, userId, partnerId, body, input.bookingId ? toInteger(input.bookingId) : null);
    notify(db, partnerId, "message", `${getUser(db, userId).name} 发来一条消息`, body.slice(0, 80), { bookingId: input.bookingId || null, partnerId: userId });
    return sendJson(response, 201, { partner: publicUser(db, partnerId), messages: listConversationMessages(db, userId, partnerId) });
  }
  if (method === "POST" && pathname === "/api/notifications/read") {
    const input = await readJson(request);
    const ids = Array.isArray(input.ids) ? input.ids.map((id) => Number(id)).filter(Number.isInteger) : [];
    if (ids.length) {
      const placeholders = ids.map(() => "?").join(",");
      run(db, `UPDATE notifications SET read_at = ? WHERE user_id = ? AND id IN (${placeholders})`, [now(), userId, ...ids]);
    } else {
      run(db, "UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL", [now(), userId]);
    }
    return sendJson(response, 200, { notifications: listNotifications(db, userId) });
  }
  throw new HttpError(404, "没有找到这个接口");
}

function sendStatic(request, response, url) {
  const target = staticFiles.get(url.pathname);
  if (!target && url.pathname.startsWith("/assets/")) {
    const requested = resolve(assetRoot, url.pathname.slice("/assets/".length));
    if (!requested.startsWith(resolve(assetRoot))) throw new HttpError(404, "资源不存在");
    try {
      const contents = readFileSync(requested);
      const ext = extname(requested).toLowerCase();
      const type = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
      response.writeHead(200, { "content-type": type, "cache-control": "public, max-age=86400" });
      response.end(contents);
      return;
    } catch {
      throw new HttpError(404, "资源不存在");
    }
  }
  if (!target) throw new HttpError(404, "页面不存在");
  const [fileName, contentType] = target;
  const contents = readFileSync(resolve(rootDirectory, fileName));
  response.writeHead(200, { "content-type": contentType, "cache-control": "no-cache" });
  response.end(contents);
}

export function createPlatform({ databasePath = defaultDatabasePath } = {}) {
  const db = createDatabase(databasePath);
  seedDatabase(db);
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");
      if (url.pathname.startsWith("/api/")) await handleApi(db, request, response, url);
      else sendStatic(request, response, url);
    } catch (error) {
      sendError(response, error);
    }
  });
  return {
    server,
    db,
    close() {
      db.close();
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const platform = createPlatform();
  platform.server.listen(defaultPort, "127.0.0.1", () => {
    console.log(`Huanji server listening on http://127.0.0.1:${defaultPort}`);
  });
  process.on("SIGINT", () => platform.server.close(() => platform.close()));
  process.on("SIGTERM", () => platform.server.close(() => platform.close()));
}
