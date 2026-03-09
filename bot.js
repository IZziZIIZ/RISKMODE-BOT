import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");
const SUPPORT_URL = process.env.SUPPORT_URL || "";
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "change-me";

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
    menuTitle: "<b>ГЛАВНОЕ МЕНЮ</b>",
    menuText: `Премиальный доступ к сигналам для игр <b>1WIN</b>.
Сейчас в приложении доступна игра <b>MINES</b>.`,
    instructionBtn: "📘 Инструкция",
    languageBtn: "🌐 Выбрать язык",
    supportBtn: "🔗 Поддержка",
    getSignalBtn: "⚜️ ПОЛУЧИТЬ СИГНАЛ",
    backBtn: "⬅️ Вернуться в главное меню",
    openAppBtn: "🎮 Открыть RISK MODE",
    registerBtn: "✅ Регистрация",
    depositBtn: "💳 Пополнить счёт",
    instructionTitle: "<b>ИНСТРУКЦИЯ</b>",
    instructionBody: `🤖 <b>БОТ RISK MODE РАБОТАЕТ НА БАЗЕ AI-АЛГОРИТМОВ, АНАЛИЗА ИГРОВЫХ СЦЕНАРИЕВ И МОДЕЛЕЙ ПОВЕДЕНИЯ В ЭКОСИСТЕМЕ 1WIN.</b>

⚜️ <b>В ОСНОВЕ СИСТЕМЫ — БОЛЬШОЙ МАССИВ ИГРОВЫХ ПАТТЕРНОВ, СЦЕНАРИЕВ И РАБОЧИХ МОДЕЛЕЙ ДЛЯ MINES.</b>

📈 <b>БОТ ПОСТОЯННО ДОРАБАТЫВАЕТСЯ И ОПТИМИЗИРУЕТСЯ ДЛЯ ЕЩЁ БОЛЕЕ ТОЧНОЙ И СТАБИЛЬНОЙ РАБОТЫ.</b>

Чтобы начать работу, следуйте инструкции:

🟢 1. <b>ЗАРЕГИСТРИРУЙСЯ</b> в букмекерской конторе 1WIN по кнопке ниже.

🟢 2. <b>ПОПОЛНИ</b> игровой счёт на минимальную сумму:
<b>1500 RUB (20$)</b>.

🟢 3. <b>ПЕРЕЙДИ</b> в раздел игр 1WIN и выбери <b>MINES</b>.

🟢 4. Для игры <b>MINES</b> <b>ОПТИМАЛЬНЫЙ ВЫБОР</b> по количеству ловушек — <b>3</b>.

🟢 5. Нажми <b>«ПОЛУЧИТЬ СИГНАЛ»</b> и <b>ДЕЙСТВУЙ СТРОГО</b> по полученному сценарию.

🟢 6. Для более стабильной работы по сигналам придерживайся <b>ОДНОЙ СТРАТЕГИИ</b> и соблюдай последовательность входов.

📩 По вопросам стратегии и оптимального подхода обращайтесь в <b>ПОДДЕРЖКУ</b>.`,
    chooseLanguageTitle: "<b>ВЫБЕРИТЕ ЯЗЫК</b>",
    supportMissing: "Поддержка пока не настроена.",
    registrationTitle: "<b>ШАГ 1 ИЗ 2</b>",
    registrationText: "Чтобы открыть доступ к сигналам, <b>ЗАРЕГИСТРИРУЙСЯ</b> по кнопке ниже.",
    depositTitle: "<b>ШАГ 2 ИЗ 2</b>",
    depositText: (amount) => `РЕГИСТРАЦИЯ ПОДТВЕРЖДЕНА.

Теперь <b>ПОПОЛНИ</b> игровой счёт на минимальную сумму:
<b>${amount}</b>.

После подтверждения депозита доступ к сигналам откроется <b>АВТОМАТИЧЕСКИ</b>.`,
    accessTitle: "<b>ДОСТУП АКТИВЕН</b>",
    accessText: `Ваш аккаунт <b>ПОДТВЕРЖДЁН</b>.
Откройте приложение и получите сигнал для <b>MINES</b>.`,
    langSaved: "Язык сохранён."
  },
  en: {
    languageName: "English",
    menuTitle: "<b>MAIN MENU</b>",
    menuText: `Premium access to <b>1WIN</b> signals.
Only <b>MINES</b> is available in the app right now.`,
    instructionBtn: "📘 Instructions",
    languageBtn: "🌐 Choose language",
    supportBtn: "🔗 Support",
    getSignalBtn: "⚜️ GET SIGNAL",
    backBtn: "⬅️ Back to main menu",
    openAppBtn: "🎮 Open RISK MODE",
    registerBtn: "✅ Register",
    depositBtn: "💳 Make deposit",
    instructionTitle: "<b>INSTRUCTIONS</b>",
    instructionBody: `🤖 <b>RISK MODE USES AI-DRIVEN SIGNAL LOGIC, PATTERN ANALYSIS AND 1WIN GAMEFLOW MODELS.</b>

⚜️ <b>THE SYSTEM IS BUILT AROUND A LARGE SET OF MINES PATTERNS, SCENARIOS AND WORKING MODELS.</b>

📈 <b>THE BOT IS STILL BEING IMPROVED FOR MORE STABLE AND MORE ACCURATE PERFORMANCE.</b>

To start, follow the steps below:

🟢 1. <b>REGISTER</b> in 1WIN using the button below.

🟢 2. <b>TOP UP</b> your gaming balance by the minimum amount:
<b>1500 RUB (20$)</b>.

🟢 3. <b>GO</b> to the 1WIN games section and choose <b>MINES</b>.

🟢 4. For <b>MINES</b>, the <b>OPTIMAL</b> trap count is <b>3</b>.

🟢 5. Tap <b>“GET SIGNAL”</b> and follow the received scenario.

🟢 6. For more stable work with signals, stick to <b>ONE STRATEGY</b> and keep your entries consistent.

📩 Contact <b>SUPPORT</b> for strategy questions and optimal usage.`,
    chooseLanguageTitle: "<b>SELECT LANGUAGE</b>",
    supportMissing: "Support is not configured yet.",
    registrationTitle: "<b>STEP 1 OF 2</b>",
    registrationText: "To unlock signals, <b>REGISTER</b> using the button below.",
    depositTitle: "<b>STEP 2 OF 2</b>",
    depositText: (amount) => `REGISTRATION CONFIRMED.

Now <b>TOP UP</b> your gaming balance by the minimum amount:
<b>${amount}</b>.

After the deposit is confirmed, access will be unlocked <b>AUTOMATICALLY</b>.`,
    accessTitle: "<b>ACCESS ACTIVE</b>",
    accessText: `Your account is <b>CONFIRMED</b>.
Open the app and get a signal for <b>MINES</b>.`,
    langSaved: "Language saved."
  },
  tr: { languageName: "Türkçe", menuTitle: "<b>ANA MENÜ</b>", menuText: "Aşağıdan bir işlem seçin.", instructionBtn: "📘 Talimatlar", languageBtn: "🌐 Dil seç", supportBtn: "🔗 Destek", getSignalBtn: "⚜️ SİNYAL AL", backBtn: "⬅️ Ana menüye dön", openAppBtn: "🎮 RISK MODE'u aç", registerBtn: "✅ Kayıt ol", depositBtn: "💳 Para yatır", instructionTitle: "<b>TALİMATLAR</b>", instructionBody: "1. Aşağıdaki düğmeyle kayıt olun.\n2. Kayıttan sonra minimum yatırımı yapın.\n3. Erişim onaylandıktan sonra “Sinyal al”a dokunun.\n4. Uygulamayı açın ve sinyalleri WebApp içinde kullanın.", chooseLanguageTitle: "<b>DİL SEÇ</b>", supportMissing: "Destek henüz ayarlanmadı.", registrationTitle: "<b>ADIM 1 / 2</b>", registrationText: "Sinyallerin kilidini açmak için önce kayıt olun.", depositTitle: "<b>ADIM 2 / 2</b>", depositText: (amount) => `Kayıt doğrulandı. Şimdi erişimi açmak için <b>${amount}</b> ve üzeri yatırım yapın.`, accessTitle: "<b>ERİŞİM AÇIK</b>", accessText: "Uygulamayı açmak için aşağıdaki düğmeye dokunun.", langSaved: "Dil kaydedildi." },
  es: { languageName: "Español", menuTitle: "<b>MENÚ PRINCIPAL</b>", menuText: "Elige una acción abajo.", instructionBtn: "📘 Instrucciones", languageBtn: "🌐 Elegir idioma", supportBtn: "🔗 Soporte", getSignalBtn: "⚜️ OBTENER SEÑAL", backBtn: "⬅️ Volver al menú", openAppBtn: "🎮 Abrir RISK MODE", registerBtn: "✅ Registrarse", depositBtn: "💳 Depositar", instructionTitle: "<b>INSTRUCCIONES</b>", instructionBody: "1. Regístrate con el botón de abajo.\n2. Después del registro, haz el depósito mínimo.\n3. Cuando el acceso esté confirmado, pulsa “Obtener señal”.\n4. Abre la aplicación y usa las señales dentro del WebApp.", chooseLanguageTitle: "<b>SELECCIONAR IDIOMA</b>", supportMissing: "El soporte aún no está configurado.", registrationTitle: "<b>PASO 1 DE 2</b>", registrationText: "Para desbloquear las señales, primero regístrate.", depositTitle: "<b>PASO 2 DE 2</b>", depositText: (amount) => `Registro confirmado. Ahora realiza un depósito desde <b>${amount}</b> para abrir el acceso.`, accessTitle: "<b>ACCESO ACTIVO</b>", accessText: "Pulsa el botón de abajo para abrir la app.", langSaved: "Idioma guardado." },
  pt: { languageName: "Português", menuTitle: "<b>MENU PRINCIPAL</b>", menuText: "Escolha uma ação abaixo.", instructionBtn: "📘 Instruções", languageBtn: "🌐 Escolher idioma", supportBtn: "🔗 Suporte", getSignalBtn: "⚜️ OBTER SINAL", backBtn: "⬅️ Voltar ao menu", openAppBtn: "🎮 Abrir RISK MODE", registerBtn: "✅ Registrar", depositBtn: "💳 Depositar", instructionTitle: "<b>INSTRUÇÕES</b>", instructionBody: "1. Registre-se usando o botão abaixo.\n2. Depois do registro, faça o depósito mínimo.\n3. Quando o acesso for confirmado, toque em “Obter sinal”.\n4. Abra o aplicativo e use os sinais dentro do WebApp.", chooseLanguageTitle: "<b>ESCOLHA O IDIOMA</b>", supportMissing: "O suporte ainda não foi configurado.", registrationTitle: "<b>PASSO 1 DE 2</b>", registrationText: "Para desbloquear os sinais, registre-se primeiro.", depositTitle: "<b>PASSO 2 DE 2</b>", depositText: (amount) => `Registro confirmado. Agora faça um depósito a partir de <b>${amount}</b> para liberar o acesso.`, accessTitle: "<b>ACESSO ATIVO</b>", accessText: "Toque no botão abaixo para abrir o app.", langSaved: "Idioma salvo." },
  "pt-br": { languageName: "Português (BR)", menuTitle: "<b>MENU PRINCIPAL</b>", menuText: "Escolha uma ação abaixo.", instructionBtn: "📘 Instruções", languageBtn: "🌐 Escolher idioma", supportBtn: "🔗 Suporte", getSignalBtn: "⚜️ OBTER SINAL", backBtn: "⬅️ Voltar ao menu", openAppBtn: "🎮 Abrir RISK MODE", registerBtn: "✅ Registrar", depositBtn: "💳 Depositar", instructionTitle: "<b>INSTRUÇÕES</b>", instructionBody: "1. Faça o cadastro pelo botão abaixo.\n2. Depois do cadastro, faça o depósito mínimo.\n3. Quando o acesso for confirmado, toque em “Obter sinal”.\n4. Abra o app e use os sinais dentro do WebApp.", chooseLanguageTitle: "<b>ESCOLHA O IDIOMA</b>", supportMissing: "O suporte ainda não foi configurado.", registrationTitle: "<b>ETAPA 1 DE 2</b>", registrationText: "Para liberar os sinais, faça o cadastro primeiro.", depositTitle: "<b>ETAPA 2 DE 2</b>", depositText: (amount) => `Cadastro confirmado. Agora faça um depósito de pelo menos <b>${amount}</b> para liberar o acesso.`, accessTitle: "<b>ACESSO ATIVO</b>", accessText: "Toque no botão abaixo para abrir o app.", langSaved: "Idioma salvo." },
  ar: { languageName: "Español (AR)", menuTitle: "<b>MENÚ PRINCIPAL</b>", menuText: "Elegí una acción abajo.", instructionBtn: "📘 Instrucciones", languageBtn: "🌐 Elegir idioma", supportBtn: "🔗 Soporte", getSignalBtn: "⚜️ OBTENER SEÑAL", backBtn: "⬅️ Volver al menú", openAppBtn: "🎮 Abrir RISK MODE", registerBtn: "✅ Registrarse", depositBtn: "💳 Depositar", instructionTitle: "<b>INSTRUCCIONES</b>", instructionBody: "1. Registrate con el botón de abajo.\n2. Después del registro, hacé el depósito mínimo.\n3. Cuando el acceso esté confirmado, tocá “Obtener señal”.\n4. Abrí la app y usá las señales dentro del WebApp.", chooseLanguageTitle: "<b>SELECCIONÁ IDIOMA</b>", supportMissing: "El soporte todavía no está configurado.", registrationTitle: "<b>PASO 1 DE 2</b>", registrationText: "Para desbloquear las señales, primero registrate.", depositTitle: "<b>PASO 2 DE 2</b>", depositText: (amount) => `Registro confirmado. Ahora hacé un depósito desde <b>${amount}</b> para abrir el acceso.`, accessTitle: "<b>ACCESO ACTIVO</b>", accessText: "Tocá el botón de abajo para abrir la app.", langSaved: "Idioma guardado." },
  sa: { languageName: "العربية", menuTitle: "<b>القائمة الرئيسية</b>", menuText: "اختر إجراءً من الأسفل.", instructionBtn: "📘 التعليمات", languageBtn: "🌐 اختيار اللغة", supportBtn: "🔗 الدعم", getSignalBtn: "⚜️ الحصول على الإشارة", backBtn: "⬅️ العودة إلى القائمة", openAppBtn: "🎮 فتح RISK MODE", registerBtn: "✅ التسجيل", depositBtn: "💳 الإيداع", instructionTitle: "<b>التعليمات</b>", instructionBody: "1. سجّل باستخدام الزر أدناه.\n2. بعد التسجيل قم بالإيداع الأدنى.\n3. بعد تأكيد الوصول اضغط «الحصول على الإشارة».\n4. افتح التطبيق واستخدم الإشارات داخل WebApp.", chooseLanguageTitle: "<b>اختر اللغة</b>", supportMissing: "الدعم غير مضبوط بعد.", registrationTitle: "<b>الخطوة 1 من 2</b>", registrationText: "لفتح الإشارات، سجّل أولًا.", depositTitle: "<b>الخطوة 2 من 2</b>", depositText: (amount) => `تم تأكيد التسجيل. الآن قم بالإيداع ابتداءً من <b>${amount}</b> لفتح الوصول.`, accessTitle: "<b>تم تفعيل الوصول</b>", accessText: "اضغط الزر أدناه لفتح التطبيق.", langSaved: "تم حفظ اللغة." },
  it: { languageName: "Italiano", menuTitle: "<b>MENU PRINCIPALE</b>", menuText: "Scegli un'azione qui sotto.", instructionBtn: "📘 Istruzioni", languageBtn: "🌐 Scegli lingua", supportBtn: "🔗 Supporto", getSignalBtn: "⚜️ OTTIENI SEGNALE", backBtn: "⬅️ Torna al menu", openAppBtn: "🎮 Apri RISK MODE", registerBtn: "✅ Registrati", depositBtn: "💳 Deposita", instructionTitle: "<b>ISTRUZIONI</b>", instructionBody: "1. Registrati usando il pulsante qui sotto.\n2. Dopo la registrazione, effettua il deposito minimo.\n3. Quando l'accesso è confermato, tocca “Ottieni segnale”.\n4. Apri l'app e usa i segnali dentro la WebApp.", chooseLanguageTitle: "<b>SCEGLI LA LINGUA</b>", supportMissing: "Il supporto non è ancora configurato.", registrationTitle: "<b>PASSO 1 DI 2</b>", registrationText: "Per sbloccare i segnali, registrati prima.", depositTitle: "<b>PASSO 2 DI 2</b>", depositText: (amount) => `Registrazione confermata. Ora effettua un deposito da <b>${amount}</b> per aprire l'accesso.`, accessTitle: "<b>ACCESSO ATTIVO</b>", accessText: "Tocca il pulsante qui sotto per aprire l'app.", langSaved: "Lingua salvata." },
  hi: { languageName: "हिन्दी", menuTitle: "<b>मुख्य मेन्यू</b>", menuText: "नीचे से एक विकल्प चुनें।", instructionBtn: "📘 निर्देश", languageBtn: "🌐 भाषा चुनें", supportBtn: "🔗 सहायता", getSignalBtn: "⚜️ सिग्नल प्राप्त करें", backBtn: "⬅️ मुख्य मेन्यू पर लौटें", openAppBtn: "🎮 RISK MODE खोलें", registerBtn: "✅ रजिस्टर करें", depositBtn: "💳 जमा करें", instructionTitle: "<b>निर्देश</b>", instructionBody: "1. नीचे दिए गए बटन से रजिस्टर करें।\n2. रजिस्ट्रेशन के बाद न्यूनतम जमा करें।\n3. एक्सेस कन्फर्म होने के बाद “सिग्नल प्राप्त करें” दबाएँ।\n4. ऐप खोलें और WebApp के अंदर सिग्नल का उपयोग करें।", chooseLanguageTitle: "<b>भाषा चुनें</b>", supportMissing: "सपोर्ट अभी सेट नहीं है।", registrationTitle: "<b>चरण 1 / 2</b>", registrationText: "सिग्नल अनलॉक करने के लिए पहले रजिस्टर करें।", depositTitle: "<b>चरण 2 / 2</b>", depositText: (amount) => `रजिस्ट्रेशन कन्फर्म हो गया है। अब एक्सेस खोलने के लिए <b>${amount}</b> या उससे अधिक जमा करें।`, accessTitle: "<b>एक्सेस सक्रिय</b>", accessText: "ऐप खोलने के लिए नीचे बटन दबाएँ।", langSaved: "भाषा सेव हो गई।" },
  uk: { languageName: "Українська", menuTitle: "<b>ГОЛОВНЕ МЕНЮ</b>", menuText: "Оберіть дію нижче.", instructionBtn: "📘 Інструкція", languageBtn: "🌐 Обрати мову", supportBtn: "🔗 Підтримка", getSignalBtn: "⚜️ ОТРИМАТИ СИГНАЛ", backBtn: "⬅️ Повернутися в меню", openAppBtn: "🎮 Відкрити RISK MODE", registerBtn: "✅ Реєстрація", depositBtn: "💳 Поповнити", instructionTitle: "<b>ІНСТРУКЦІЯ</b>", instructionBody: "1. Зареєструйтеся кнопкою нижче.\n2. Після реєстрації внесіть мінімальний депозит.\n3. Після підтвердження доступу натисніть «Отримати сигнал».\n4. Відкрийте застосунок і використовуйте сигнали у WebApp.", chooseLanguageTitle: "<b>ОБЕРІТЬ МОВУ</b>", supportMissing: "Підтримка ще не налаштована.", registrationTitle: "<b>КРОК 1 З 2</b>", registrationText: "Щоб відкрити доступ до сигналів, спочатку зареєструйтеся.", depositTitle: "<b>КРОК 2 З 2</b>", depositText: (amount) => `Реєстрацію підтверджено. Тепер внесіть депозит від <b>${amount}</b>, щоб відкрити доступ.`, accessTitle: "<b>ДОСТУП АКТИВНО</b>", accessText: "Натисніть кнопку нижче, щоб відкрити застосунок.", langSaved: "Мову збережено." },
  kz: { languageName: "Қазақша", menuTitle: "<b>НЕГІЗГІ МӘЗІР</b>", menuText: "Төменнен әрекетті таңдаңыз.", instructionBtn: "📘 Нұсқаулық", languageBtn: "🌐 Тілді таңдау", supportBtn: "🔗 Қолдау", getSignalBtn: "⚜️ СИГНАЛ АЛУ", backBtn: "⬅️ Мәзірге оралу", openAppBtn: "🎮 RISK MODE ашу", registerBtn: "✅ Тіркелу", depositBtn: "💳 Депозит жасау", instructionTitle: "<b>НҰСҚАУЛЫҚ</b>", instructionBody: "1. Төмендегі батырма арқылы тіркеліңіз.\n2. Тіркелгеннен кейін ең төменгі депозитті жасаңыз.\n3. Қолжетімділік расталған соң «Сигнал алу» түймесін басыңыз.\n4. Қолданбаны ашып, сигналдарды WebApp ішінде пайдаланыңыз.", chooseLanguageTitle: "<b>ТІЛДІ ТАҢДАҢЫЗ</b>", supportMissing: "Қолдау әлі бапталмаған.", registrationTitle: "<b>1/2 ҚАДАМ</b>", registrationText: "Сигналдарға қол жеткізу үшін алдымен тіркеліңіз.", depositTitle: "<b>2/2 ҚАДАМ</b>", depositText: (amount) => `Тіркеу расталды. Енді қолжетімділікті ашу үшін <b>${amount}</b> бастап депозит жасаңыз.`, accessTitle: "<b>ҚОЛЖЕТІМДІЛІК БЕЛСЕНДІ</b>", accessText: "Қолданбаны ашу үшін төмендегі батырманы басыңыз.", langSaved: "Тіл сақталды." },
  uz: { languageName: "Oʻzbek", menuTitle: "<b>ASOSIY MENYU</b>", menuText: "Quyidan amalni tanlang.", instructionBtn: "📘 Yoʻriqnoma", languageBtn: "🌐 Tilni tanlash", supportBtn: "🔗 Yordam", getSignalBtn: "⚜️ SIGNAL OLISH", backBtn: "⬅️ Menyuga qaytish", openAppBtn: "🎮 RISK MODE ochish", registerBtn: "✅ Roʻyxatdan oʻtish", depositBtn: "💳 Depozit qilish", instructionTitle: "<b>YOʻRIQNOMA</b>", instructionBody: "1. Quyidagi tugma orqali roʻyxatdan oʻting.\n2. Roʻyxatdan oʻtgach minimal depozit kiriting.\n3. Kirish tasdiqlangandan soʻng “Signal olish”ni bosing.\n4. Ilovani ochib, signallardan WebApp ichida foydalaning.", chooseLanguageTitle: "<b>TILNI TANLANG</b>", supportMissing: "Yordam hali sozlanmagan.", registrationTitle: "<b>1/2 QADAM</b>", registrationText: "Signallarni ochish uchun avval roʻyxatdan oʻting.", depositTitle: "<b>2/2 QADAM</b>", depositText: (amount) => `Roʻyxatdan oʻtish tasdiqlandi. Endi kirishni ochish uchun <b>${amount}</b> dan boshlab depozit qiling.`, accessTitle: "<b>KIRISH FAOL</b>", accessText: "Ilovani ochish uchun quyidagi tugmani bosing.", langSaved: "Til saqlandi." },
  az: { languageName: "Azərbaycanca", menuTitle: "<b>ƏSAS MENYU</b>", menuText: "Aşağıdan əməliyyat seçin.", instructionBtn: "📘 Təlimat", languageBtn: "🌐 Dili seç", supportBtn: "🔗 Dəstək", getSignalBtn: "⚜️ SİQNAL AL", backBtn: "⬅️ Menyuya qayıt", openAppBtn: "🎮 RISK MODE aç", registerBtn: "✅ Qeydiyyat", depositBtn: "💳 Depozit et", instructionTitle: "<b>TƏLİMAT</b>", instructionBody: "1. Aşağıdakı düymə ilə qeydiyyatdan keçin.\n2. Qeydiyyatdan sonra minimal depozit edin.\n3. Giriş təsdiqləndikdən sonra “Siqnal al” düyməsini basın.\n4. Tətbiqi açın və siqnallardan WebApp daxilində istifadə edin.", chooseLanguageTitle: "<b>DİLİ SEÇİN</b>", supportMissing: "Dəstək hələ qurulmayıb.", registrationTitle: "<b>1/2 ADDIM</b>", registrationText: "Siqnalları açmaq üçün əvvəlcə qeydiyyatdan keçin.", depositTitle: "<b>2/2 ADDIM</b>", depositText: (amount) => `Qeydiyyat təsdiqləndi. İndi girişi açmaq üçün <b>${amount}</b> və yuxarı depozit edin.`, accessTitle: "<b>GİRİŞ AKTİVDİR</b>", accessText: "Tətbiqi açmaq üçün aşağıdakı düyməni basın.", langSaved: "Dil saxlanıldı." },
  hy: { languageName: "Հայերեն", menuTitle: "<b>ԳԼԽԱՎՈՐ ՄԵՆՅՈՒ</b>", menuText: "Ընտրեք գործողություն ներքևում։", instructionBtn: "📘 Ուղեցույց", languageBtn: "🌐 Ընտրել լեզուն", supportBtn: "🔗 Աջակցություն", getSignalBtn: "⚜️ ՍՏԱՆԱԼ ՍԻԳՆԱԼ", backBtn: "⬅️ Վերադառնալ մենյու", openAppBtn: "🎮 Բացել RISK MODE", registerBtn: "✅ Գրանցվել", depositBtn: "💳 Կատարել դեպոզիտ", instructionTitle: "<b>ՈՒՂԵՑՈՒՅՑ</b>", instructionBody: "1. Գրանցվեք ստորև գտնվող կոճակով։\n2. Գրանցումից հետո կատարեք նվազագույն դեպոզիտ։\n3. Մուտքը հաստատվելուց հետո սեղմեք «Ստանալ սիգնալ»։\n4. Բացեք հավելվածը և օգտագործեք սիգնալները WebApp-ի մեջ։", chooseLanguageTitle: "<b>ԸՆՏՐԵՔ ԼԵԶՈՒՆ</b>", supportMissing: "Աջակցությունը դեռ կարգավորված չէ։", registrationTitle: "<b>ՔԱՅԼ 1 / 2</b>", registrationText: "Սիգնալները բացելու համար նախ գրանցվեք։", depositTitle: "<b>ՔԱՅԼ 2 / 2</b>", depositText: (amount) => `Գրանցումը հաստատվել է։ Այժմ կատարեք դեպոզիտ <b>${amount}</b>-ից սկսած՝ մուտքը բացելու համար։`, accessTitle: "<b>ՄՈՒՏՔԸ ԱԿՏԻՎ Է</b>", accessText: "Հավելվածը բացելու համար սեղմեք ստորև գտնվող կոճակը։", langSaved: "Լեզուն պահպանվեց։" }
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function tr(lang) {
  return L[lang] || L.ru;
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
    return data.user || { tg_id: String(tgId), lang: "ru", reg: false, paid: false, access: false };
  } catch {
    return { tg_id: String(tgId), lang: "ru", reg: false, paid: false, access: false };
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

function mainText(lang) {
  const p = tr(lang);
  return `${p.menuTitle}\n\n${p.menuText}`;
}

function instructionText(lang) {
  const p = tr(lang);
  return `${p.instructionTitle}\n\n${p.instructionBody}`;
}

function registrationText(lang) {
  const p = tr(lang);
  return `${p.registrationTitle}\n\n${p.registrationText}`;
}

function depositText(lang, amount) {
  const p = tr(lang);
  return `${p.depositTitle}\n\n${p.depositText(amount)}`;
}

function accessText(lang) {
  const p = tr(lang);
  return `${p.accessTitle}\n\n${p.accessText}`;
}

function screenPhoto(key, caption) {
  return {
    type: "photo",
    media: MEDIA[key],
    caption,
    parse_mode: "HTML"
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
      supportButton,
      getSignalButton
    ]
  };
}

