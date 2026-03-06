import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.BASE_URL;          // https://xxxx.ngrok-free.app
const ONEWIN_LINK = process.env.ONEWIN_LINK;    // твоя реф-ссылка
const MIN_DEPOSIT = Number(process.env.MIN_DEPOSIT || 100);
const PORT = Number(process.env.PORT || 3000);

if (!BOT_TOKEN) console.log("⚠️  BOT_TOKEN не задан в .env");
if (!BASE_URL) console.log("⚠️  BASE_URL не задан в .env");
if (!ONEWIN_LINK) console.log("⚠️  ONEWIN_LINK не задан в .env");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- DB (простая JSON база) ----
const dbFile = path.join(__dirname, "data", "db.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: {} }); // users[tg_id] = { paid, reg, createdAt, updatedAt }
await db.read();
db.data ||= { users: {} };
await db.write();

function getUser(tgId) {
  db.data.users[tgId] ||= {
    tg_id: tgId,
    paid: false,
    reg: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  return db.data.users[tgId];
}

async function save() {
  await db.write();
}

// ---- Telegram sendMessage (без отдельной библиотеки) ----
async function tgSend(chatId, text, extra = {}) {
  if (!BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra })
  }).catch(() => {});
}

// ---- Telegram WebApp initData verify ----
// Официальная схема: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
function verifyInitData(initData) {
  // initData = "query_id=...&user=...&auth_date=...&hash=..."
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no hash" };

  // строим data_check_string: key=value\nkey=value... (кроме hash), ключи отсортированы
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

  let user;
  try { user = JSON.parse(userRaw); } catch { return { ok: false, reason: "bad user json" }; }

  return { ok: true, user };
}

// ---- App ----
const app = express();
app.use(express.json({ limit: "256kb" }));

// Static WebApp
app.use(express.static(path.join(__dirname, "public")));

// 1) Redirect на 1win + sub1=tg_id
app.get("/go", (req, res) => {
  const tg = req.query.tg;
  if (!tg) return res.status(400).send("no tg");

  const join = ONEWIN_LINK?.includes("?") ? "&" : "?";
  const url = `${ONEWIN_LINK}${join}sub1=${encodeURIComponent(String(tg))}`;
  return res.redirect(url);
});

// 2) Postback: /pb?event=reg|ftd&sub1=<tg_id>&amount=...
app.get("/pb", async (req, res) => {
  const event = String(req.query.event || "");
  const sub1 = String(req.query.sub1 || "");
  const amount = Number(req.query.amount || 0);

  if (!event || !sub1) return res.status(400).send("bad");

  const tgId = sub1;
  const u = getUser(tgId);
  u.updatedAt = Date.now();

  if (event === "reg") {
    u.reg = true;
    await save();
    await tgSend(tgId, `✅ Регистрация зафиксирована.\nТеперь внеси минимальный депозит: ${MIN_DEPOSIT}.\nПосле депозита доступ откроется автоматически.`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Проверить доступ", callback_data: "check" }]
        ]
      }
    });
  }

  if (event === "ftd") {
    if (amount >= MIN_DEPOSIT) {
      u.paid = true;
      await save();
      await tgSend(tgId, "🔥 Доступ открыт! Открывай Mines 👇", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 Открыть Mines", web_app: { url: `${BASE_URL || ""}/` } }],
            [{ text: "🔄 Проверить доступ", callback_data: "check" }]
          ]
        }
      });
    } else {
      await tgSend(tgId, `Депозит: ${amount}. Нужно минимум: ${MIN_DEPOSIT}.`);
    }
  }

  res.send("ok");
});

// 3) API: /api/me (проверка initData и статус)
app.post("/api/me", async (req, res) => {
  const initData = req.body?.initData;
  if (!initData) return res.status(400).json({ ok: false, error: "no initData" });

  const v = verifyInitData(initData);
  if (!v.ok) return res.status(401).json({ ok: false, error: v.reason });

  const tgId = String(v.user.id);
  const u = getUser(tgId);
  await save();

  res.json({ ok: true, tg_id: tgId, paid: !!u.paid, reg: !!u.reg, min_deposit: MIN_DEPOSIT });
});

// 4) API: /api/signal (только если paid=true)
app.post("/api/signal", async (req, res) => {
  const { initData, mines, mode } = req.body || {};
  if (!initData) return res.status(400).json({ ok: false, error: "no initData" });

  const v = verifyInitData(initData);
  if (!v.ok) return res.status(401).json({ ok: false, error: v.reason });

  const tgId = String(v.user.id);
  const u = getUser(tgId);

  const m = Number(mines);
  const md = String(mode || "single");
  const allowedMines = new Set([1,3,5,7]);
  if (!allowedMines.has(m)) return res.status(400).json({ ok: false, error: "bad mines" });
  if (md !== "single" && md !== "all") return res.status(400).json({ ok: false, error: "bad mode" });

  const starsByMines = { 1: 7, 3: 5, 5: 4, 7: 3 };
  const stars = starsByMines[m];

  // generate positions 0..24
  const all = Array.from({ length: 25 }, (_, i) => i);

  function pick(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  const starPos = pick(all, stars);
  const rest = all.filter(i => !starPos.includes(i));
  const trapPos = (md === "all") ? pick(rest, m) : [];

  // grid: 0 empty, 1 star, 2 trap
  const grid = Array(25).fill(0);
  for (const p of starPos) grid[p] = 1;
  for (const p of trapPos) grid[p] = 2;

  // steps order for single: random order
  const steps = pick(starPos, starPos.length);
  const previewGrid = md === "single"
    ? Array.from({ length: 25 }, (_, i) => starPos.includes(i) ? 1 : 3)
    : grid.map(v => v === 0 ? 3 : v);

  res.json({ ok: true, mines: m, stars, mode: md, grid, steps, previewGrid, ts: Date.now() });
});

app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`   Public: ${BASE_URL || "(set BASE_URL in .env)"}`);
});
