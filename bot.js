import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.BASE_URL;

if (!BOT_TOKEN) {
  console.log("❌ BOT_TOKEN не задан в .env");
  process.exit(1);
}
if (!BASE_URL) {
  console.log("⚠️  BASE_URL не задан в .env (кнопки WebApp будут некорректны)");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// читаем ту же базу, что и server.js (data/db.json)
const dbFile = path.join(__dirname, "data", "db.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: {} });
await db.read();
db.data ||= { users: {} };
await db.write();

function getUser(tgId){
  const id = String(tgId);
  db.data.users[id] ||= { tg_id: id, paid: false, reg: false, createdAt: Date.now(), updatedAt: Date.now() };
  return db.data.users[id];
}

async function isPaid(tgId){
  await db.read();
  const u = getUser(tgId);
  return !!u.paid;
}

// Inline buttons
function kbLocked(chatId) {
  const tg = encodeURIComponent(String(chatId));
  const regUrl = `${BASE_URL}/go?tg=${tg}`;
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Регистрация", url: regUrl }],
        [{ text: "🔄 Проверить доступ", callback_data: "check" }]
      ]
    }
  };
}

function kbUnlocked(chatId) {
  const webAppUrl = `${BASE_URL}/`;
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Открыть Mines", web_app: { url: webAppUrl } }],
        [{ text: "🔄 Проверить доступ", callback_data: "check" }]
      ]
    }
  };
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const paid = await isPaid(chatId);

  if (paid){
    await bot.sendMessage(
      chatId,
      "🔥 Доступ открыт.\nНажми кнопку ниже 👇",
      kbUnlocked(chatId)
    );
  } else {
    await bot.sendMessage(
      chatId,
      "RISK MODE • Mines\n\n1) Нажми «✅ Регистрация»\n2) Зарегистрируйся по ссылке\n3) После регистрации я напишу про депозит\n4) После депозита доступ откроется автоматически",
      kbLocked(chatId)
    );
  }
});

bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;

  if (q.data === "check") {
    const paid = await isPaid(chatId);

    if (paid){
      await bot.answerCallbackQuery(q.id, { text: "Доступ открыт ✅" });
      await bot.sendMessage(chatId, "✅ Доступ открыт. Открывай Mines 👇", kbUnlocked(chatId));
    } else {
      await bot.answerCallbackQuery(q.id, { text: "Доступ пока закрыт" });
      await bot.sendMessage(chatId, "⏳ Доступ пока закрыт. Сначала регистрация и депозит.", kbLocked(chatId));
    }
  }
});

console.log("✅ Bot is running (polling)...");
