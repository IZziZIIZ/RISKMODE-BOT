
import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");
const ONEWIN_LINK = process.env.ONEWIN_LINK || "";
const MIN_DEPOSIT = process.env.MIN_DEPOSIT || "1500 RUB (20$)";
const MIN_DEPOSIT_NUM = Number(String(process.env.MIN_DEPOSIT || "1500").match(/\d+/)?.[0] || 1500);
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "change-me";
const BOT_USERNAME = (process.env.BOT_USERNAME || "").replace(/^@/, "");
const REF_REWARD = Number(process.env.REF_REWARD || 150);
const PORT = Number(process.env.PORT || 3000);

if (!BOT_TOKEN) console.log("⚠️ BOT_TOKEN не задан");
if (!BASE_URL) console.log("⚠️ BASE_URL не задан");
if (!ONEWIN_LINK) console.log("⚠️ ONEWIN_LINK не задан");
if (INTERNAL_TOKEN === "change-me") console.log("⚠️ INTERNAL_TOKEN не задан");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, "data", "db.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: {} });
await db.read();
db.data ||= { users: {} };
db.data.users ||= {};
await db.write();

const LANGS = {
  ru: { name: "Русский", flag: "🇷🇺" },
  en: { name: "English", flag: "🇬🇧" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
  "pt-br": { name: "Português (BR)", flag: "🇧🇷" },
  ar: { name: "Español (AR)", flag: "🇦🇷" },
  sa: { name: "العربية", flag: "🇸🇦" },
  it: { name: "Italiano", flag: "🇮🇹" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  uk: { name: "Українська", flag: "🇺🇦" },
  kz: { name: "Қазақша", flag: "🇰🇿" },
  uz: { name: "Oʻzbek", flag: "🇺🇿" },
  az: { name: "Azərbaycanca", flag: "🇦🇿" },
  hy: { name: "Հայերեն", flag: "🇦🇲" }
};

function getUser(tgId) {
  const id = String(tgId);
  db.data.users[id] ||= {
    tg_id: id,
    lang: "ru",
    language_selected: false,
    subscribed: false,
    reg: false,
    paid: false,
    access: false,
    username: null,
    first_name: null,
    referrer_id: null,
    ref_rewarded: false,
    ref_earned: 0,
    ref_paid: 0,
    menu_chat_id: null,
    menu_message_id: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  const u = db.data.users[id];
  if (!u.lang || !LANGS[u.lang]) u.lang = "ru";
  if (typeof u.language_selected !== "boolean") u.language_selected = false;
  if (typeof u.subscribed !== "boolean") u.subscribed = false;
  if (typeof u.reg !== "boolean") u.reg = false;
  if (typeof u.paid !== "boolean") u.paid = false;
  if (typeof u.ref_rewarded !== "boolean") u.ref_rewarded = false;
  if (typeof u.ref_earned !== "number") u.ref_earned = 0;
  if (typeof u.ref_paid !== "number") u.ref_paid = 0;
  computeAccess(u);
  return u;
}

function computeAccess(u) {
  u.access = !!(u.reg && u.paid);
  return u.access;
}

async function save() {
  await db.write();
}

async function tgCall(method, payload) {
  if (!BOT_TOKEN) return null;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await r.json().catch(() => null);
  } catch {
    return null;
  }
}

function verifyInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no hash" };

  const pairs = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push([key, value]);
  }
  pairs.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const calcHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (calcHash !== hash) return { ok: false, reason: "hash mismatch" };

  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, reason: "no user" };

  try {
    const user = JSON.parse(userRaw);
    return { ok: true, user };
  } catch {
    return { ok: false, reason: "bad user" };
  }
}

