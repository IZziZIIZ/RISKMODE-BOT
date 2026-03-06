# Mines Premium Bot (Telegram + WebApp)

Это минимальный рабочий проект:
- Telegram-бот (меню + персональная ссылка регистрации)
- Сервер (редирект /go, постбек /pb, API для WebApp)
- WebApp (premium UI для Mines)

## Быстрый старт (Windows)
1) Установи Node.js LTS (18+).
2) Скачай проект, открой папку в терминале.
3) Выполни:
   - `npm install`
   - скопируй `.env.example` -> `.env` и заполни 3 поля: BOT_TOKEN, BASE_URL, ONEWIN_LINK
4) Запусти сервер:
   - `npm run start`
5) В отдельном окне терминала запусти бота:
   - `npm run bot`

## Тест без 1win (симуляция постбека)
1) Напиши боту `/start`, чтобы бот мог тебе писать.
2) Узнай свой tg_id:
   - открой WebApp через кнопку "🎮 Открыть Mines"
   - вверху экрана увидишь строку `TG: ...`
3) В браузере открой:
   - Регистрация: `BASE_URL/pb?event=reg&sub1=ТВОЙ_TG_ID`
   - Депозит:     `BASE_URL/pb?event=ftd&sub1=ТВОЙ_TG_ID&amount=100`

После депозита WebApp откроется.

## Подключение 1win (схема)
- Бот даёт ссылку: `BASE_URL/go?tg=<tg_id>`
- Сервер делает редирект на `ONEWIN_LINK + &sub1=<tg_id>`
- В кабинете партнёрки в Postback URL на события REG и FTD указываешь:
  - `BASE_URL/pb?event=reg&sub1={sub1}&user_id={user_id}`
  - `BASE_URL/pb?event=ftd&sub1={sub1}&amount={amount}&user_id={user_id}`

Если в твоём кабинете макрос `{sub1}` называется иначе — нужно подставить тот, который возвращает click id.
