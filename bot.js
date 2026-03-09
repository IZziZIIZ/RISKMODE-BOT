
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");
const SUPPORT_URL = process.env.SUPPORT_URL || "";
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "change-me";
const CHANNEL_ID = process.env.CHANNEL_ID || "";
const CHANNEL_URL = process.env.CHANNEL_URL || "";
const BOT_USERNAME = (process.env.BOT_USERNAME || "").replace(/^@/, "");

if (!BOT_TOKEN) {
  console.log("❌ BOT_TOKEN не задан");
  process.exit(1);
}
if (!BASE_URL) {
  console.log("❌ BASE_URL не задан");
  process.exit(1);
}

const MEDIA = {
  main: `${BASE_URL}/bot/menu-main.png`,
  language: `${BASE_URL}/bot/menu-language.png`,
  instruction: `${BASE_URL}/bot/menu-instruction.png`,
  step1: `${BASE_URL}/bot/menu-step1.png`,
  step2: `${BASE_URL}/bot/menu-step2.png`,
  access: `${BASE_URL}/bot/menu-access.png`,
  subscribe: `${BASE_URL}/bot/menu-subscribe.png`,
  userAccess: `${BASE_URL}/bot/menu-user-access.png`,
  referral: `${BASE_URL}/bot/menu-referral.png`,
};

const LANG_ORDER = [
  ["en", "ru"],
  ["tr", "es"],
  ["pt", "pt-br"],
  ["ar", "it"],
  ["hi", "uk"],
  ["kz", "uz"],
  ["az", "hy"],
  ["sa"]
];

