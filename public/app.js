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
  ru: { history: "History", mines: "Mines", mode: "Mode", single: "Single", all: "All", play: "Play", generating: "Генерация...", back: "Back", latest: "LATEST", prev: "← Prev", next: "Next →" },
  en: { history: "History", mines: "Mines", mode: "Mode", single: "Single", all: "All", play: "Play", generating: "Generating...", back: "Back", latest: "LATEST", prev: "← Prev", next: "Next →" },
  tr: { history: "Geçmiş", mines: "Mayın", mode: "Mod", single: "Tek", all: "Tümü", play: "Oyna", generating: "Oluşturuluyor...", back: "Geri", latest: "SON", prev: "← Önceki", next: "Sonraki →" },
  es: { history: "Historial", mines: "Minas", mode: "Modo", single: "Único", all: "Todo", play: "Jugar", generating: "Generando...", back: "Atrás", latest: "ÚLTIMO", prev: "← Anterior", next: "Siguiente →" },
  "pt": { history: "Histórico", mines: "Minas", mode: "Modo", single: "Único", all: "Todos", play: "Jogar", generating: "Gerando...", back: "Voltar", latest: "ÚLTIMO", prev: "← Anterior", next: "Próximo →" },
  "pt-br": { history: "Histórico", mines: "Minas", mode: "Modo", single: "Único", all: "Todos", play: "Jogar", generating: "Gerando...", back: "Voltar", latest: "ÚLTIMO", prev: "← Anterior", next: "Próximo →" },
  ar: { history: "Historial", mines: "Minas", mode: "Modo", single: "Único", all: "Todo", play: "Jugar", generating: "Generando...", back: "Atrás", latest: "ÚLTIMO", prev: "← Anterior", next: "Siguiente →" },
  sa: { history: "السجل", mines: "الألغام", mode: "الوضع", single: "فردي", all: "الكل", play: "ابدأ", generating: "جارٍ الإنشاء...", back: "رجوع", latest: "الأحدث", prev: "← السابق", next: "التالي →" },
  it: { history: "Cronologia", mines: "Mine", mode: "Modalità", single: "Singolo", all: "Tutto", play: "Gioca", generating: "Generazione...", back: "Indietro", latest: "ULTIMO", prev: "← Precedente", next: "Successivo →" },
  hi: { history: "इतिहास", mines: "माइन्स", mode: "मोड", single: "सिंगल", all: "ऑल", play: "Play", generating: "बनाया जा रहा है...", back: "वापस", latest: "लेटेस्ट", prev: "← पिछला", next: "अगला →" },
  uk: { history: "Історія", mines: "Міни", mode: "Режим", single: "Один", all: "Усі", play: "Грати", generating: "Генерація...", back: "Назад", latest: "ОСТАННІЙ", prev: "← Попередній", next: "Наступний →" },
  kz: { history: "Тарих", mines: "Миналар", mode: "Режим", single: "Single", all: "All", play: "Ойнату", generating: "Жасалуда...", back: "Артқа", latest: "СОҢҒЫ", prev: "← Алдыңғы", next: "Келесі →" },
  uz: { history: "Tarix", mines: "Minalar", mode: "Rejim", single: "Single", all: "All", play: "O‘ynash", generating: "Yaratilmoqda...", back: "Orqaga", latest: "SO‘NGGI", prev: "← Oldingi", next: "Keyingi →" },
  az: { history: "Tarixçə", mines: "Minalar", mode: "Rejim", single: "Single", all: "All", play: "Oyna", generating: "Yaradılır...", back: "Geri", latest: "SON", prev: "← Əvvəlki", next: "Növbəti →" },
  hy: { history: "Պատմություն", mines: "Մայնս", mode: "Ռեժիմ", single: "Single", all: "All", play: "Play", generating: "Ստեղծվում է...", back: "Back", latest: "ՎԵՐՋԻՆ", prev: "← Նախորդ", next: "Հաջորդ →" }
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
