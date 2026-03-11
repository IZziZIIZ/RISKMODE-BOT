const tg = window.Telegram?.WebApp;
const $ = (id) => document.getElementById(id);

const pageHome = $("pageHome");
const pageMines = $("pageMines");
const btnPlay = $("btnPlay");
const board = $("board");

const minesSlider = $("minesSlider");
const modeSlider = $("modeSlider");
const homeLangBtn = $("homeLangBtn");
const homeLangMenu = $("homeLangMenu");
const minesLangBtn = $("minesLangBtn");
const minesLangMenu = $("minesLangMenu");
const btnHistoryHead = $("btnHistoryHead");
const backFromMines = $("backFromMines");

const historyOverlay = $("historyOverlay");
const historyTitle = $("historyTitle");
const historyMeta = $("historyMeta");
const historyPreviewBoard = $("historyPreviewBoard");
const historyPrev = $("historyPrev");
const historyNext = $("historyNext");
const historyCounter = $("historyCounter");
const latestBadge = $("latestBadge");
const btnCloseHistory = $("btnCloseHistory");

let selectedMines = 1;
let selectedMode = "single";
let historyItems = loadHistory();
let historyIndex = 0;
let currentLang = pickInitialLang();

const LANGS = [
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "en", label: "English", flag: "gb" },
  { code: "tr", label: "Türkçe", flag: "tr" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "pt-br", label: "Português (BR)", flag: "br" },
  { code: "ar", label: "Español (AR)", flag: "ar" },
  { code: "sa", label: "العربية (SA)", flag: "sa" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "hi", label: "हिन्दी", flag: "in" },
  { code: "uk", label: "Українська", flag: "ua" },
  { code: "kz", label: "Қазақша", flag: "kz" },
  { code: "uz", label: "Oʻzbek", flag: "uz" },
  { code: "az", label: "Azərbaycanca", flag: "az" },
  { code: "hy", label: "Հայերեն", flag: "am" }
];