function languageKeyboard(lang) {
  const p = tr(lang);
  const rows = LANG_ORDER.map((pair) => pair.map((code) => ({ text: flagLabel(code), callback_data: `lang:${code}` })));
  rows.push([{ text: p.backBtn, callback_data: "main_menu" }]);
  return { inline_keyboard: rows };
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

async function upsertMenuMeta(chatId, messageId, user) {
  await patchUser(chatId, {
    menu_chat_id: String(chatId),
    menu_message_id: String(messageId),
    lang: user.lang || "ru"
  });
}

async function sendMainMenu(chatId) {
  const user = await getUser(chatId);
  const msg = await bot.sendPhoto(chatId, MEDIA.main, {
    caption: mainText(user.lang),
    parse_mode: "HTML",
    reply_markup: mainKeyboard(user, user.lang)
  });
  await upsertMenuMeta(chatId, msg.message_id, user);
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

bot.onText(/\/start/, async (msg) => {
  await sendMainMenu(msg.chat.id);
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
    await editMenu(query, "main", mainText(user.lang), mainKeyboard(user, user.lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data === "instruction") {
    await editMenu(query, "instruction", instructionText(lang), {
      inline_keyboard: [[{ text: p.backBtn, callback_data: "main_menu" }]]
    });
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data === "choose_language") {
    await editMenu(query, "language", `${p.chooseLanguageTitle}\n\n${p.menuText}`, languageKeyboard(lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
    return;
  }

  if (query.data?.startsWith("lang:")) {
    const next = query.data.split(":")[1];
    user = (await patchUser(chatId, { lang: next })) || user;
    const np = tr(user.lang || next);
    try {
      await bot.answerCallbackQuery(query.id, { text: np.langSaved });
    } catch {}
    await editMenu(query, "main", mainText(user.lang), mainKeyboard(user, user.lang));
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

    if (!user.reg) {
      await editMenu(query, "step1", registrationText(user.lang), registrationKeyboard(chatId, user.lang));
      await upsertMenuMeta(chatId, query.message.message_id, user);
      return;
    }

    if (!user.paid) {
      const userData = await api(`/internal/user/${chatId}`);
      const min = userData.min_deposit || 100;
      await editMenu(query, "step2", depositText(user.lang, min), depositKeyboard(chatId, user.lang));
      await upsertMenuMeta(chatId, query.message.message_id, user);
      return;
    }

    await editMenu(query, "access", accessText(user.lang), accessKeyboard(user.lang));
    await upsertMenuMeta(chatId, query.message.message_id, user);
  }
});

console.log("✅ Bot worker is running...");
