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
const toast = $("toast");

let selectedMines = 1;
let selectedMode = "single";
let historyItems = loadHistory();
let historyIndex = 0;
let currentLang = pickInitialLang();
let meState = null;
let meLoaded = false;

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
    history: "History",
    mines: "Mines",
    mode: "Mode",
    single: "Single",
    all: "All",
    play: "Play",
    generating: "Генерация...",
    loading: "Проверка доступа...",
    noTelegram: "Откройте приложение из Telegram.",
    noAccess: "Доступ к WebApp пока не открыт.",
    badRequest: "Не удалось получить сигнал.",
    accessDenied: "Доступ закрыт. Сначала завершите регистрацию и депозит.",
    serverError: "Ошибка сервера. Попробуйте ещё раз.",
    back: "Back",
    latest: "LATEST",
    prev: "← Prev",
    next: "Next →"
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

function showToast(text){
  if (!toast) return;
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 2800);
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
  thumb.style.width = `calc(${pct}% - ${((total - 1) * 6) / total}px)`;
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
  for (let i = 0; i < 25; i++){
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
  cell.querySelectorAll(".iconMark").forEach(n => n.remove());
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

function saveHistory(items){ localStorage.setItem("rm_history_gallery", JSON.stringify(items.slice(0,20))); }
function loadHistory(){ try { return JSON.parse(localStorage.getItem("rm_history_gallery") || "[]"); } catch { return []; } }
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
  historyMeta.textContent = `${item.mode === "single" ? t("single") : t("all")} • ${item.mines} ${t("mines").toLowerCase()} • ${dt.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}`;
  historyCounter.textContent = `${historyIndex + 1} / ${historyItems.length}`;
  latestBadge.style.visibility = historyIndex === 0 ? "visible" : "hidden";
  historyPrev.disabled = historyIndex >= historyItems.length - 1;
  historyNext.disabled = historyIndex <= 0;
  historyPreviewBoard.innerHTML = item.grid.map(type => `
    <div class="pCell ${type === 1 ? "star" : "trap"}">
      <img src="${type === 1 ? "/assets/icons/star.svg" : "/assets/icons/trap.svg"}" alt="">
    </div>`).join("");
}

function openHistory(){
  historyItems = loadHistory();
  historyIndex = 0;
  renderHistoryView();
  historyOverlay.hidden = false;
}

function closeHistory(){
  historyOverlay.hidden = true;
}

function animateSingle(result){
  let i = 0;
  const order = result.steps;
  const tick = () => {
    if (i >= order.length){
      btnPlay.disabled = false;
      btnPlay.textContent = t("play");
      return;
    }
    revealCell(order[i], 1);
    i += 1;
    setTimeout(tick, 520);
  };
  setTimeout(tick, 200);
}

function animateAll(result){
  const order = Array.from({ length: 25 }, (_, i) => i);
  order.forEach((idx, i) => {
    setTimeout(() => revealCell(idx, result.grid[idx]), 160 + i * 105);
  });
  setTimeout(() => {
    btnPlay.disabled = false;
    btnPlay.textContent = t("play");
  }, 200 + order.length * 105);
}

async function postJson(url, payload){
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function loadMe(){
  if (!tg?.initData) {
    meLoaded = true;
    meState = { access: false };
    btnPlay.disabled = true;
    btnPlay.textContent = t("play");
    showToast(t("noTelegram"));
    return;
  }

  btnPlay.disabled = true;
  btnPlay.textContent = t("loading");

  const result = await postJson("/api/me", { initData: tg.initData });
  meLoaded = true;

  if (!result.ok){
    meState = { access: false };
    btnPlay.disabled = true;
    btnPlay.textContent = t("play");
    showToast(t("serverError"));
    return;
  }

  meState = result.data;
  if (meState?.lang && meState.lang !== currentLang) {
    setLang(meState.lang);
  }
  btnPlay.disabled = false;
  btnPlay.textContent = t("play");

  if (!meState.access){
    showToast(t("noAccess"));
  }
}

async function requestSignal(){
  if (!tg?.initData) {
    return { ok: false, status: 400, data: { error: "no initData" } };
  }
  return postJson("/api/signal", {
    initData: tg.initData,
    mines: selectedMines,
    mode: selectedMode
  });
}

async function play(){
  if (!meLoaded) {
    await loadMe();
  }

  if (!tg?.initData) {
    showToast(t("noTelegram"));
    return;
  }

  if (!meState?.access) {
    showToast(t("accessDenied"));
    return;
  }

  btnPlay.disabled = true;
  btnPlay.textContent = t("generating");
  buildBoard();

  const result = await requestSignal();

  if (!result.ok){
    btnPlay.disabled = false;
    btnPlay.textContent = t("play");

    if (result.status === 403) {
      meState = { ...(meState || {}), access: false };
      showToast(t("accessDenied"));
      return;
    }

    showToast(t("badRequest"));
    return;
  }

  const signal = result.data;
  pushHistory(signal);

  if (selectedMode === "single") animateSingle(signal);
  else animateAll(signal);
}

function init(){
  try {
    tg?.ready();
    tg?.expand();
  } catch {}

  bindLang("homeLangBtn", "homeLangMenu");
  bindLang("minesLangBtn", "minesLangMenu");
  setLang(currentLang);
  buildBoard();
  setMines(1);
  setMode("single");

  document.querySelector(".activeGame").addEventListener("click", () => openPage("mines"));
  backFromMines.addEventListener("click", () => openPage("home"));
  btnHistoryHead.addEventListener("click", openHistory);
  btnCloseHistory.addEventListener("click", closeHistory);
  historyOverlay.addEventListener("click", (e) => { if (e.target === historyOverlay) closeHistory(); });
  historyPrev.addEventListener("click", () => { if (historyIndex < historyItems.length - 1){ historyIndex += 1; renderHistoryView(); } });
  historyNext.addEventListener("click", () => { if (historyIndex > 0){ historyIndex -= 1; renderHistoryView(); } });
  document.addEventListener("keydown", (e) => {
    if (historyOverlay.hidden) return;
    if (e.key === "Escape") closeHistory();
    if (e.key === "ArrowLeft" && historyIndex < historyItems.length - 1){ historyIndex += 1; renderHistoryView(); }
    if (e.key === "ArrowRight" && historyIndex > 0){ historyIndex -= 1; renderHistoryView(); }
  });

  minesSlider.querySelectorAll("[data-mines]").forEach(btn => btn.addEventListener("click", () => setMines(btn.dataset.mines)));
  modeSlider.querySelectorAll("[data-mode]").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  btnPlay.addEventListener("click", play);

  if (location.hash === "#mines") openPage("mines");
  loadMe();
}

init();