const TEXT = {
  ru: {
    history: "История",
    mines: "Мины",
    mode: "Режим",
    single: "Поочередно",
    all: "Все сразу",
    play: "Играть",
    generating: "Генерация...",
    loading: "Проверка доступа...",
    noTelegram: "Откройте приложение из Telegram.",
    noAccess: "Доступ к WebApp пока не открыт.",
    badRequest: "Не удалось получить сигнал.",
    accessDenied: "Доступ закрыт. Сначала завершите регистрацию и депозит.",
    serverError: "Ошибка сервера. Попробуйте ещё раз.",
    back: "Назад",
    latest: "ПОСЛЕДНИЙ",
    prev: "← Назад",
    next: "Вперёд →"
  },
  en: {
    history: "History",
    mines: "Mines",
    mode: "Mode",
    single: "Single",
    all: "All",
    play: "Play",
    generating: "Generating...",
    loading: "Checking access...",
    noTelegram: "Open the app from Telegram.",
    noAccess: "Access to the WebApp is not open yet.",
    badRequest: "Failed to get signal.",
    accessDenied: "Access denied. Finish registration and deposit first.",
    serverError: "Server error. Try again.",
    back: "Back",
    latest: "LATEST",
    prev: "← Prev",
    next: "Next →"
  },
  tr: {
    history: "Geçmiş",
    mines: "Mayınlar",
    mode: "Mod",
    single: "Tek tek",
    all: "Hepsi",
    play: "Oyna",
    generating: "Oluşturuluyor...",
    loading: "Erişim kontrol ediliyor...",
    noTelegram: "Uygulamayı Telegram içinden açın.",
    noAccess: "WebApp erişimi henüz açık değil.",
    badRequest: "Sinyal alınamadı.",
    accessDenied: "Erişim kapalı. Önce kayıt ve depoziti tamamlayın.",
    serverError: "Sunucu hatası. Tekrar deneyin.",
    back: "Geri",
    latest: "SON",
    prev: "← Geri",
    next: "İleri →"
  },
  es: {
    history: "Historial",
    mines: "Minas",
    mode: "Modo",
    single: "Uno por uno",
    all: "Todo",
    play: "Jugar",
    generating: "Generando...",
    loading: "Verificando acceso...",
    noTelegram: "Abre la aplicación desde Telegram.",
    noAccess: "El acceso al WebApp aún no está abierto.",
    badRequest: "No se pudo obtener la señal.",
    accessDenied: "Acceso denegado. Primero completa el registro y el depósito.",
    serverError: "Error del servidor. Inténtalo de nuevo.",
    back: "Atrás",
    latest: "ÚLTIMO",
    prev: "← Atrás",
    next: "Siguiente →"
  },
  pt: {
    history: "Histórico",
    mines: "Minas",
    mode: "Modo",
    single: "Um por um",
    all: "Tudo",
    play: "Jogar",
    generating: "Gerando...",
    loading: "Verificando acesso...",
    noTelegram: "Abra o app pelo Telegram.",
    noAccess: "O acesso ao WebApp ainda não está liberado.",
    badRequest: "Não foi possível obter o sinal.",
    accessDenied: "Acesso negado. Conclua registro e depósito primeiro.",
    serverError: "Erro do servidor. Tente novamente.",
    back: "Voltar",
    latest: "ÚLTIMO",
    prev: "← Voltar",
    next: "Próximo →"
  },
  "pt-br": {
    history: "Histórico",
    mines: "Minas",
    mode: "Modo",
    single: "Um por um",
    all: "Tudo",
    play: "Jogar",
    generating: "Gerando...",
    loading: "Verificando acesso...",
    noTelegram: "Abra o app pelo Telegram.",
    noAccess: "O acesso ao WebApp ainda não está liberado.",
    badRequest: "Não foi possível obter o sinal.",
    accessDenied: "Acesso negado. Conclua cadastro e depósito primeiro.",
    serverError: "Erro do servidor. Tente novamente.",
    back: "Voltar",
    latest: "ÚLTIMO",
    prev: "← Voltar",
    next: "Próximo →"
  },
  ar: {
    history: "Historial",
    mines: "Minas",
    mode: "Modo",
    single: "Uno por uno",
    all: "Todo",
    play: "Jugar",
    generating: "Generando...",
    loading: "Verificando acceso...",
    noTelegram: "Abre la app desde Telegram.",
    noAccess: "El acceso al WebApp aún no está abierto.",
    badRequest: "No se pudo obtener la señal.",
    accessDenied: "Acceso denegado. Primero completa el registro y el depósito.",
    serverError: "Error del servidor. Inténtalo de nuevo.",
    back: "Atrás",
    latest: "ÚLTIMO",
    prev: "← Atrás",
    next: "Siguiente →"
  },
  sa: {
    history: "السجل",
    mines: "الألغام",
    mode: "الوضع",
    single: "واحدًا تلو الآخر",
    all: "الكل",
    play: "ابدأ",
    generating: "جارٍ الإنشاء...",
    loading: "جارٍ التحقق من الوصول...",
    noTelegram: "افتح التطبيق من داخل Telegram.",
    noAccess: "الوصول إلى WebApp غير متاح بعد.",
    badRequest: "تعذر الحصول على الإشارة.",
    accessDenied: "تم رفض الوصول. أكمل التسجيل والإيداع أولاً.",
    serverError: "خطأ في الخادم. حاول مرة أخرى.",
    back: "رجوع",
    latest: "الأحدث",
    prev: "← السابق",
    next: "التالي →"
  },
  it: {
    history: "Cronologia",
    mines: "Mine",
    mode: "Modalità",
    single: "Una per una",
    all: "Tutto",
    play: "Gioca",
    generating: "Generazione...",
    loading: "Verifica accesso...",
    noTelegram: "Apri l'app da Telegram.",
    noAccess: "L'accesso al WebApp non è ancora aperto.",
    badRequest: "Impossibile ottenere il segnale.",
    accessDenied: "Accesso negato. Completa prima registrazione e deposito.",
    serverError: "Errore del server. Riprova.",
    back: "Indietro",
    latest: "ULTIMO",
    prev: "← Indietro",
    next: "Avanti →"
  },
  hi: {
    history: "इतिहास",
    mines: "माइंस",
    mode: "मोड",
    single: "एक-एक करके",
    all: "सभी",
    play: "खेलें",
    generating: "जनरेट हो रहा है...",
    loading: "एक्सेस जाँचा जा रहा है...",
    noTelegram: "ऐप को Telegram से खोलें।",
    noAccess: "WebApp का एक्सेस अभी खुला नहीं है।",
    badRequest: "सिग्नल प्राप्त नहीं हुआ।",
    accessDenied: "एक्सेस बंद है। पहले रजिस्ट्रेशन और डिपॉज़िट पूरा करें।",
    serverError: "सर्वर त्रुटि। फिर से प्रयास करें।",
    back: "वापस",
    latest: "नवीनतम",
    prev: "← पिछला",
    next: "अगला →"
  },
  uk: {
    history: "Історія",
    mines: "Міни",
    mode: "Режим",
    single: "По черзі",
    all: "Усе",
    play: "Грати",
    generating: "Генерація...",
    loading: "Перевірка доступу...",
    noTelegram: "Відкрийте застосунок із Telegram.",
    noAccess: "Доступ до WebApp ще не відкрито.",
    badRequest: "Не вдалося отримати сигнал.",
    accessDenied: "Доступ закрито. Спочатку завершіть реєстрацію та депозит.",
    serverError: "Помилка сервера. Спробуйте ще раз.",
    back: "Назад",
    latest: "ОСТАННІЙ",
    prev: "← Назад",
    next: "Далі →"
  },
  kz: {
    history: "Тарих",
    mines: "Миналар",
    mode: "Режим",
    single: "Бір-бірден",
    all: "Барлығы",
    play: "Ойнау",
    generating: "Генерация...",
    loading: "Қолжетімділік тексерілуде...",
    noTelegram: "Қолданбаны Telegram ішінен ашыңыз.",
    noAccess: "WebApp қолжетімділігі әлі ашылған жоқ.",
    badRequest: "Сигнал алу мүмкін болмады.",
    accessDenied: "Қолжетімділік жабық. Алдымен тіркеу мен депозитті аяқтаңыз.",
    serverError: "Сервер қатесі. Қайта көріңіз.",
    back: "Артқа",
    latest: "СОҢҒЫ",
    prev: "← Артқа",
    next: "Келесі →"
  },
  uz: {
    history: "Tarix",
    mines: "Minalar",
    mode: "Rejim",
    single: "Birma-bir",
    all: "Hammasi",
    play: "O‘ynash",
    generating: "Yaratilmoqda...",
    loading: "Kirish tekshirilmoqda...",
    noTelegram: "Ilovani Telegram ichidan oching.",
    noAccess: "WebApp kirishi hali ochilmagan.",
    badRequest: "Signalni olishning imkoni bo‘lmadi.",
    accessDenied: "Kirish yopiq. Avval ro‘yxatdan o‘tish va depozitni yakunlang.",
    serverError: "Server xatosi. Yana urinib ko‘ring.",
    back: "Orqaga",
    latest: "SO‘NGGI",
    prev: "← Orqaga",
    next: "Keyingi →"
  },
  az: {
    history: "Tarixçə",
    mines: "Minalar",
    mode: "Rejim",
    single: "Bir-bir",
    all: "Hamısı",
    play: "Oyna",
    generating: "Yaradılır...",
    loading: "Giriş yoxlanılır...",
    noTelegram: "Tətbiqi Telegram-dan açın.",
    noAccess: "WebApp girişi hələ açılmayıb.",
    badRequest: "Siqnal alınmadı.",
    accessDenied: "Giriş bağlıdır. Əvvəlcə qeydiyyat və depoziti tamamlayın.",
    serverError: "Server xətası. Yenidən cəhd edin.",
    back: "Geri",
    latest: "SON",
    prev: "← Geri",
    next: "Növbəti →"
  },
  hy: {
    history: "Պատմություն",
    mines: "Ականներ",
    mode: "Ռեժիմ",
    single: "Հերթով",
    all: "Բոլորը",
    play: "Խաղալ",
    generating: "Ստեղծվում է...",
    loading: "Մուտքը ստուգվում է...",
    noTelegram: "Բացեք հավելվածը Telegram-ից։",
    noAccess: "WebApp հասանելիությունը դեռ բաց չէ։",
    badRequest: "Չհաջողվեց ստանալ ազդանշանը։",
    accessDenied: "Մուտքը փակ է։ Նախ ավարտեք գրանցումն ու դեպոզիտը։",
    serverError: "Սերվերի սխալ։ Փորձեք կրկին։",
    back: "Հետ",
    latest: "ՎԵՐՋԻՆ",
    prev: "← Հետ",
    next: "Առաջ →"
  }
};