const L = {
  ru: {
    languageName: "Русский",
    chooseLanguageTitle: "<b>ВЫБЕРИТЕ ЯЗЫК</b>",
    instructionBtn: "📘 Инструкция",
    languageBtn: "🌐 Выбрать язык",
    supportBtn: "🔗 Поддержка",
    getSignalBtn: "⚜️ ПОЛУЧИТЬ СИГНАЛ",
    checkAccessBtn: "✅ Проверить доступ",
    referralBtn: "🎁 Реферальная система",
    backBtn: "⬅️ Вернуться в главное меню",
    openAppBtn: "🎮 Открыть RISK MODE",
    registerBtn: "✅ Регистрация",
    depositBtn: "💳 Пополнить счёт",
    goChannelBtn: "Перейти в канал",
    checkSubBtn: "Проверить подписку",
    menuBtn: "📋 Меню",
    refreshBtn: "🔄 Обновить",
    supportMissing: "Поддержка пока не настроена.",
    subRequiredTitle: "<b>ПОДПИШИСЬ НА КАНАЛ</b>",
    subRequiredText: (name) => `👋 Добро пожаловать, <b>${name}</b>!\n\nЧтобы использовать бота, пожалуйста, подпишитесь на наш канал 👏`,
    subFail: "Сначала подпишитесь на канал, затем нажмите «Проверить подписку».",
    subStillMissingTitle: "<b>ПОДПИШИСЬ НА КАНАЛ</b>",
    subStillMissingText: (name) => `👋 <b>${name}</b>, подписка пока не найдена.\n\n<b>ОБЯЗАТЕЛЬНО</b> подпишитесь на канал и только после этого нажмите <b>«Проверить подписку»</b>.`,
    subOk: "Подписка подтверждена.",
    mainTitle: "<b>ГЛАВНОЕ МЕНЮ</b>",
    mainText: (name) => `👋 <b>${name}</b>, Добро пожаловать в 🔶 <b>RISK MODE BOT</b> 🔶!\n\n🚀 Этот бот поможет вам лучше ориентироваться в популярных играх, использовать полезные инструменты и получать больше возможностей для уверенной игры.\n\n🎯 В основе работы — интеллектуальная система анализа, которая обрабатывает данные и помогает находить более точные и взвешенные решения.\n\n🔥 Запускайте игру, следуйте рекомендациям и повышайте свои шансы на лучший результат!`,
    instructionTitle: "<b>ИНСТРУКЦИЯ</b>",
    instructionBody: `🤖 <b>БОТ RISK MODE РАБОТАЕТ НА БАЗЕ AI-АЛГОРИТМОВ, АНАЛИЗА ИГРОВЫХ СЦЕНАРИЕВ И МОДЕЛЕЙ ПОВЕДЕНИЯ В ЭКОСИСТЕМЕ 1WIN.</b>\n\n⚜️ <b>В ОСНОВЕ СИСТЕМЫ — БОЛЬШОЙ МАССИВ ИГРОВЫХ ПАТТЕРНОВ, СЦЕНАРИЕВ И РАБОЧИХ МОДЕЛЕЙ ДЛЯ MINES.</b>\n\n📈 <b>БОТ ПОСТОЯННО ДОРАБАТЫВАЕТСЯ И ОПТИМИЗИРУЕТСЯ ДЛЯ ЕЩЁ БОЛЕЕ ТОЧНОЙ И СТАБИЛЬНОЙ РАБОТЫ.</b>\n\nЧтобы начать работу, следуйте инструкции:\n\n🟢 1. <b>ЗАРЕГИСТРИРУЙСЯ</b> в букмекерской конторе 1WIN по кнопке ниже.\n\n🟢 2. <b>ПОПОЛНИ</b> игровой счёт на минимальную сумму:\n<b>1500 RUB (20$)</b>.\n\n🟢 3. <b>ПЕРЕЙДИ</b> в раздел игр 1WIN и выбери <b>MINES</b>.\n\n🟢 4. Для игры <b>MINES</b> <b>ОПТИМАЛЬНЫЙ ВЫБОР</b> по количеству ловушек — <b>3</b>.\n\n🟢 5. Нажми <b>«ПОЛУЧИТЬ СИГНАЛ»</b> и <b>ДЕЙСТВУЙ СТРОГО</b> по полученному сценарию.\n\n🟢 6. Для более стабильной работы по сигналам придерживайся <b>ОДНОЙ СТРАТЕГИИ</b> и соблюдай последовательность входов.\n\n📩 По вопросам стратегии и оптимального подхода обращайтесь в <b>ПОДДЕРЖКУ</b>.`,
    registrationTitle: "<b>ШАГ 1 ИЗ 2</b>",
    registrationText: "Чтобы открыть доступ к сигналам, <b>ЗАРЕГИСТРИРУЙСЯ</b> по кнопке ниже.",
    depositTitle: "<b>ШАГ 2 ИЗ 2</b>",
    depositText: (amount) => `РЕГИСТРАЦИЯ ПОДТВЕРЖДЕНА.\n\nТеперь <b>ПОПОЛНИ</b> игровой счёт на минимальную сумму:\n<b>${amount}</b>.\n\nПосле подтверждения депозита доступ к сигналам откроется <b>АВТОМАТИЧЕСКИ</b>.`,
    accessTitle: "<b>ДОСТУП АКТИВЕН</b>",
    accessText: `Ваш аккаунт <b>ПОДТВЕРЖДЁН</b>.\nОткройте приложение и получите сигнал для <b>MINES</b>.`,
    userAccessTitle: "<b>ВАШ ДОСТУП</b>",
    userAccessText: (user, minDeposit) => `🆔 <b>Ваш Telegram ID:</b> <code>${user.tg_id}</code>\n\n👤 <b>Регистрация:</b> ${user.reg ? "✅ подтверждена" : "❌ не подтверждена"}\n💳 <b>Депозит:</b> ${user.paid ? "✅ подтверждён" : `❌ нет депозита (минимум ${minDeposit})`}\n🎮 <b>Доступ к игре:</b> ${user.access ? "✅ открыт" : "❌ закрыт"}`,
    referralTitle: "<b>РЕФЕРАЛЬНАЯ СИСТЕМА</b>",
    referralText: (stats) => `🎁 Приглашай друзей и получай бонусы!\n\n👥 За каждого пользователя, который зарегистрируется и сделает пополнение по твоей ссылке, ты получишь бонус <b>${stats.reward_amount} RUB</b>.\n\n📎 <b>Твоя реферальная ссылка:</b>\n<code>${stats.link || "-"}</code>\n\n📊 <b>Статистика:</b>\n• Всего приглашено: <b>${stats.total_invited}</b>\n• Зарегистрированы: <b>${stats.registered}</b>\n• С депозитом: <b>${stats.with_deposit}</b>\n• Заработано: <b>${stats.earned} RUB</b>\n• Выплачено: <b>${stats.paid} RUB</b>`,
    langSaved: "Язык сохранён."
  },
  en: {
    languageName: "English",
    chooseLanguageTitle: "<b>SELECT LANGUAGE</b>",
    instructionBtn: "📘 Instructions",
    languageBtn: "🌐 Language",
    supportBtn: "🔗 Support",
    getSignalBtn: "⚜️ GET SIGNAL",
    checkAccessBtn: "✅ Check access",
    referralBtn: "🎁 Referral system",
    backBtn: "⬅️ Back to main menu",
    openAppBtn: "🎮 Open RISK MODE",
    registerBtn: "✅ Register",
    depositBtn: "💳 Deposit",
    goChannelBtn: "Open channel",
    checkSubBtn: "Check subscription",
    menuBtn: "📋 Menu",
    refreshBtn: "🔄 Refresh",
    supportMissing: "Support is not configured yet.",
    subRequiredTitle: "<b>SUBSCRIBE TO CHANNEL</b>",
    subRequiredText: (name) => `👋 Welcome, <b>${name}</b>!\n\nTo use the bot, please subscribe to our channel 👏`,
    subFail: "Subscribe to the channel first, then tap “Check subscription”.",
    subStillMissingTitle: "<b>SUBSCRIBE TO CHANNEL</b>",
    subStillMissingText: (name) => `👋 <b>${name}</b>, subscription is still not found.\n\n<b>MAKE SURE</b> you subscribe to the channel and only then tap <b>“Check subscription”</b>.`,
    subOk: "Subscription confirmed.",
    mainTitle: "<b>MAIN MENU</b>",
    mainText: (name) => `👋 <b>${name}</b>, welcome to 🔶 <b>RISK MODE BOT</b> 🔶!\n\n🚀 This bot helps you navigate popular games, use useful tools and get more options for a more confident play.\n\n🎯 At the core is an intelligent analysis system that processes data and helps find more accurate and balanced decisions.\n\n🔥 Launch the game, follow the recommendations and improve your chances of a better result!`,
    instructionTitle: "<b>INSTRUCTIONS</b>",
    instructionBody: `🤖 <b>RISK MODE USES AI-DRIVEN SIGNAL LOGIC, PATTERN ANALYSIS AND 1WIN GAMEFLOW MODELS.</b>\n\n⚜️ <b>THE SYSTEM IS BUILT AROUND A LARGE SET OF MINES PATTERNS, SCENARIOS AND WORKING MODELS.</b>\n\n📈 <b>THE BOT IS STILL BEING IMPROVED FOR MORE STABLE AND MORE ACCURATE PERFORMANCE.</b>\n\nTo start, follow the steps below:\n\n🟢 1. <b>REGISTER</b> in 1WIN using the button below.\n\n🟢 2. <b>TOP UP</b> your gaming balance by the minimum amount:\n<b>1500 RUB (20$)</b>.\n\n🟢 3. <b>GO</b> to the 1WIN games section and choose <b>MINES</b>.\n\n🟢 4. For <b>MINES</b>, the <b>OPTIMAL</b> trap count is <b>3</b>.\n\n🟢 5. Tap <b>“GET SIGNAL”</b> and follow the received scenario.\n\n🟢 6. For more stable work with signals, stick to <b>ONE STRATEGY</b> and keep your entries consistent.\n\n📩 Contact <b>SUPPORT</b> for strategy questions and optimal usage.`,
    registrationTitle: "<b>STEP 1 OF 2</b>",
    registrationText: "To unlock signals, <b>REGISTER</b> using the button below.",
    depositTitle: "<b>STEP 2 OF 2</b>",
    depositText: (amount) => `REGISTRATION CONFIRMED.\n\nNow <b>TOP UP</b> your gaming balance by the minimum amount:\n<b>${amount}</b>.\n\nAfter the deposit is confirmed, access will be unlocked <b>AUTOMATICALLY</b>.`,
    accessTitle: "<b>ACCESS ACTIVE</b>",
    accessText: `Your account is <b>CONFIRMED</b>.\nOpen the app and get a signal for <b>MINES</b>.`,
    userAccessTitle: "<b>YOUR ACCESS</b>",
    userAccessText: (user, minDeposit) => `🆔 <b>Your Telegram ID:</b> <code>${user.tg_id}</code>\n\n👤 <b>Registration:</b> ${user.reg ? "✅ confirmed" : "❌ not confirmed"}\n💳 <b>Deposit:</b> ${user.paid ? "✅ confirmed" : `❌ missing (minimum ${minDeposit})`}\n🎮 <b>Game access:</b> ${user.access ? "✅ open" : "❌ closed"}`,
    referralTitle: "<b>REFERRAL SYSTEM</b>",
    referralText: (stats) => `🎁 Invite friends and get rewards!\n\n👥 For each user who registers and makes a deposit using your link, you receive <b>${stats.reward_amount} RUB</b>.\n\n📎 <b>Your referral link:</b>\n<code>${stats.link || "-"}</code>\n\n📊 <b>Stats:</b>\n• Invited: <b>${stats.total_invited}</b>\n• Registered: <b>${stats.registered}</b>\n• With deposit: <b>${stats.with_deposit}</b>\n• Earned: <b>${stats.earned} RUB</b>\n• Paid out: <b>${stats.paid} RUB</b>`,
    langSaved: "Language saved."
  }
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function tr(lang) {
  return L[lang] || L.ru;
}

function getDisplayName(from, user) {
  return (
    user?.first_name ||
    from?.first_name ||
    user?.username ||
    from?.username ||
    "друг"
  );
}

function flagLabel(code) {
  const map = {
    ru: "🇷🇺 Русский",
    en: "🇬🇧 English",
    tr: "🇹🇷 Türkçe",
    es: "🇪🇸 Español",
    pt: "🇵🇹 Português",
    "pt-br": "🇧🇷 Português (BR)",
    ar: "🇦🇷 Español (AR)",
    sa: "🇸🇦 العربية",
    it: "🇮🇹 Italiano",
    hi: "🇮🇳 हिन्दी",
    uk: "🇺🇦 Українська",
    kz: "🇰🇿 Қазақша",
    uz: "🇺🇿 Oʻzbek",
    az: "🇦🇿 Azərbaycanca",
    hy: "🇦🇲 Հայերեն"
  };
  return map[code] || code.toUpperCase();
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": INTERNAL_TOKEN,
      ...(options.headers || {})
    }
  });
  return res.json();
}