function internalAuth(req, res, next) {
  const token = req.get("x-internal-token") || req.query.token;
  if (!token || token !== INTERNAL_TOKEN) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

function t(lang, key, extra = {}) {
  const ru = {
    depositTitle: "<b>ШАГ 2 ИЗ 2</b>",
    depositText: `РЕГИСТРАЦИЯ ПОДТВЕРЖДЕНА.\n\nТеперь <b>ПОПОЛНИ</b> игровой счёт на минимальную сумму:\n<b>${MIN_DEPOSIT}</b>.\n\nПосле подтверждения депозита доступ к сигналам откроется <b>АВТОМАТИЧЕСКИ</b>.`,
    accessTitle: "<b>ДОСТУП АКТИВЕН</b>",
    accessText: `Ваш аккаунт <b>ПОДТВЕРЖДЁН</b>.\nОткройте приложение и получите сигнал для <b>MINES</b>.`,
    backBtn: "⬅️ Вернуться в главное меню",
    depositBtn: "💳 Пополнить счёт",
    openAppBtn: "🎮 Открыть RISK MODE"
  };
  const en = {
    depositTitle: "<b>STEP 2 OF 2</b>",
    depositText: `REGISTRATION CONFIRMED.\n\nNow <b>TOP UP</b> your gaming balance by the minimum amount:\n<b>${MIN_DEPOSIT}</b>.\n\nAfter the deposit is confirmed, access will be unlocked <b>AUTOMATICALLY</b>.`,
    accessTitle: "<b>ACCESS ACTIVE</b>",
    accessText: `Your account is <b>CONFIRMED</b>.\nOpen the app and get a signal for <b>MINES</b>.`,
    backBtn: "⬅️ Back to main menu",
    depositBtn: "💳 Deposit",
    openAppBtn: "🎮 Open RISK MODE"
  };
  const dict = lang === "en" ? en : ru;
  return dict[key];
}

async function updateStoredMenu(u) {
  if (!u.menu_chat_id || !u.menu_message_id) return;
  let media;
  let caption;
  let reply_markup;

  if (u.paid && u.access) {
    media = `${BASE_URL}/bot/menu-access.png`;
    caption = `${t(u.lang, "accessTitle")}\n\n${t(u.lang, "accessText")}`;
    reply_markup = {
      inline_keyboard: [
        [{ text: t(u.lang, "openAppBtn"), web_app: { url: `${BASE_URL}/` } }],
        [{ text: t(u.lang, "backBtn"), callback_data: "main_menu" }]
      ]
    };
  } else if (u.reg) {
    media = `${BASE_URL}/bot/menu-step2.png`;
    caption = `${t(u.lang, "depositTitle")}\n\n${t(u.lang, "depositText")}`;
    reply_markup = {
      inline_keyboard: [
        [{ text: t(u.lang, "depositBtn"), url: `${BASE_URL}/go?tg=${u.tg_id}` }],
        [{ text: t(u.lang, "backBtn"), callback_data: "main_menu" }]
      ]
    };
  } else {
    return;
  }

  await tgCall("editMessageMedia", {
    chat_id: u.menu_chat_id,
    message_id: Number(u.menu_message_id),
    media: {
      type: "photo",
      media,
      caption,
      parse_mode: "HTML"
    },
    reply_markup
  });
}

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

app.get("/go", (req, res) => {
  const tg = String(req.query.tg || "");
  if (!tg) return res.status(400).send("no tg");
  const join = ONEWIN_LINK.includes("?") ? "&" : "?";
  return res.redirect(`${ONEWIN_LINK}${join}sub1=${encodeURIComponent(tg)}`);
});

app.get("/pb", async (req, res) => {
  const event = String(req.query.event || "");
  const sub1 = String(req.query.sub1 || "");
  const amount = Number(req.query.amount || 0);

  if (!event || !sub1) return res.status(400).send("bad");

  const u = getUser(sub1);
  u.updatedAt = Date.now();

  if (event === "reg") {
    u.reg = true;
  }

  if (event === "ftd" && amount >= MIN_DEPOSIT_NUM) {
    u.reg = true;
    u.paid = true;

    if (!u.ref_rewarded && u.referrer_id) {
      const refUser = getUser(u.referrer_id);
      refUser.ref_earned = Number(refUser.ref_earned || 0) + REF_REWARD;
      refUser.updatedAt = Date.now();
      u.ref_rewarded = true;
    }
  }

  computeAccess(u);
  await save();
  await updateStoredMenu(u);

  res.send("ok");
});

app.get("/internal/user/:tgId", internalAuth, async (req, res) => {
  await db.read();
  const u = getUser(req.params.tgId);
  computeAccess(u);
  await save();
  res.json({ ok: true, user: u, min_deposit: MIN_DEPOSIT, ref_reward: REF_REWARD });
});

app.post("/internal/user/:tgId", internalAuth, async (req, res) => {
  await db.read();
  const u = getUser(req.params.tgId);
  const body = req.body || {};

  if (typeof body.lang === "string" && LANGS[body.lang]) u.lang = body.lang;
  if (typeof body.language_selected === "boolean") u.language_selected = body.language_selected;
  if (typeof body.subscribed === "boolean") u.subscribed = body.subscribed;
  if (typeof body.menu_chat_id !== "undefined") u.menu_chat_id = body.menu_chat_id;
  if (typeof body.menu_message_id !== "undefined") u.menu_message_id = body.menu_message_id;
  if (typeof body.username !== "undefined") u.username = body.username;
  if (typeof body.first_name !== "undefined") u.first_name = body.first_name;
  if (typeof body.referrer_id !== "undefined" && !u.referrer_id) u.referrer_id = String(body.referrer_id || "") || null;
  if (typeof body.ref_earned === "number") u.ref_earned = body.ref_earned;
  if (typeof body.ref_paid === "number") u.ref_paid = body.ref_paid;
  if (typeof body.reg === "boolean") u.reg = body.reg;
  if (typeof body.paid === "boolean") u.paid = body.paid;
  computeAccess(u);
  u.updatedAt = Date.now();
  await save();

  res.json({ ok: true, user: u, min_deposit: MIN_DEPOSIT, ref_reward: REF_REWARD });
});

app.get("/internal/referrals/:tgId", internalAuth, async (req, res) => {
  await db.read();
  const tgId = String(req.params.tgId);
  getUser(tgId);
  const users = Object.values(db.data.users || {});
  const invited = users.filter((u) => String(u.referrer_id || "") === tgId);
  const registered = invited.filter((u) => !!u.reg).length;
  const withDeposit = invited.filter((u) => !!u.paid).length;
  const owner = getUser(tgId);
  const link = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=ref_${tgId}` : "";
  res.json({
    ok: true,
    stats: {
      link,
      total_invited: invited.length,
      registered,
      with_deposit: withDeposit,
      earned: Number(owner.ref_earned || 0),
      paid: Number(owner.ref_paid || 0),
      reward_amount: REF_REWARD
    }
  });
});

app.post("/api/me", async (req, res) => {
  const initData = req.body?.initData;
  if (!initData) return res.status(400).json({ ok: false, error: "no initData" });

  const v = verifyInitData(initData);
  if (!v.ok) return res.status(401).json({ ok: false, error: v.reason });

  await db.read();
  const u = getUser(String(v.user.id));
  computeAccess(u);
  await save();

  res.json({
    ok: true,
    tg_id: u.tg_id,
    reg: !!u.reg,
    paid: !!u.paid,
    access: !!u.access,
    lang: u.lang,
    min_deposit: MIN_DEPOSIT
  });
});

app.post("/api/signal", async (req, res) => {
  const { initData, mines, mode } = req.body || {};
  if (!initData) return res.status(400).json({ ok: false, error: "no initData" });

  const v = verifyInitData(initData);
  if (!v.ok) return res.status(401).json({ ok: false, error: v.reason });

  await db.read();
  const u = getUser(String(v.user.id));
  computeAccess(u);
  if (!u.access) {
    return res.status(403).json({ ok: false, error: "access denied" });
  }

  const m = Number(mines);
  const md = String(mode || "single");
  const allowedMines = new Set([1, 3, 5, 7]);
  if (!allowedMines.has(m)) return res.status(400).json({ ok: false, error: "bad mines" });
  if (!["single", "all"].includes(md)) return res.status(400).json({ ok: false, error: "bad mode" });

  const starsByMines = { 1: 7, 3: 5, 5: 4, 7: 3 };
  const stars = starsByMines[m];
  const all = Array.from({ length: 25 }, (_, i) => i);

  function pick(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  let grid;
  let steps;
  let previewGrid;

  if (md === "all") {
    const trapPos = new Set(pick(all, m));
    grid = all.map((i) => (trapPos.has(i) ? 2 : 1));
    steps = all.slice();
    previewGrid = grid.slice();
  } else {
    const starPos = pick(all, stars);
    grid = Array(25).fill(0);
    for (const p of starPos) grid[p] = 1;
    steps = pick(starPos, starPos.length);
    previewGrid = Array.from({ length: 25 }, (_, i) => (starPos.includes(i) ? 1 : 0));
  }

  res.json({ ok: true, mines: m, stars, mode: md, grid, steps, previewGrid, ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`✅ Server on :${PORT}`);
});