function t(key){
  const pack = TEXT[currentLang] || TEXT.en;
  return pack[key] || TEXT.en[key] || key;
}

function pickInitialLang(){
  const saved = localStorage.getItem("rm_lang");
  if (saved) return saved;
  const l = tg?.initDataUnsafe?.user?.language_code || navigator.language || "ru";
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("tr")) return "tr";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("pt")) return "pt";
  if (l.startsWith("ar")) return "sa";
  if (l.startsWith("it")) return "it";
  if (l.startsWith("uk")) return "uk";
  if (l.startsWith("hi")) return "hi";
  return "en";
}

function setLang(lang){
  currentLang = lang;
  localStorage.setItem("rm_lang", lang);
  const meta = LANGS.find(x => x.code === lang) || LANGS[0];
  $("homeLangFlag").src = `/flags/${meta.flag}.svg`;
  $("homeLangLabel").textContent = meta.code.toUpperCase().replace("PT-BR", "BR");
  $("minesLangFlag").src = `/flags/${meta.flag}.svg`;
  $("minesLangLabel").textContent = meta.code.toUpperCase().replace("PT-BR", "BR");
  $("minesLabel").textContent = t("mines");
  $("modeLabel").textContent = t("mode");
  btnPlay.textContent = t("play");
  backFromMines.textContent = t("back");
  btnHistoryHead.textContent = t("history");
  historyTitle.textContent = t("history");
  latestBadge.textContent = t("latest");
  historyPrev.textContent = t("prev");
  historyNext.textContent = t("next");
  const modeBtns = modeSlider.querySelectorAll(".segSlideBtn");
  modeBtns[0].textContent = t("single");
  modeBtns[1].textContent = t("all");
  renderHistoryView();
}