async function getUser(tgId) {
  try {
    const data = await api(`/internal/user/${tgId}`);
    return data.user || { tg_id: String(tgId), lang: "ru", reg: false, paid: false, access: false, subscribed: false, language_selected: false };
  } catch {
    return { tg_id: String(tgId), lang: "ru", reg: false, paid: false, access: false, subscribed: false, language_selected: false };
  }
}

async function patchUser(tgId, patch) {
  try {
    const data = await api(`/internal/user/${tgId}`, {
      method: "POST",
      body: JSON.stringify(patch)
    });
    return data.user;
  } catch {
    return null;
  }
}

async function getReferralStats(tgId) {
  try {
    const data = await api(`/internal/referrals/${tgId}`);
    return data.stats || {
      link: BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=ref_${tgId}` : "",
      total_invited: 0,
      registered: 0,
      with_deposit: 0,
      earned: 0,
      paid: 0,
      reward_amount: 150
    };
  } catch {
    return {
      link: BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=ref_${tgId}` : "",
      total_invited: 0,
      registered: 0,
      with_deposit: 0,
      earned: 0,
      paid: 0,
      reward_amount: 150
    };
  }
}

function screenPhoto(key, caption) {
  return {
    type: "photo",
    media: MEDIA[key],
    caption,
    parse_mode: "HTML"
  };
}

