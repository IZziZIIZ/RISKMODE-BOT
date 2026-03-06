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
const MIN_DEPOSIT = Number(process.env.MIN_DEPOSIT || 100);
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "change-me";
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
    reg: false,
    paid: false,
    access: false,
    menu_chat_id: null,
    menu_message_id: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  const u = db.data.users[id];
  if (typeof u.access !== "boolean") u.access = !!(u.reg && u.paid);
  if (!u.lang || !LANGS[u.lang]) u.lang = "ru";
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

async function tgSend(chatId, text, extra = {}) {
  return tgCall("sendMessage", { chat_id: chatId, text, ...extra });
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

const app = express();
app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res, next) => {
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

  if (event === "ftd" && amount >= MIN_DEPOSIT) {
    u.reg = true;
    u.paid = true;
  }

  computeAccess(u);
  await save();

  if (event === "reg") {
    await tgSend(sub1, "✅ Регистрация подтверждена. Теперь вернись в меню и нажми «Получить сигнал»." );
  }

  if (event === "ftd") {
    if (amount >= MIN_DEPOSIT) {
      await tgSend(sub1, "🔥 Доступ открыт. Вернись в меню и нажми «Получить сигнал»." );
    } else {
      await tgSend(sub1, `ℹ️ Депозит ${amount}. Нужно минимум ${MIN_DEPOSIT}.`);
    }
  }

  res.send("ok");
});

app.get("/internal/user/:tgId", internalAuth, async (req, res) => {
  await db.read();
  const u = getUser(req.params.tgId);
  computeAccess(u);
  await save();
  res.json({ ok: true, user: u, min_deposit: MIN_DEPOSIT });
});

app.post("/internal/user/:tgId", internalAuth, async (req, res) => {
  await db.read();
  const u = getUser(req.params.tgId);
  const body = req.body || {};

  if (typeof body.lang === "string" && LANGS[body.lang]) u.lang = body.lang;
  if (typeof body.menu_chat_id !== "undefined") u.menu_chat_id = body.menu_chat_id;
  if (typeof body.menu_message_id !== "undefined") u.menu_message_id = body.menu_message_id;
  if (typeof body.reg === "boolean") u.reg = body.reg;
  if (typeof body.paid === "boolean") u.paid = body.paid;
  computeAccess(u);
  u.updatedAt = Date.now();
  await save();

  res.json({ ok: true, user: u, min_deposit: MIN_DEPOSIT });
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