function buildLangMenu(menuId, btnId){
  const menu = $(menuId);
  menu.innerHTML = "";
  for (const item of LANGS){
    const el = document.createElement("button");
    el.type = "button";
    el.className = "langItem";
    el.innerHTML = `
      <img class="langFlag" src="/flags/${item.flag}.svg" alt="${item.code}" />
      <div class="langText">
        <div class="langCode">${item.code.toUpperCase().replace("PT-BR", "BR")}</div>
        <div class="langName">${item.label}</div>
      </div>`;
    el.addEventListener("click", () => {
      setLang(item.code);
      menu.hidden = true;
      $(btnId).setAttribute("aria-expanded", "false");
    });
    menu.appendChild(el);
  }
}

function bindLang(btnId, menuId){
  const btn = $(btnId);
  const menu = $(menuId);
  buildLangMenu(menuId, btnId);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !menu.hidden;
    homeLangMenu.hidden = true;
    minesLangMenu.hidden = true;
    $("homeLangBtn").setAttribute("aria-expanded", "false");
    $("minesLangBtn").setAttribute("aria-expanded", "false");
    menu.hidden = next;
    btn.setAttribute("aria-expanded", String(!next));
  });
}

document.addEventListener("click", (e) => {
  if (!homeLangBtn.contains(e.target) && !homeLangMenu.contains(e.target)) {
    homeLangMenu.hidden = true;
    homeLangBtn.setAttribute("aria-expanded", "false");
  }
  if (!minesLangBtn.contains(e.target) && !minesLangMenu.contains(e.target)) {
    minesLangMenu.hidden = true;
    minesLangBtn.setAttribute("aria-expanded", "false");
  }
});