async function editMenu(query, screenKey, caption, reply_markup) {
  try {
    await bot.editMessageMedia(screenPhoto(screenKey, caption), {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup
    });
  } catch (e) {
    try {
      await bot.editMessageCaption(caption, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: "HTML",
        reply_markup
      });
    } catch {
      await bot.sendPhoto(query.message.chat.id, MEDIA[screenKey], {
        caption,
        parse_mode: "HTML",
        reply_markup
      });
    }
  }
}

async function sendMenuPhoto(chatId, screenKey, caption, reply_markup) {
  const msg = await bot.sendPhoto(chatId, MEDIA[screenKey], {
    caption,
    parse_mode: "HTML",
    reply_markup
  });
  return msg;
}

async function upsertMenuMeta(chatId, messageId, user) {
  await patchUser(chatId, {
    menu_chat_id: String(chatId),
    menu_message_id: String(messageId),
    lang: user.lang || "ru"
  });
}

function languageKeyboard(lang) {
  const p = tr(lang);
  const rows = LANG_ORDER.map((pair) => pair.map((code) => ({ text: flagLabel(code), callback_data: `lang:${code}` })));
  return { inline_keyboard: rows };
}

function subscribeKeyboard(lang) {
  const p = tr(lang);
  return {
    inline_keyboard: [
      [{ text: p.goChannelBtn, url: CHANNEL_URL || "https://t.me" }],
      [{ text: p.checkSubBtn, callback_data: "check_subscription" }],
      [{ text: p.supportBtn, url: SUPPORT_URL || "https://t.me" }]
    ]
  };
}

