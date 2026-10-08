/* Тилво — лендинг. Без зависимостей, без трекеров, без cookies. */
(function () {
  'use strict';

  var CHAT_URL = 'https://chat.tilvo.ru';

  /* ========================================================================
     БЕТА-ТЕСТ — блок входа. Код на сайте не выдаётся: его дают блогеры
     и объявления, а без кода — по заявке (почта и телефон), код присылает команда.
     TODO: seatsLeft — живое число регистраций с сервера.
     applyUrl — FormSubmit: пересылает заявку письмом на tilvo@yandex.ru.
     Первая заявка присылает на почту письмо «Activate Form» — до нажатия кнопки
     в нём заявки не доходят. Без applyUrl заявка никуда не уходит (макет).
     Для просмотра состояний: ?seats=0, ?seats=1.
     ======================================================================== */
  var BETA = {
    seatsTotal: 30,
    seatsLeft: 12,                  // TODO: живое число с сервера
    applyUrl: 'https://formsubmit.co/ajax/tilvo@yandex.ru'
  };

  /* ========================================================================
     ТАРИФЫ — единственный источник данных для карточек в блоке «Нужно ещё больше».
     Запросы, поиск, история, фото и файлы, 15 изображений и проекты «Старта» —
     из финмодели (лист «Юнит экономика и прогноз»). Лимиты беты сверх финмодели:
     изображения «Лёгкого» (в финмодели 0) и глубокие исследования «Лёгкого»
     и «Старта» (в финмодели 0; одно исследование ≈92 ₽, изображение ≈4,6 ₽).
     TODO: подтвердить лимиты беты и внести их в финмодель.
     Официальная цена = цена финмодели ÷ 0,8; бета-тестерам — скидка 20% навсегда,
     и она даёт ровно цену финмодели.
     ======================================================================== */
  var PLANS = {
    currency: '₽',
    period: 'в месяц',
    // Сначала код и вход, тариф выбирают уже в чате: все кнопки ведут к заявке.
    ctaHref: '#invite',
    items: [
      {
        id: 'light',
        name: 'Лёгкий',
        price: 199,
        oldPrice: 249,
        note: 'Если спрашиваете каждый день',
        features: [
          '100 запросов в месяц',
          'Поиск в интернете и история чатов',
          'Анализ фото и документов',
          'Генерация изображений — 10\u00A0в\u00A0месяц',
          'Глубокое исследование — 1\u00A0в\u00A0месяц'
        ],
        cta: 'Выбрать «Лёгкий»',
        featured: true,
        tag: '−20% навсегда'
      },
      {
        id: 'start',
        name: 'Старт',
        price: 490,
        oldPrice: 613,
        note: 'Для работы и больших задач',
        features: [
          '200 запросов в месяц',
          'Поиск в интернете и история чатов',
          'Анализ фото и документов',
          'Генерация изображений — 15\u00A0в\u00A0месяц',
          'Глубокие исследования — 2\u00A0в\u00A0месяц',
          'Проекты — рабочие папки для чатов'
        ],
        cta: 'Выбрать «Старт»',
        featured: false,
        tag: '−20% навсегда'
      }
    ]
  };

  /* ========================================================================
     СЦЕНАРИИ для окна-иллюстрации. Первый должен совпадать со статичной
     разметкой в index.html (она видна без JS).
     ======================================================================== */
  var SCENARIOS = [
    {
      chip: 'Здоровье',
      label: 'пользователь просит объяснить анализ крови, ассистент отвечает простыми словами',
      user: 'Что значит повышенная СОЭ в анализе крови мамы? Объясни простыми словами.',
      answer: 'СОЭ — скорость, с которой оседают клетки крови. Если она выше нормы, чаще всего в организме идёт воспаление: например, после простуды. С возрастом СОЭ тоже немного растёт.\n\nПо одной цифре диагноз не ставят. Покажите анализ терапевту — он сравнит его с другими показателями и самочувствием мамы.'
    },
    {
      chip: 'Покупки',
      label: 'пользователь просит сравнить предложения по окнам, ассистент подсказывает, о чём спросить',
      user: 'Сравни три предложения по окнам: 38, 42 и 51 тысяча. О чём спросить замерщика?',
      answer: 'Разница в цене обычно в профиле, стеклопакете и монтаже.\n\nСпросите замерщика: сколько камер в профиле, входят ли в цену откосы, подоконник и вывоз мусора, какая гарантия на монтаж.\n\nЕсли за 51 тысячу всё это включено, а за 38 — нет, дешёвый вариант выйдет дороже.'
    },
    {
      chip: 'Фото',
      label: 'пользователь присылает фото инструкции, ассистент коротко объясняет её по-русски',
      user: 'Что написано в этой инструкции? Коротко и по-русски.',
      attach: { kind: 'file', text: 'инструкция-стиралки.jpg' },
      answer: 'Это режим «Деликатная стирка» для шерсти и шёлка.\n\nСтавьте 30\u00A0°C и отжим не выше 600 оборотов. Порошок — для деликатных тканей, не больше одной мерной ложки.\n\nПосле стирки вещи не выкручивайте: разложите сушиться на ровной поверхности.'
    },
    {
      chip: 'Письмо',
      label: 'пользователь просит составить письмо клиенту, ассистент печатает готовый текст',
      user: 'Напиши вежливое письмо клиенту: поставка задержится на три дня.',
      answer: 'Здравствуйте, Анна!\n\nК сожалению, поставка задержится на три дня — привезём заказ в пятницу, 14 марта. Приносим извинения за неудобство.\n\nДоставку в этот раз возьмём на себя. Если новая дата не подходит — напишите, подберём другой день.'
    }
  ];

  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');

  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- Тарифы ---------- */
  function renderPlans() {
    var list = document.getElementById('plans');
    if (!list) return;
    var fmt = new Intl.NumberFormat('ru-RU');

    PLANS.items.forEach(function (plan) {
      var item = el('li', 'plan' + (plan.featured ? ' is-featured' : ''));

      var head = el('div', 'plan-head');
      head.appendChild(el('h3', '', plan.name));
      if (plan.tag) head.appendChild(el('span', 'badge plan-tag', plan.tag));
      item.appendChild(head);

      item.appendChild(el('p', 'plan-note', plan.note));

      var price = el('p', 'plan-price');
      if (plan.oldPrice) {
        var old = el('s', 'plan-old', fmt.format(plan.oldPrice) + '\u00A0' + PLANS.currency);
        old.setAttribute('aria-label', 'Официальная цена: ' + fmt.format(plan.oldPrice) + ' рублей');
        price.appendChild(old);
      }
      price.appendChild(el('span', 'plan-amount', fmt.format(plan.price) + '\u00A0' + PLANS.currency));
      price.appendChild(el('span', 'plan-period', PLANS.period));
      item.appendChild(price);

      var features = el('ul', 'plan-features');
      plan.features.forEach(function (f) { features.appendChild(el('li', '', f)); });
      item.appendChild(features);

      var cta = el('a', 'btn ' + (plan.featured ? 'btn-primary' : 'btn-outline'), plan.cta);
      cta.href = PLANS.ctaHref;
      cta.setAttribute('data-action', 'apply');
      item.appendChild(cta);

      list.appendChild(item);
    });
  }

  /* ---------- theme-color из палитры ---------- */
  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', cssVar('--bg'));
  }

  /* ========================================================================
     Иллюстрация: один общий цикл requestAnimationFrame на контуры и диалог.
     Цикл останавливается, когда иллюстрация вне экрана, вкладка скрыта,
     пользователь нажал «паузу» или включено prefers-reduced-motion.
     ======================================================================== */
  function initHeroVisual() {
    var host = document.getElementById('demo');
    if (!host) return;

    var canvas = host.querySelector('.contours');
    var win = document.getElementById('demo-window');
    var body = host.querySelector('.demo-body');
    var userMsg = host.querySelector('.msg-user');
    var botMsg = host.querySelector('.msg-bot');
    var userText = host.querySelector('[data-demo="user-text"]');
    var attach = host.querySelector('[data-demo="attach"]');
    var typedEl = host.querySelector('[data-demo="typed"]');
    var restEl = host.querySelector('[data-demo="rest"]');
    var controls = host.querySelector('.demo-controls');
    var chipsBox = host.querySelector('.demo-chips');
    var pauseBtn = host.querySelector('.demo-pause');

    var ctx = canvas.getContext ? canvas.getContext('2d') : null;

    var inView = true;
    var userPaused = false;
    var rafId = 0;
    var lastNow = 0;

    /* ----- контуры ----- */
    var LINES = 17;
    var FRAME_MS = 1000 / 30;      // контурам хватает 30 кадров/с
    var cw = 0, ch = 0;
    var flowTime = 40;             // «время» поля, секунды
    var sinceDraw = FRAME_MS;
    var palette = null;

    function readPalette() {
      palette = {
        accent: cssVar('--accent'),
        muted: cssVar('--muted'),
        highlight: cssVar('--highlight')
      };
    }

    function resizeCanvas() {
      if (!ctx) return;
      var rect = canvas.getBoundingClientRect();
      cw = rect.width;
      ch = rect.height;
      // не больше ~1.8 Мп в буфере холста — тонким линиям этого достаточно
      var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1.8e6 / Math.max(1, cw * ch)));
      dpr = Math.max(dpr, 0.75);
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawContours() {
      if (!ctx || !cw || !ch) return;
      var t = flowTime;
      var amp = Math.min(ch * 0.05, 40);
      var step = 8;
      ctx.clearRect(0, 0, cw, ch);
      ctx.lineWidth = 1.25;
      ctx.lineJoin = 'round';

      for (var i = 0; i < LINES; i++) {
        var k = i / (LINES - 1);
        var baseY = ch * (0.05 + 0.9 * k);
        var edgeFade = Math.pow(Math.sin(Math.PI * k), 0.7);   // к верху и низу линии тают
        var color, alpha;
        if (i % 6 === 3) { color = palette.highlight; alpha = 0.9; }
        else if (i % 2 === 0) { color = palette.accent; alpha = 0.5; }
        else { color = palette.muted; alpha = 0.34; }

        ctx.globalAlpha = alpha * edgeFade;
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (var x = -step; x <= cw + step; x += step) {
          var y = baseY + amp * (
            0.95 * Math.sin(x * 0.0058 + t * 0.11 + i * 0.19) +
            0.40 * Math.sin(x * 0.0127 - t * 0.075 + i * 0.12) +
            0.70 * Math.sin(x * 0.0026 + t * 0.045 - i * 0.04)
          );
          if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    /* ----- диалог ----- */
    var current = 0;
    var phase = 'enter';
    var phaseTime = 0;
    var typedCount = 0;
    var typeBudget = 0;
    var costs = [];                 // «стоимость» каждого символа: после знаков препинания — пауза

    var T_ENTER = 650, T_THINK = 1100, T_HOLD = 3600, T_LEAVE = 380;
    var CHARS_PER_MS = 0.05;        // ≈ 50 символов в секунду

    function buildCosts(text) {
      var out = new Array(text.length);
      for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        out[i] = (c === '.' || c === '!' || c === '?' || c === ':') ? 7 : (c === ',' || c === '—') ? 3.5 : (c === '\n') ? 4 : 1;
      }
      return out;
    }

    function setTyped(n) {
      var answer = SCENARIOS[current].answer;
      typedCount = n;
      typedEl.textContent = answer.slice(0, n);
      restEl.textContent = answer.slice(n);
    }

    function fillScenario(index) {
      var s = SCENARIOS[index];
      current = index;
      userText.textContent = s.user;
      if (s.attach) {
        attach.hidden = false;
        attach.textContent = s.attach.text;
        attach.className = 'attach' + (s.attach.kind === 'code' ? ' is-code' : '');
      } else {
        attach.hidden = true;
        attach.textContent = '';
      }
      win.setAttribute('aria-label', 'Пример диалога в Тилво: ' + s.label + '.');
      costs = buildCosts(s.answer);
      var chips = chipsBox.children;
      for (var i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed', i === index ? 'true' : 'false');
      }
    }

    function setBotState(state) {   // '', 'is-thinking', 'is-typing', 'is-done'
      botMsg.classList.remove('is-thinking', 'is-typing', 'is-done');
      if (state) botMsg.classList.add(state);
    }

    function showStatic(index) {    // готовый кадр без анимации
      body.classList.remove('is-leaving');
      fillScenario(index);
      setTyped(SCENARIOS[index].answer.length);
      userMsg.classList.add('is-in');
      botMsg.classList.add('is-in');
      setBotState('is-done');
      phase = 'hold';
      phaseTime = 0;
    }

    function startScenario(index) {
      body.classList.remove('is-leaving');
      fillScenario(index);
      setTyped(0);
      userMsg.classList.remove('is-in');
      botMsg.classList.remove('is-in');
      setBotState('');
      phase = 'enter';
      phaseTime = 0;
      typeBudget = 0;
      // следующий кадр — чтобы сработал CSS-переход появления
      requestAnimationFrame(function () { userMsg.classList.add('is-in'); });
    }

    function stepDemo(dt) {
      phaseTime += dt;
      var answer = SCENARIOS[current].answer;

      if (phase === 'enter' && phaseTime >= T_ENTER) {
        phase = 'think'; phaseTime = 0;
        botMsg.classList.add('is-in');
        setBotState('is-thinking');
      } else if (phase === 'think' && phaseTime >= T_THINK) {
        phase = 'type'; phaseTime = 0; typeBudget = 0;
        setBotState('is-typing');
      } else if (phase === 'type') {
        typeBudget += dt * CHARS_PER_MS;
        var n = typedCount;
        while (n < answer.length && typeBudget >= costs[n]) { typeBudget -= costs[n]; n++; }
        if (n !== typedCount) setTyped(n);
        if (n >= answer.length) { phase = 'hold'; phaseTime = 0; setBotState('is-done'); }
      } else if (phase === 'hold' && phaseTime >= T_HOLD) {
        phase = 'leave'; phaseTime = 0;
        body.classList.add('is-leaving');
      } else if (phase === 'leave' && phaseTime >= T_LEAVE) {
        startScenario((current + 1) % SCENARIOS.length);
      }
    }

    /* Высота окна фиксируется по самому длинному сценарию — вёрстка не прыгает. */
    function measureBody() {
      var keep = { index: current, typed: typedCount };
      var max = 0;
      body.style.minHeight = '';
      for (var i = 0; i < SCENARIOS.length; i++) {
        fillScenario(i);
        setTyped(SCENARIOS[i].answer.length);
        max = Math.max(max, body.offsetHeight);
      }
      body.style.minHeight = Math.ceil(max) + 'px';
      fillScenario(keep.index);
      setTyped(Math.min(keep.typed, SCENARIOS[keep.index].answer.length));
    }

    /* ----- общий цикл ----- */
    function shouldRun() {
      return inView && !document.hidden && !userPaused && !mqReduce.matches;
    }

    function frame(now) {
      rafId = 0;
      if (!shouldRun()) return;
      var dt = Math.min(now - lastNow, 100);   // после паузы не «перематываем»
      lastNow = now;

      stepDemo(dt);

      flowTime += dt / 1000;
      sinceDraw += dt;
      if (sinceDraw >= FRAME_MS) { sinceDraw = 0; drawContours(); }

      rafId = requestAnimationFrame(frame);
    }

    function kick() {
      host.classList.toggle('is-paused', !shouldRun());
      if (rafId || !shouldRun()) return;
      lastNow = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    /* ----- управление ----- */
    SCENARIOS.forEach(function (s, i) {
      var chip = el('button', 'chip', s.chip);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      chip.addEventListener('click', function () {
        if (mqReduce.matches || userPaused) showStatic(i);
        else { startScenario(i); kick(); }
      });
      chipsBox.appendChild(chip);
    });

    function syncPauseButton() {
      pauseBtn.hidden = mqReduce.matches;
      pauseBtn.classList.toggle('is-paused', userPaused);
      pauseBtn.setAttribute('aria-label', userPaused ? 'Запустить анимацию' : 'Остановить анимацию');
    }

    pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      syncPauseButton();
      kick();
    });

    function applyMotionPreference() {
      syncPauseButton();
      if (mqReduce.matches) {
        host.classList.remove('is-live');
        showStatic(current);
        drawContours();
      } else {
        host.classList.add('is-live');
        startScenario(current);
      }
      kick();
    }

    /* ----- запуск ----- */
    controls.hidden = false;
    readPalette();
    resizeCanvas();
    measureBody();
    resizeCanvas();                 // высота блока могла измениться после измерения
    applyMotionPreference();
    drawContours();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        kick();
      }, { rootMargin: '80px' }).observe(host);
    }

    document.addEventListener('visibilitychange', kick);
    onMediaChange(mqReduce, applyMotionPreference);
    onMediaChange(mqDark, function () {
      readPalette();
      syncThemeColor();
      drawContours();
    });

    var resizeTimer = 0;
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          measureBody();
        }
        resizeCanvas();
        drawContours();
      }, 150);
    });

    // После загрузки веб-шрифтов метрики текста меняются — перемеряем.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        measureBody();
        resizeCanvas();
        drawContours();
      });
    }
  }

  /* ========================================================================
     Блок входа: состояния start / apply / sent / have / full и счётчик мест.
     ======================================================================== */
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  // TODO: форма входа на chat.tilvo.ru должна принять код из ссылки и показать его в поле
  function loginHref(code, provider) {
    return CHAT_URL + '/?invite=' + encodeURIComponent(code) + '&provider=' + provider;
  }

  function initInvite() {
    var box = document.getElementById('invite');
    if (!box) return;

    var states = box.querySelectorAll('.invite-state');
    var live = box.querySelector('[data-live]');
    var form = box.querySelector('.invite-form');
    var error = form.querySelector('.invite-error');
    var submit = form.querySelector('[type="submit"]');
    var sentEmail = box.querySelector('[data-sent-email]');
    var input = document.getElementById('invite-input');
    var hint = document.getElementById('invite-hint');
    var links = box.querySelectorAll('[data-state="have"] [data-provider]');

    var seatsParam = parseInt(new URLSearchParams(window.location.search).get('seats'), 10);
    var seatsLeft = isNaN(seatsParam) ? BETA.seatsLeft : Math.max(0, Math.min(BETA.seatsTotal, seatsParam));
    var isFull = seatsLeft === 0;

    function show(name) {
      for (var i = 0; i < states.length; i++) {
        states[i].hidden = states[i].getAttribute('data-state') !== name;
      }
    }

    function setLinks(code) {
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (code) {
          a.href = loginHref(code, a.getAttribute('data-provider'));
          a.classList.remove('is-disabled');
          a.removeAttribute('aria-disabled');
        } else {
          a.removeAttribute('href');
          a.classList.add('is-disabled');
          a.setAttribute('aria-disabled', 'true');
        }
      }
    }

    function renderSeats() {
      var left = document.querySelectorAll('[data-seats-left]');
      for (var i = 0; i < left.length; i++) left[i].textContent = String(seatsLeft);
      var word = document.querySelector('[data-seats-word]');
      if (word) word.textContent = plural(seatsLeft, 'место', 'места', 'мест');
      if (!isFull) return;

      var pill = document.querySelector('[data-seats-pill]');
      if (pill) pill.textContent = 'Набор закрыт · все ' + BETA.seatsTotal + '\u00A0мест заняты';
      var cta = document.querySelector('[data-seats-cta]');
      if (cta) cta.textContent = 'Все ' + BETA.seatsTotal + '\u00A0мест заняты';
      var ctaLead = document.querySelector('[data-seats-cta-lead]');
      if (ctaLead) ctaLead.textContent = 'После беты Тилво откроется для всех — загляните сюда позже.';
      var hide = document.querySelectorAll('[data-hide-when-full]');
      for (var j = 0; j < hide.length; j++) hide[j].hidden = true;
    }

    function openApply(target) {
      show(isFull ? 'full' : 'apply');
      if (!box.contains(target)) box.scrollIntoView({ block: 'center' });
      if (!isFull) form.elements.email.focus({ preventScroll: true });
    }

    function findProblem() {
      var email = form.elements.email;
      var phone = form.elements.phone;
      var digits = phone.value.replace(/\D/g, '');
      if (!email.value.trim() || !email.checkValidity()) {
        return { field: email, text: 'Проверьте почту: нужен адрес вида name@mail.ru.' };
      }
      if (digits.length < 10 || digits.length > 15) {
        return { field: phone, text: 'Проверьте телефон: нужен номер с кодом, например +7 900 000-00-00.' };
      }
      if (!form.elements.consent.checked) {
        return { field: form.elements.consent, text: 'Отметьте согласие на обработку данных — без него не сможем прислать код.' };
      }
      return null;
    }

    function setError(problem) {
      error.textContent = problem ? problem.text : '';
      error.hidden = !problem;
      form.elements.email.classList.toggle('is-invalid', !!problem && problem.field === form.elements.email);
      form.elements.phone.classList.toggle('is-invalid', !!problem && problem.field === form.elements.phone);
    }

    function showSent(email) {
      sentEmail.textContent = email;
      show('sent');
      live.textContent = 'Заявка отправлена. Код пришлём на ' + email + '.';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var problem = findProblem();
      setError(problem);
      if (problem) { problem.field.focus(); return; }

      var email = form.elements.email.value.trim();
      if (!BETA.applyUrl) { showSent(email); return; }   // макет: адреса приёма заявок ещё нет

      submit.disabled = true;
      fetch(BETA.applyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email,
          phone: form.elements.phone.value.trim(),
          source: window.location.search || 'без меток',   // utm-метки: какой блогер или объявление привёл
          _subject: 'Заявка на бета-тест Тилво',
          _template: 'table'
        })
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      }).then(function (data) {
        if (String(data.success) !== 'true') throw new Error(data.message || 'not sent');
        showSent(email);
      }).catch(function () {
        setError({ field: submit, text: 'Не получилось отправить заявку. Попробуйте ещё раз или напишите нам в Max: +7\u00A0916\u00A0611-30-50.' });
      }).then(function () {
        submit.disabled = false;
      });
    });

    document.addEventListener('click', function (event) {
      var target = event.target.closest ? event.target.closest('[data-action]') : null;
      if (!target) return;
      var action = target.getAttribute('data-action');

      if (action === 'apply') {
        event.preventDefault();
        openApply(target);
      } else if (action === 'have') {
        show('have');
        input.focus();
      }
    });

    input.addEventListener('input', function () {
      var code = input.value.trim();
      setLinks(code);
      hint.hidden = !!code;
    });

    renderSeats();
    if (isFull) show('full');
  }

  /* ---------- Слайдеры карточек на телефоне ---------- */
  function initSliders() {
    var mqPhone = window.matchMedia('(max-width: 720px)');
    var sliders = document.querySelectorAll('[data-slider]');

    Array.prototype.forEach.call(sliders, function (slider) {
      var items = slider.children;
      var ui = el('div', 'slider-ui');
      ui.setAttribute('aria-hidden', 'true');
      var hint = el('span', 'slider-hint', 'Листайте');
      hint.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 20 20" width="18" height="18" focusable="false"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>');
      var dots = el('span', 'slider-dots');
      for (var i = 0; i < items.length; i++) dots.appendChild(el('span', 'slider-dot' + (i === 0 ? ' is-active' : '')));
      ui.appendChild(hint);
      ui.appendChild(dots);
      slider.parentNode.insertBefore(ui, slider.nextSibling);

      var current = 0;
      var nudging = false;

      function update() {
        var step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
        var idx = Math.round(slider.scrollLeft / step);
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4) idx = items.length - 1;
        idx = Math.max(0, Math.min(items.length - 1, idx));
        if (idx === current) return;
        dots.children[current].classList.remove('is-active');
        dots.children[idx].classList.add('is-active');
        current = idx;
      }

      slider.addEventListener('scroll', function () {
        if (!nudging) ui.classList.add('is-touched');
        update();
      }, { passive: true });

      // Подсказка жестом: когда блок впервые на экране, карточки чуть уезжают и возвращаются
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        if (!mqPhone.matches || mqReduce.matches || slider.scrollLeft > 0) return;
        nudging = true;
        slider.style.scrollSnapType = 'none';
        setTimeout(function () {
          slider.scrollTo({ left: 64, behavior: 'smooth' });
          setTimeout(function () {
            slider.scrollTo({ left: 0, behavior: 'smooth' });
            setTimeout(function () {
              slider.style.scrollSnapType = '';
              nudging = false;
            }, 500);
          }, 600);
        }, 350);
      }, { threshold: 0.6 });
      io.observe(slider);
    });
  }

  /* ---------- запуск ---------- */
  renderPlans();
  initInvite();
  initSliders();
  syncThemeColor();
  initHeroVisual();

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