function openPage(name){
  pageHome.classList.toggle("active", name === "home");
  pageMines.classList.toggle("active", name === "mines");
  document.body.dataset.page = name;
  if (name === "mines") location.hash = "mines";
  else history.replaceState({}, "", location.pathname + location.search);
}

function updateThumb(slider, idx){
  const thumb = slider.querySelector(".segThumb");
  const total = slider.querySelectorAll(".segSlideBtn").length;
  const pct = 100 / total;
  thumb.style.width = `calc(${pct}% - ${((total-1)*6)/total}px)`;
  thumb.style.transform = `translateX(calc(${idx} * (100% + 6px)))`;
}

function setMines(value){
  selectedMines = Number(value);
  const btns = [...minesSlider.querySelectorAll(".segSlideBtn")];
  const idx = btns.findIndex(b => Number(b.dataset.mines) === selectedMines);
  btns.forEach((b,i)=>b.classList.toggle("active", i===idx));
  updateThumb(minesSlider, idx);
}

function setMode(value){
  selectedMode = value;
  const btns = [...modeSlider.querySelectorAll(".segSlideBtn")];
  const idx = btns.findIndex(b => b.dataset.mode === selectedMode);
  btns.forEach((b,i)=>b.classList.toggle("active", i===idx));
  updateThumb(modeSlider, idx);
}

function buildBoard(){
  board.innerHTML = "";
  for (let i=0;i<25;i++){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerHTML = '<div class="spark"></div>';
    board.appendChild(cell);
  }
}

function revealCell(index, type){
  const cell = board.children[index];
  if (!cell) return;
  cell.classList.add("reveal");
  cell.classList.remove("star","trap","emptyReveal");
  cell.querySelectorAll(".iconMark").forEach(n=>n.remove());
  if (type === 1 || type === 2){
    cell.classList.add(type === 1 ? "star" : "trap");
    const img = document.createElement("img");
    img.className = "iconMark";
    img.src = type === 1 ? "/assets/icons/star.svg" : "/assets/icons/trap.svg";
    img.alt = type === 1 ? "star" : "trap";
    cell.appendChild(img);
  } else {
    cell.classList.add("emptyReveal");
  }
}

function starsFor(mines){ return ({1:7,3:5,5:4,7:3})[mines] || 7; }

function pick(arr, n){
  const copy = arr.slice();
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]] = [copy[j],copy[i]];
  }
  return copy.slice(0,n);
}

function generateResult(mines, mode){
  const all = Array.from({length:25}, (_,i)=>i);
  const crosses = mines;
  const crossPos = pick(all, crosses).sort((a,b)=>a-b);
  const grid = Array(25).fill(1);
  crossPos.forEach(i => grid[i] = 2);
  const steps = pick(all.filter(i => grid[i] === 1), starsFor(mines));
  return { ok:true, mines, mode, stars: starsFor(mines), grid, steps, ts: Date.now() };
}

function saveHistory(items){ localStorage.setItem("rm_history_gallery", JSON.stringify(items.slice(0,20))); }
function loadHistory(){ try{return JSON.parse(localStorage.getItem("rm_history_gallery")||"[]")}catch{return []} }
function pushHistory(item){ historyItems.unshift(item); historyItems = historyItems.slice(0,20); saveHistory(historyItems); }