function mainKeyboard(user, lang) {
  const p = tr(lang);
  const getSignalButton = user.access
    ? [{ text: p.getSignalBtn, web_app: { url: `${BASE_URL}/` } }]
    : [{ text: p.getSignalBtn, callback_data: "get_signal" }];

  const supportButton = SUPPORT_URL
    ? [{ text: p.supportBtn, url: SUPPORT_URL }]
    : [{ text: p.supportBtn, callback_data: "support_info" }];

  return {
    inline_keyboard: [
      [
        { text: p.instructionBtn, callback_data: "instruction" },
        { text: p.languageBtn, callback_data: "choose_language" }
      ],
      [
        { text: p.checkAccessBtn, callback_data: "my_access" },
        { text: p.referralBtn, callback_data: "referral" }
      ],
      getSignalButton,
      supportButton
    ]
  };
}

function registrationKeyboard(chatId, lang) {
  const p = tr(lang);
  return {
    inline_keyboard: [
      [{ text: p.registerBtn, url: `${BASE_URL}/go?tg=${chatId}` }],
      [{ text: p.backBtn, callback_data: "main_menu" }]
    ]
  };
}

function depositKeyboard(chatId, lang) {
  const p = tr(lang);
  return {
    inline_keyboard: [
      [{ text: p.depositBtn, url: `${BASE_URL}/go?tg=${chatId}` }],
      [{ text: p.backBtn, callback_data: "main_menu" }]
    ]
  };
}

function accessKeyboard(lang) {
  const p = tr(lang);
  return {
    inline_keyboard: [
      [{ text: p.openAppBtn, web_app: { url: `${BASE_URL}/` } }],
      [{ text: p.backBtn, callback_data: "main_menu" }]
    ]
  };
}

function simpleBackKeyboard(lang) {
  const p = tr(lang);
  return { inline_keyboard: [[{ text: p.backBtn, callback_data: "main_menu" }]] };
}

function resolveChannelTarget() {
  if (CHANNEL_ID) return CHANNEL_ID;

  if (CHANNEL_URL) {
    const match = CHANNEL_URL.match(/t\.me\/(?:\+|joinchat\/)?([^/?#]+)/i);
    if (match && match[1]) {
      return `@${match[1].replace(/^@/, "")}`;
    }
  }

  return "";
}

async function isSubscribed(chatId) {
  const channelTarget = resolveChannelTarget();
  if (!channelTarget) return true;

  try {
    const member = await bot.getChatMember(channelTarget, chatId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (e) {
    console.log("subscription_check_error:", e?.response?.body || e?.message || e);
    return false;
  }
}

async function showLanguage(chatId, existingUser = null) {
  const user = existingUser || await getUser(chatId);
  const msg = await sendMenuPhoto(chatId, "language", tr(user.lang).chooseLanguageTitle, languageKeyboard(user.lang));
  await upsertMenuMeta(chatId, msg.message_id, user);
}

function subscribeCaption(lang, name) {
  const p = tr(lang);
  return `${p.subRequiredTitle}\n\n${p.subRequiredText(name)}`;
}

function subscribeFailCaption(lang, name) {
  const p = tr(lang);
  return `${p.subStillMissingTitle}\n\n${p.subStillMissingText(name)}`;
}

function mainCaption(lang, name) {
  const p = tr(lang);
  return `${p.mainTitle}\n\n${p.mainText(name)}`;
}

async function showSubscribe(queryOrChatId, user, from = null, edit = false) {
  const lang = user.lang || "ru";
  const name = getDisplayName(from, user);
  const caption = subscribeCaption(lang, name);
  if (edit) {
    await editMenu(queryOrChatId, "subscribe", caption, subscribeKeyboard(lang));
    await upsertMenuMeta(queryOrChatId.message.chat.id, queryOrChatId.message.message_id, user);
  } else {
    const msg = await sendMenuPhoto(queryOrChatId, "subscribe", caption, subscribeKeyboard(lang));
    await upsertMenuMeta(queryOrChatId, msg.message_id, user);
  }
}

async function showSubscribeFail(queryOrChatId, user, from = null) {
  const lang = user.lang || "ru";
  const name = getDisplayName(from, user);
  const caption = subscribeFailCaption(lang, name);
  await editMenu(queryOrChatId, "subscribe", caption, subscribeKeyboard(lang));
  await upsertMenuMeta(queryOrChatId.message.chat.id, queryOrChatId.message.message_id, user);
}

async function showMain(queryOrChatId, user, from = null, edit = false) {
  const lang = user.lang || "ru";
  const name = getDisplayName(from, user);
  const caption = mainCaption(lang, name);
  if (edit) {
    await editMenu(queryOrChatId, "main", caption, mainKeyboard(user, lang));
    await upsertMenuMeta(queryOrChatId.message.chat.id, queryOrChatId.message.message_id, user);
  } else {
    const msg = await sendMenuPhoto(queryOrChatId, "main", caption, mainKeyboard(user, lang));
    await upsertMenuMeta(queryOrChatId, msg.message_id, user);
  }
}

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  let user = await getUser(chatId);

  const patch = {
    username: msg.from?.username || null,
    first_name: msg.from?.first_name || null
  };

  const refRaw = match?.[1] || "";
  if (refRaw.startsWith("ref_")) {
    const refId = refRaw.replace("ref_", "").trim();
    if (refId && refId !== String(chatId) && !user.referrer_id) {
      patch.referrer_id = refId;
    }
  }

  user = (await patchUser(chatId, patch)) || { ...user, ...patch };

  if (!user.language_selected) {
    await showLanguage(chatId, user);
    return;
  }

  if (!user.subscribed) {
    await showSubscribe(chatId, user, msg.from, false);
    return;
  }

  await showMain(chatId, user, msg.from, false);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  let user = await getUser(chatId);
  const lang = user.lang || "ru";
  const p = tr(lang);

  try {
    await bot.answerCallbackQuery(query.id);
  } catch {}

  if (query.data === "main_menu") {
    user = await getUser(chatId);
    if (!user.subscribed) {
      await showSubscribe(query, user, query.from, true);
    } else {
      await showMain(query, user, query.from, true);
    }
    return;
  }

  if (query.data === "choose_language") {
    await editMenu(query, "language", tr(lang).chooseLanguageTitle, languageKeyboard(lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data?.startsWith("lang:")) {
    const next = query.data.split(":")[1];
    user = (await patchUser(chatId, {
      lang: next,
      language_selected: true,
      username: query.from?.username || null,
      first_name: query.from?.first_name || null
    })) || user;
    try {
      await bot.answerCallbackQuery(query.id, { text: tr(next).langSaved });
    } catch {}
    if (!user.subscribed) {
      await showSubscribe(query, user, query.from, true);
    } else {
      await showMain(query, user, query.from, true);
    }
    return;
  }

  if (query.data === "check_subscription") {
    const ok = await isSubscribed(chatId);
    if (!ok) {
      user = (await patchUser(chatId, { subscribed: false })) || user;
      try {
        await bot.answerCallbackQuery(query.id, { text: p.subFail, show_alert: true });
      } catch {}
      await showSubscribeFail(query, user, query.from);
      return;
    }

    user = (await patchUser(chatId, {
      subscribed: true,
      username: query.from?.username || null,
      first_name: query.from?.first_name || null
    })) || user;

    try {
      await bot.answerCallbackQuery(query.id, { text: p.subOk });
    } catch {}
    await showMain(query, user, query.from, true);
    return;
  }

  if (query.data === "instruction") {
    const caption = `${p.instructionTitle}\n\n${p.instructionBody}`;
    await editMenu(query, "instruction", caption, simpleBackKeyboard(lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data === "my_access") {
    const data = await api(`/internal/user/${chatId}`);
    const minDeposit = data.min_deposit || "1500 RUB (20$)";
    const freshUser = data.user || user;
    const caption = `${tr(freshUser.lang || lang).userAccessTitle}\n\n${tr(freshUser.lang || lang).userAccessText(freshUser, minDeposit)}`;
    await editMenu(query, "userAccess", caption, {
      inline_keyboard: [
        [{ text: tr(freshUser.lang || lang).getSignalBtn, callback_data: "get_signal" }],
        [{ text: tr(freshUser.lang || lang).backBtn, callback_data: "main_menu" }]
      ]
    });
    await upsertMenuMeta(chatId, query.message.message_id, freshUser);
    return;
  }

  if (query.data === "referral") {
    const stats = await getReferralStats(chatId);
    const caption = `${p.referralTitle}\n\n${p.referralText(stats)}`;
    await editMenu(query, "referral", caption, {
      inline_keyboard: [
        SUPPORT_URL ? [{ text: p.supportBtn, url: SUPPORT_URL }] : [{ text: p.supportBtn, callback_data: "support_info" }],
        [{ text: p.refreshBtn, callback_data: "referral" }],
        [{ text: p.menuBtn, callback_data: "main_menu" }]
      ]
    });
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data === "support_info") {
    try {
      await bot.answerCallbackQuery(query.id, { text: p.supportMissing, show_alert: true });
    } catch {}
    return;
  }

  if (query.data === "get_signal") {
    user = await getUser(chatId);

    if (!user.subscribed) {
      await showSubscribe(query, user, query.from, true);
      return;
    }

    if (!user.reg) {
      const caption = `${tr(user.lang).registrationTitle}\n\n${tr(user.lang).registrationText}`;
      await editMenu(query, "step1", caption, registrationKeyboard(chatId, user.lang));
      await upsertMenuMeta(chatId, query.message.message_id, user);
      return;
    }

    if (!user.paid) {
      const data = await api(`/internal/user/${chatId}`);
      const min = data.min_deposit || "1500 RUB (20$)";
      const caption = `${tr(user.lang).depositTitle}\n\n${tr(user.lang).depositText(min)}`;
      await editMenu(query, "step2", caption, depositKeyboard(chatId, user.lang));
      await upsertMenuMeta(chatId, query.message.message_id, user);
      return;
    }

    const caption = `${tr(user.lang).accessTitle}\n\n${tr(user.lang).accessText}`;
    await editMenu(query, "access", caption, accessKeyboard(user.lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
  }
});

console.log("✅ Bot worker is running...");