function renderHistoryView(){
  if (!historyItems.length){
    historyMeta.textContent = "—";
    historyPreviewBoard.innerHTML = "";
    historyCounter.textContent = "0 / 0";
    historyPrev.disabled = true;
    historyNext.disabled = true;
    latestBadge.style.visibility = "hidden";
    return;
  }
  historyIndex = Math.max(0, Math.min(historyIndex, historyItems.length - 1));
  const item = historyItems[historyIndex];
  const dt = new Date(item.ts);
  historyMeta.textContent = `${item.mode === 'single' ? t('single') : t('all')} • ${item.mines} ${t('mines').toLowerCase()} • ${dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  historyCounter.textContent = `${historyIndex + 1} / ${historyItems.length}`;
  latestBadge.style.visibility = historyIndex === 0 ? 'visible' : 'hidden';
  historyPrev.disabled = historyIndex >= historyItems.length - 1;
  historyNext.disabled = historyIndex <= 0;
  historyPreviewBoard.innerHTML = item.grid.map(type => `
    <div class="pCell ${type === 1 ? 'star' : 'trap'}">
      <img src="${type === 1 ? '/assets/icons/star.svg' : '/assets/icons/trap.svg'}" alt="">
    </div>`).join("");
}

function openHistory(){
  historyItems = loadHistory();
  historyIndex = 0;
  renderHistoryView();
  historyOverlay.hidden = false;
}
function closeHistory(){ historyOverlay.hidden = true; }

function animateSingle(result){
  let i = 0;
  const order = result.steps;
  const tick = () => {
    if (i >= order.length){
      btnPlay.disabled = false;
      btnPlay.textContent = t('play');
      return;
    }
    revealCell(order[i], 1);
    i += 1;
    setTimeout(tick, 520);
  };
  setTimeout(tick, 200);
}

function animateAll(result){
  const order = Array.from({length:25}, (_,i)=>i);
  order.forEach((idx, i) => {
    setTimeout(() => revealCell(idx, result.grid[idx]), 160 + i * 105);
  });
  setTimeout(() => {
    btnPlay.disabled = false;
    btnPlay.textContent = t('play');
  }, 200 + order.length * 105);
}

async function play(){
  btnPlay.disabled = true;
  btnPlay.textContent = t('generating');
  buildBoard();
  const result = generateResult(selectedMines, selectedMode);
  pushHistory(result);
  if (selectedMode === 'single') animateSingle(result);
  else animateAll(result);
}

function init(){
  try{ tg?.ready(); tg?.expand(); }catch{}
  bindLang("homeLangBtn", "homeLangMenu");
  bindLang("minesLangBtn", "minesLangMenu");
  setLang(currentLang);
  buildBoard();
  setMines(1);
  setMode('single');

  document.querySelector('.activeGame').addEventListener('click', () => openPage('mines'));
  backFromMines.addEventListener('click', () => openPage('home'));
  btnHistoryHead.addEventListener('click', openHistory);
  btnCloseHistory.addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', (e) => { if (e.target === historyOverlay) closeHistory(); });
  historyPrev.addEventListener('click', () => { if (historyIndex < historyItems.length - 1){ historyIndex += 1; renderHistoryView(); } });
  historyNext.addEventListener('click', () => { if (historyIndex > 0){ historyIndex -= 1; renderHistoryView(); } });
  document.addEventListener('keydown', (e) => {
    if (historyOverlay.hidden) return;
    if (e.key === 'Escape') closeHistory();
    if (e.key === 'ArrowLeft' && historyIndex < historyItems.length - 1){ historyIndex += 1; renderHistoryView(); }
    if (e.key === 'ArrowRight' && historyIndex > 0){ historyIndex -= 1; renderHistoryView(); }
  });

  minesSlider.querySelectorAll('[data-mines]').forEach(btn => btn.addEventListener('click', () => setMines(btn.dataset.mines)));
  modeSlider.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  btnPlay.addEventListener('click', play);

  if (location.hash === '#mines') openPage('mines');
}

init();
