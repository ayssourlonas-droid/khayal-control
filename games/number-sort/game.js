"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/utils/helpers.ts
  var $ = document.querySelector.bind(document);
  var $$ = document.querySelectorAll.bind(document);
  var $on = (target, type, callback) => target == null ? void 0 : target.addEventListener(type, callback);
  var setHtml = (element, html) => {
    if (element) {
      element.innerHTML = html;
    }
  };
  var generateUUID = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
  var addClass = (target, className = "") => {
    if (target) {
      className.split(" ").forEach((classText) => {
        target.classList.add(classText);
      });
    }
  };
  var removeClass = (target, className = "") => {
    if (target) {
      className.split(" ").forEach((classText) => {
        target.classList.remove(classText);
      });
    }
  };
  var addStyle = (target, styles) => {
    if (target) {
      for (const style in styles) {
        target.style[style] = styles[style];
      }
    }
  };
  var debounce = (fn, delay2) => {
    let t;
    return function() {
      clearTimeout(t);
      t = window.setTimeout(fn, delay2);
    };
  };
  var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var eventButton = (cb) => {
    $$("button:not(.tile)").forEach((button) => {
      $on(button, "click", (e) => {
        cb(e.currentTarget.id);
      });
    });
  };
  var fillArray = (length = 1) => Array.from({ length }, (_, index) => index);
  var isValidJson = (json = "") => {
    try {
      JSON.parse(json);
      return true;
    } catch (_) {
      return false;
    }
  };
  var serializeIntervalNumber = (number = 0) => number <= 9 ? `0${number}` : `${number}`;
  var showIntervalValue = (timer) => `${serializeIntervalNumber(timer.m)}:${serializeIntervalNumber(timer.s)}`;
  var timeToseconds = (timer) => timer.m * 60 + timer.s;

  // src/utils/icons.ts
  var svg = (body, extra = "") => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${body}</svg>`;
  var stroke = `fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  var ICONS = {
    back: svg(`<path d="M15 5l-7 7 7 7" ${stroke}/>`),
    soundOn: svg(
      `<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" ${stroke}/>`
    ),
    soundOff: svg(
      `<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" ${stroke}/>`
    ),
    help: svg(
      `<path d="M9 18h6M10 21h4" ${stroke}/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="currentColor"/>`
    ),
    solve: svg(`<path d="M6 4l8 8-8 8M13 4l8 8-8 8" ${stroke}/>`),
    restart: svg(
      `<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" ${stroke}/><path d="M5 3v4.5h4.5" ${stroke}/>`
    ),
    clock: svg(
      `<circle cx="12" cy="13" r="8" ${stroke}/><path d="M12 9v4l2.5 2.5M9 2.5h6" ${stroke}/>`
    ),
    lock: svg(
      `<rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" ${stroke}/>`
    ),
    info: svg(
      `<path d="M9.2 9a3 3 0 1 1 4.3 2.7c-.9.4-1.5 1.2-1.5 2.2v.6" ${stroke}/><circle cx="12" cy="18.5" r="1.6" fill="currentColor"/>`
    ),
    trophy: svg(
      `<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 20.5h8" ${stroke}/>`
    ),
    robot: svg(
      `<rect x="4.5" y="8" width="15" height="11" rx="3" fill="currentColor"/><path d="M12 4.5V8" ${stroke}/><circle cx="12" cy="3.6" r="1.5" fill="currentColor"/><circle cx="9" cy="13" r="1.6" fill="#fff"/><circle cx="15" cy="13" r="1.6" fill="#fff"/><path d="M2.5 12.5v3M21.5 12.5v3" ${stroke}/>`
    ),
    sad: svg(
      `<circle cx="12" cy="12" r="9" ${stroke}/><circle cx="9" cy="10" r="1.3" fill="currentColor"/><circle cx="15" cy="10" r="1.3" fill="currentColor"/><path d="M8.5 16.5a4.5 4.5 0 0 1 7 0" ${stroke}/>`
    )
  };

  // src/utils/storage.ts
  var CACHE_KEY = "number-sort:progress";
  var saveCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {
    }
  };
  var getDataCache = () => {
    let data = "";
    try {
      data = localStorage.getItem(CACHE_KEY) || "";
    } catch (_) {
      data = "";
    }
    return data !== "" && isValidJson(data) ? JSON.parse(data) : {};
  };
  var savePropierties = (property, value) => {
    const localCache = getDataCache();
    localCache[property] = value;
    saveCache(localCache);
  };
  var getValueFromCache = (key = "", initial) => {
    var _a;
    const localCache = getDataCache();
    return (_a = localCache[key]) != null ? _a : initial;
  };

  // src/utils/sounds.ts
  var zzfx;
  var zzfxV;
  var zzfxX;
  zzfxV = 0.3;
  zzfx = // play sound
  (p = 1, k = 0.05, b = 220, e = 0, r = 0, t = 0.1, q = 0, D = 1, u = 0, y = 0, v = 0, z = 0, l = 0, E = 0, A = 0, F = 0, c = 0, w = 1, m = 0, B = 0, M = Math, R = 44100, d = 2 * M.PI, G = u *= 500 * d / R / R, C = b *= (1 - k + 2 * k * M.random(k = [])) * d / R, g = 0, H = 0, a = 0, n = 1, I = 0, J = 0, f = 0, x, h) => {
    e = R * e + 9;
    m *= R;
    r *= R;
    t *= R;
    c *= R;
    y *= 500 * d / R ** 3;
    A *= d / R;
    v *= d / R;
    z *= R;
    l = R * l | 0;
    for (h = e + m + r + t + c | 0; a < h; k[a++] = f)
      ++J % (100 * F | 0) || (f = q ? 1 < q ? 2 < q ? 3 < q ? M.sin((g % d) ** 3) : M.max(M.min(M.tan(g), 1), -1) : 1 - (2 * g / d % 2 + 2) % 2 : 1 - 4 * M.abs(M.round(g / d) - g / d) : M.sin(g), f = (l ? 1 - B + B * M.sin(d * a / l) : 1) * (0 < f ? 1 : -1) * M.abs(f) ** D * zzfxV * p * (a < e ? a / e : a < e + m ? 1 - (a - e) / m * (1 - w) : a < e + m + r ? w : a < h - c ? (h - a - c) / t * w : 0), f = c ? f / 2 + (c > a ? 0 : (a < h - c ? 1 : (h - a) / c) * k[a - c | 0] / 2) : f), x = (b += u += y) * M.cos(A * H++), g += x - x * E * (1 - 1e9 * (M.sin(a) + 1) % 2), n && ++n > z && (b += v, C += v, n = 0), !l || ++I % l || (b = C, u = G, n || (n = 1));
    p = zzfxX.createBuffer(1, h, R);
    p.getChannelData(0).set(k);
    b = zzfxX.createBufferSource();
    b.buffer = p;
    b.connect(zzfxX.destination);
    b.start();
    return b;
  };
  var getAudio = () => {
    if (!zzfxX) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      zzfxX = new Ctx();
    }
    if (zzfxX.state === "suspended") zzfxX.resume();
    return zzfxX;
  };
  var soundsEnabled = getValueFromCache("sound", true);
  var SOUNDS = {
    gameOver: [, , 20, 0.04, , 0.6, , 1.31, , , -990, 0.06, 0.17, , , 0.04, 0.07],
    shot: [, , 150, 0.05, , 0.05, , 1.3, , , , , , 3],
    click: [, , 537, 0.02, 0.02, 0.22, 1, 1.59, -6.98, 4.97],
    blocked: [, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17]
  };
  var lastSound = { type: "", time: 0 };
  var PlaySound = (type) => {
    const now = performance.now();
    if (lastSound.type === type && now - lastSound.time < 45) return;
    lastSound = { type, time: now };
    if (soundsEnabled && getAudio()) {
      try {
        zzfx(...SOUNDS[type]);
      } catch (_) {
      }
    }
  };
  var isSoundsEnabled = () => soundsEnabled;
  var toogleSounds = (element) => {
    soundsEnabled = !soundsEnabled;
    savePropierties("sound", soundsEnabled);
    setHtml(element, soundsEnabled ? ICONS.soundOn : ICONS.soundOff);
    element.setAttribute("aria-label", soundsEnabled ? "Mute sounds" : "Unmute sounds");
  };

  // src/utils/constants.ts
  var ROOT = "root";
  var CONTAINER = "container";
  var LEVEL_ENABLES_OTHER_LEVELS = 8;
  var TOTAL_LEVELS = 11;
  var NUMBER_HELP_PER_LEVEL = fillArray(
    TOTAL_LEVELS
  ).map((v, i) => ({
    [String(v + 3)]: 5 + i * 5
  })).reduce((a, s) => __spreadValues(__spreadValues({}, a), s), {});

  // src/components/container/index.ts
  var container_default = () => (
    /*html*/
    `<div id="${CONTAINER}" class="wh"></div>`
  );

  // src/utils/resize-screen.ts
  var layout = () => {
    var _a, _b;
    const game = $(".game");
    if (!game) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const landscape = W > H * 1.08;
    game.classList.toggle("land", landscape);
    const size = +(game.dataset.size || 3);
    const margin = Math.max(16, Math.min(W, H) * 0.035);
    let board;
    if (landscape) {
      const zoom = Math.max(1, Math.min(1.45, H / 720));
      const panel = Math.max(190, Math.min(280 * zoom, W * 0.24));
      game.style.setProperty("--pz", `${zoom}`);
      game.style.setProperty("--pw", `${panel / zoom}px`);
      board = Math.min(H - margin * 2, W - panel - margin * 3);
    } else {
      const header = ((_a = $(".game-he")) == null ? void 0 : _a.offsetHeight) || 80;
      const footer = ((_b = $(".game-fo")) == null ? void 0 : _b.offsetHeight) || 100;
      board = Math.min(W - margin * 2, H - header - footer - margin * 2);
    }
    board = Math.max(120, Math.floor(board));
    const tile = board / size;
    const digits = String(size * size - 1).length;
    game.style.setProperty("--bs", `${board}px`);
    game.style.setProperty("--tf", `${tile * Math.min(0.62, 1.15 / digits)}px`);
    game.style.setProperty(
      "--tr",
      `${Math.max(4, Math.min(16, tile * 0.13))}px`
    );
  };
  var resize_screen_default = debounce(layout, 60);

  // src/components/game/components/footer/index.ts
  var buttons = [
    ["help", ICONS.help, "Hint"],
    ["solve", ICONS.solve, "Solve"],
    ["restart", ICONS.restart, "New shuffle"]
  ];
  var footer_default = () => {
    return (
      /*html*/
      `<div class="game-fo jc"><button id="start" class="button">Start</button><div class="game-fo-o jc">${buttons.map(([id, icon, title]) => {
        return `<div class="game-fo-c"><button class="game-fo-b jc" id="${id}" title="${title}" aria-label="${title}">${icon}${id === "help" ? `<span class="jc"></span>` : ""}</button><div class="game-fo-l">${title}</div></div>`;
      }).join("")}</div></div>`
    );
  };

  // src/components/game/components/grid/index.ts
  var grid_default = () => (
    /*html*/
    `<div class="grid"></div>`
  );

  // src/components/sound/index.ts
  var sound_default = () => (
    /*html*/
    `<button id="sounds" class="rb jc" aria-label="${isSoundsEnabled() ? "Mute sounds" : "Unmute sounds"}" title="Sound on/off">${isSoundsEnabled() ? ICONS.soundOn : ICONS.soundOff}</button>`
  );

  // src/components/game/components/header/index.ts
  var header_default = (size = 3) => (
    /*html*/
    `<div class="game-he"><button id="lobby" class="rb jc" aria-label="Back to the levels" title="Back to the levels">${ICONS.back}</button><div class="game-he-i jc"><div class="game-he-s">${size} \xD7 ${size}</div><div class="game-he-t jc">${ICONS.clock}<span>00:00</span></div></div>${sound_default()}</div>`
  );

  // src/components/game/components/tile/index.ts
  var tile_default = ({ v = 0, s = 0, x = 0, y = 0, id }) => (
    /*html*/
    `<button id=${id} class="tile jc" tabindex="-1" style="width:${s}%;height:${s}%;left:${x}%;top:${y}%">${v}</button>`
  );

  // src/components/alert/index.ts
  var Alert = {
    interval: null,
    show({ txt = "", icon = "", yes = "Yes", no = "No", cb, timer = 0 }) {
      $(".modal .txt").innerHTML = (icon ? `<div class="m-icon jc">${icon}</div>` : "") + txt;
      addStyle($(".modal #btn1"), { display: yes ? "block" : "none" });
      addStyle($(".modal #btn2"), { display: no ? "block" : "none" });
      $(".modal #btn1").textContent = yes;
      $(".modal #btn2").textContent = no;
      removeClass($(".modal"), "hide");
      addClass($(".modal"), "show");
      if (this.interval) {
        clearTimeout(this.interval);
      }
      if (timer) {
        this.interval = window.setTimeout(() => {
          this.hide();
        }, timer);
      }
      this.callback = cb;
    },
    hide() {
      removeClass($(".modal"), "show");
      addClass($(".modal"), "hide");
      if (this.interval) {
        clearTimeout(this.interval);
      }
    },
    isOpen: () => !!$(".modal.show"),
    render: () => `<div class="modal hide wh" role="dialog" aria-modal="true"><div class="ms wh"></div><div class="mw wh jc"><div class="mc"><div class="jc txt"></div><div class="mb jc"><button id="btn1"></button><button id="btn2"></button></div></div></div></div>`,
    events() {
      $$(".modal button").forEach(
        (btn) => $on(btn, "click", (e) => {
          this.hide();
          const cb = this.callback;
          this.callback = void 0;
          cb && cb(e.currentTarget.id === "btn1");
        })
      );
    }
  };
  var alert_default = Alert;

  // src/components/game/solvePuzzle.ts
  var seq = [];
  var blnkx = 0;
  var blnky = 0;
  var hgh = 0;
  var wid = 0;
  var posit = [];
  var siz = 0;
  var domove = (m = 0) => {
    const d = blnkx + blnky * wid;
    if (m === 0) {
      posit[d] = posit[d - 1];
      posit[d - 1] = siz;
      blnkx--;
    } else if (m === 1) {
      posit[d] = posit[d - wid];
      posit[d - wid] = siz;
      blnky--;
    } else if (m === 2) {
      posit[d] = posit[d + wid];
      posit[d + wid] = siz;
      blnky++;
    } else if (m === 3) {
      posit[d] = posit[d + 1];
      posit[d + 1] = siz;
      blnkx++;
    }
  };
  var push = (positions = []) => {
    for (let i = 0; i < positions.length; i++) {
      const c = positions[i];
      if (seq.length && seq[seq.length - 1] + c === 3) seq.length--;
      else seq[seq.length] = c;
      domove(c);
    }
  };
  var movepiece = (p = 0, y = 0, x = 0) => {
    let c = -1;
    let j = 0;
    let i = 0;
    for (i = 0; i < hgh; i++) {
      for (j = 0; j < wid; j++) {
        c++;
        if (posit[c] === p) break;
      }
      if (posit[c] === p) break;
    }
    if (j < x && blnky == y) push([2]);
    while (j > x) {
      if (blnky === i && blnkx > j) {
        if (i === hgh - 1) push([1]);
        else push([2]);
      }
      while (blnkx >= j) push([0]);
      while (blnkx < j - 1) push([3]);
      while (blnky < i) push([2]);
      while (blnky > i) push([1]);
      push([3]);
      j--;
    }
    while (j < x) {
      if (blnky === i && blnkx < j) {
        if (i === hgh - 1) push([1]);
        else push([2]);
      }
      while (blnkx <= j) push([3]);
      while (blnkx > j + 1) push([0]);
      while (blnky < i) push([2]);
      while (blnky > i) push([1]);
      push([0]);
      j++;
    }
    while (i > y) {
      if (y < i - 1) {
        while (blnky < i - 1) push([2]);
        if (blnkx === j) push([j == wid - 1 ? 0 : 3]);
        while (blnky > i - 1) push([1]);
        while (blnkx < j) push([3]);
        while (blnkx > j) push([0]);
        push([2]);
      } else {
        if (j !== wid - 1) {
          if (blnky === i) push([2]);
          while (blnkx < j + 1) push([3]);
          while (blnkx > j + 1) push([0]);
          while (blnky > i - 1) push([1]);
          while (blnky < i - 1) push([2]);
          push([0, 2]);
        } else {
          if (blnky < i && blnkx == j) {
            while (blnky < i) push([2]);
          } else {
            while (blnky > i + 1) push([1]);
            while (blnky < i + 1) push([2]);
            while (blnkx < j) push([3]);
            while (blnkx > j) push([0]);
            push([1, 1, 0, 2, 3, 2, 0, 1, 1, 3, 2]);
          }
        }
      }
      i--;
    }
    while (i < y) {
      if (blnkx === j && blnky < i) {
        if (j === wid - 1) push([0]);
        else push([3]);
      }
      while (blnky > i + 1) push([1]);
      while (blnky < i + 1) push([2]);
      while (blnkx < j) push([3]);
      while (blnkx > j) push([0]);
      push([1]);
      i++;
    }
  };
  var getStepsSolvePuzzle = (totalSize = 15, posXEmpty = 0, posYEmpty = 0, Oposit = [], size = 0) => {
    posit = JSON.parse(JSON.stringify(Oposit));
    blnkx = posXEmpty;
    blnky = posYEmpty;
    hgh = size;
    wid = size;
    siz = totalSize;
    seq.length = 0;
    const back = [];
    for (let i = 0; i <= siz; i++) back[i] = posit[i];
    back[siz + 1] = blnkx;
    back[siz + 2] = blnky;
    let rr = 0;
    for (let r = 0; r < hgh - 2; r++) {
      for (let c = 0; c < wid; c++) movepiece(rr + c, r, c);
      rr += wid;
    }
    for (let c = 0; c < wid - 2; c++) {
      movepiece(rr, hgh - 2, c);
      if (blnkx === c) push([3]);
      if (posit[rr + wid] !== rr + wid) {
        movepiece(rr + wid, hgh - 1, c + 1);
        if (blnky !== hgh - 1) {
          if (blnkx === c + 1) push([3]);
          push([2]);
        }
        while (blnkx > c + 2) push([0]);
        push([0, 0, 1, 3, 2, 3, 1, 0, 0, 2, 3]);
      }
      rr++;
    }
    if (blnkx < wid - 1) push([3]);
    if (blnky < hgh - 1) push([2]);
    rr = siz - wid - 1;
    if (posit[rr] === rr + 1) push([1, 0, 2, 3]);
    if (posit[rr] === rr + wid) push([0, 1, 3, 2]);
    for (let i = 0; i <= siz; i++) posit[i] = back[i];
    blnkx = back[siz + 1];
    blnky = back[siz + 2];
    return seq;
  };
  var solvePuzzle_default = getStepsSolvePuzzle;

  // src/components/game/mixBoard.ts
  var blnkx2 = 0;
  var blnky2 = 0;
  var fillTwo = (siz2 = 15, posit2 = [], wid2 = 4, hgh2 = 4) => {
    let s1 = -1;
    let s2 = -1;
    for (let i = 0; i <= siz2; i++) {
      if (posit2[i] === -1) {
        if (s1 < 0) {
          s1 = i;
          posit2[s1] = siz2 - 1;
        } else {
          s2 = i;
          posit2[s2] = siz2 - 2;
          break;
        }
      }
    }
    let c = 0;
    for (let i = 1; i <= siz2; i++) {
      for (let j = 0; j < i; j++) {
        if (posit2[j] > posit2[i]) c++;
      }
    }
    c += wid2 - 1 - blnkx2 + (hgh2 - 1) - blnky2;
    if (c & 1) {
      posit2[s1] = siz2 - 2;
      posit2[s2] = siz2 - 1;
    }
    return posit2.filter((v) => v !== void 0);
  };
  var mixBoard = (siz2 = 15, hgh2 = 4, wid2 = 4, posit2 = []) => {
    let i = 0;
    let j = 0;
    let c = 0;
    const pcs = [];
    for (i = 0; i <= siz2; i++) pcs[i] = i;
    pcs[siz2 - 1] = -1;
    pcs[siz2 - 2] = -1;
    for (i = 0; i < hgh2; i++) {
      for (j = 0; j < wid2; j++) {
        const k = Math.floor(Math.random() * pcs.length);
        posit2[c] = pcs[k];
        if (pcs[k] === siz2) {
          blnkx2 = j;
          blnky2 = i;
        }
        pcs[k] = pcs[pcs.length - 1];
        pcs.length--;
        c++;
      }
    }
    posit2 = fillTwo(siz2, posit2, wid2, hgh2);
    return posit2;
  };
  var mixBoard_default = mixBoard;

  // src/components/game/helpers.ts
  var SIZE_TILE = 0;
  var GRID = [];
  var SIZE_LEVEL = 0;
  var GAME_STARTED = false;
  var SCREEN_ACTIVE = false;
  var TIMER_ELEMET;
  var TOTAL_HELP_ELEMENT;
  var INTERVAL_CHRONOMETER = null;
  var CHRONOMETER_PAUSED = false;
  var TIMER = { m: 0, s: 0 };
  var LEVEL_COMPLETED = false;
  var INTERVAL_SOLVE;
  var IS_SOLVING = false;
  var TOTAL_HELP = 0;
  var STEPS_SOLVE_PUZZLE = [];
  var COUNTER_SOLVE = 0;
  var CLICK_TILE = false;
  var GLOBAL_EVENTS = false;
  var DIRECTIONS_TO_MOVE = [
    { r: 0, c: -1 },
    { r: 1, c: 0 },
    { r: 0, c: 1 },
    { r: -1, c: 0 }
  ];
  var calculatePosition = (col = 0, row = 0) => ({
    x: SIZE_TILE * col,
    y: SIZE_TILE * row
  });
  var getTiles = () => fillArray(SIZE_LEVEL).map(
    (r) => fillArray(SIZE_LEVEL).map((c) => {
      const value = c + 1 + r * SIZE_LEVEL;
      const number = value !== SIZE_LEVEL ** 2 ? value : 0;
      const { x, y } = calculatePosition(c, r);
      const id = `ti-${generateUUID()}`;
      return { v: number, s: SIZE_TILE, x, y, id };
    })
  );
  var createLevel = () => {
    SIZE_TILE = 100 / SIZE_LEVEL;
    GRID = getTiles();
    const newTiles = GRID.map((f) => f.map((t) => t.v !== 0 ? tile_default(t) : "")).flat().join("");
    setHtml($(".grid"), newTiles);
  };
  var renderTilesPosition = () => {
    for (let r = 0; r < SIZE_LEVEL; r++) {
      for (let c = 0; c < SIZE_LEVEL; c++) {
        const { x, y } = calculatePosition(c, r);
        GRID[r][c].x = x;
        GRID[r][c].y = y;
        addStyle(document.getElementById(GRID[r][c].id), {
          left: `${x}%`,
          top: `${y}%`
        });
      }
    }
  };
  var swapValues = (origin = { r: 0, c: 0 }, destinity = { r: 0, c: 0 }) => {
    const titleChange = GRID[origin.r][origin.c];
    const titleEmpty = GRID[destinity.r][destinity.c];
    const tileChangeID = titleChange.id;
    const tileChangeValue = titleChange.v;
    const tileEmptyID = titleEmpty.id;
    const tileEmptyValue = titleEmpty.v;
    GRID[destinity.r][destinity.c].id = tileChangeID;
    GRID[destinity.r][destinity.c].v = tileChangeValue;
    GRID[origin.r][origin.c].id = tileEmptyID;
    GRID[origin.r][origin.c].v = tileEmptyValue;
    PlaySound("shot");
  };
  var shuffleTiles = () => {
    const size = SIZE_LEVEL ** 2;
    const posit2 = fillArray(size);
    const orgData = mixBoard_default(size - 1, size, size, posit2);
    const base = orgData.map((v) => v + 1 === size ? 0 : v + 1);
    const shuffle = base.map((v) => [v, getCellIDByValue(v).id]);
    const tmpMatriz = [];
    for (let i = 0; i < size; i += SIZE_LEVEL) {
      tmpMatriz.push(shuffle.slice(i, i + SIZE_LEVEL));
    }
    for (let r = 0; r < SIZE_LEVEL; r++) {
      for (let c = 0; c < SIZE_LEVEL; c++) {
        const [value, id] = tmpMatriz[r][c];
        GRID[r][c].v = value;
        GRID[r][c].id = id;
      }
    }
    renderTilesPosition();
  };
  var getRowCol = (id = "") => {
    for (let r = 0; r < SIZE_LEVEL; r++) {
      for (let c = 0; c < SIZE_LEVEL; c++) {
        if (GRID[r][c].id === id) {
          return { r, c };
        }
      }
    }
    return { r: 0, c: 0 };
  };
  var getCellIDByValue = (value = 0) => {
    for (let r = 0; r < SIZE_LEVEL; r++) {
      for (let c = 0; c < SIZE_LEVEL; c++) {
        if (GRID[r][c].v === value) {
          return { r, c, id: GRID[r][c].id };
        }
      }
    }
    return { r: 0, c: 0, id: "" };
  };
  var rowColumnWithinBoard = (r = 0, c = 0) => r >= 0 && r < SIZE_LEVEL && c >= 0 && c < SIZE_LEVEL;
  var validateMoveTile = (r = 0, c = 0) => {
    let tilesToMove = [];
    let emptySpace = false;
    let direction = -1;
    for (let i = 0; i < DIRECTIONS_TO_MOVE.length; i++) {
      const { r: rI, c: cI } = DIRECTIONS_TO_MOVE[i];
      const posibleTiles = [];
      let newRow = r;
      let newCol = c;
      do {
        newRow += rI;
        newCol += cI;
        if (rowColumnWithinBoard(newRow, newCol)) {
          if (GRID[newRow][newCol].v === 0) {
            emptySpace = true;
            break;
          } else {
            posibleTiles.push({ r: newRow, c: newCol });
          }
        } else {
          break;
        }
      } while (1);
      if (emptySpace) {
        direction = i;
        tilesToMove = posibleTiles;
        tilesToMove.unshift({ r, c });
        break;
      }
    }
    return { direction, tilesToMove };
  };
  var validateOrderedTiles = () => {
    const flatArray = GRID.flat();
    const sizeTotal = SIZE_LEVEL ** 2;
    const lastTileValue = flatArray[sizeTotal - 1].v;
    let total = 0;
    for (let i = 0; i < flatArray.length; i++) {
      if (flatArray[i].v === i + 1) {
        total++;
      } else {
        break;
      }
    }
    return total + 1 === sizeTotal && lastTileValue === 0;
  };
  var saveTimeSolveLevel = () => {
    const cacheKey = `t-${SIZE_LEVEL}`;
    const currentTime = getValueFromCache(cacheKey, {
      m: -1,
      s: -1
    });
    const hasTime = currentTime.m >= 0 || currentTime.s >= 0;
    const isRecord = !hasTime || timeToseconds(TIMER) < timeToseconds(currentTime);
    if (isRecord) {
      savePropierties(cacheKey, __spreadValues({}, TIMER));
    }
    return { isRecord, hadTime: hasTime, best: currentTime };
  };
  var afterAlert = (playAgain) => {
    if (playAgain) {
      startGame();
    } else {
      leaveGame();
    }
  };
  var levelSolvedByPlayer = () => {
    stopChronometer();
    const { isRecord, hadTime, best } = saveTimeSolveLevel();
    showMessage(isRecord, hadTime, best);
  };
  var showMessage = async (isRecord = false, hadTime = false, best = { m: 0, s: 0 }) => {
    LEVEL_COMPLETED = true;
    await delay(500);
    if (!SCREEN_ACTIVE) return;
    let data = {
      icon: ICONS.trophy,
      txt: `<h4>Excellent!</h4><p>You sorted the ${SIZE_LEVEL} \xD7 ${SIZE_LEVEL} board in <b>${showIntervalValue(
        TIMER
      )}</b>.</p><p>${isRecord && hadTime ? "That's a new best time!" : hadTime ? `Your best time is ${showIntervalValue(best)}.` : ""} Play again?</p>`
    };
    if (IS_SOLVING) {
      data = {
        icon: ICONS.robot,
        txt: "<h4>Solved by the robot!</h4><p>This one doesn't count as your own win. Want to give it another shot?</p>"
      };
    }
    alert_default.show(__spreadProps(__spreadValues({}, data), { no: "Levels", yes: "Play again", cb: afterAlert }));
    PlaySound("gameOver");
  };
  var showErroMessage = () => {
    alert_default.show({
      icon: ICONS.sad,
      txt: "<h4>No solution found</h4><p>Sorry, I couldn't find a solution for this board. Do you want to try again?</p>",
      no: "Levels",
      yes: "Try again",
      cb: afterAlert
    });
    PlaySound("blocked");
  };
  var clickOnTile = (id = "") => {
    if (!GAME_STARTED || LEVEL_COMPLETED || IS_SOLVING) return;
    const { r, c } = getRowCol(id);
    const { direction, tilesToMove } = validateMoveTile(r, c);
    if (direction >= 0) {
      for (let i = tilesToMove.length - 1; i >= 0; i--) {
        const newRow = tilesToMove[i].r + DIRECTIONS_TO_MOVE[direction].r;
        const newCol = tilesToMove[i].c + DIRECTIONS_TO_MOVE[direction].c;
        swapValues(
          { r: tilesToMove[i].r, c: tilesToMove[i].c },
          { r: newRow, c: newCol }
        );
      }
      renderTilesPosition();
      if (validateOrderedTiles()) {
        levelSolvedByPlayer();
      }
      CLICK_TILE = true;
    }
  };
  var stopChronometer = () => {
    if (INTERVAL_CHRONOMETER) {
      clearInterval(INTERVAL_CHRONOMETER);
      INTERVAL_CHRONOMETER = null;
    }
  };
  var startChronometer = () => {
    stopChronometer();
    CHRONOMETER_PAUSED = false;
    TIMER_ELEMET.textContent = showIntervalValue(TIMER);
    INTERVAL_CHRONOMETER = window.setInterval(() => {
      TIMER.s++;
      if (TIMER.s === 60) {
        TIMER.s = 0;
        TIMER.m++;
        if (TIMER.m === 60) {
          stopChronometer();
        }
      }
      TIMER_ELEMET.textContent = showIntervalValue(TIMER);
    }, 1e3);
  };
  var showTotalHelp = () => {
    TOTAL_HELP_ELEMENT.textContent = `${TOTAL_HELP}`;
  };
  var stopAutoSolve = () => {
    if (INTERVAL_SOLVE) {
      clearInterval(INTERVAL_SOLVE);
      INTERVAL_SOLVE = void 0;
    }
    removeClass($(".game"), "fast");
  };
  var startGame = () => {
    stopAutoSolve();
    TOTAL_HELP = NUMBER_HELP_PER_LEVEL[SIZE_LEVEL];
    IS_SOLVING = false;
    LEVEL_COMPLETED = false;
    CLICK_TILE = false;
    COUNTER_SOLVE = 0;
    TIMER = { m: 0, s: 0 };
    STEPS_SOLVE_PUZZLE = [];
    showTotalHelp();
    changeStateButtons(false);
    shuffleTiles();
    stopChronometer();
    startChronometer();
  };
  var leaveGame = () => {
    SCREEN_ACTIVE = false;
    stopAutoSolve();
    stopChronometer();
    Screen_default();
  };
  var automaticMovementSolvePuzzle = (counter = 0, order = []) => {
    const movement = order[counter];
    const { r: xEmpty, c: yEmpty } = getCellIDByValue(0);
    const directions = [
      { r: 0, c: -1 },
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: 1 }
    ];
    const newRow = xEmpty + directions[movement].r;
    const newCol = yEmpty + directions[movement].c;
    if (rowColumnWithinBoard(newRow, newCol)) {
      swapValues({ r: newRow, c: newCol }, { r: xEmpty, c: yEmpty });
      renderTilesPosition();
    } else {
      $("#help").disabled = true;
      stopAutoSolve();
      stopChronometer();
    }
  };
  var changeStateButtons = (isDisabled = false) => {
    $$(".game-fo-o button").forEach((button) => {
      button.disabled = isDisabled;
    });
  };
  var getSolvePuzzleValues = () => {
    const { r: x, c: y } = getCellIDByValue(0);
    const size = SIZE_LEVEL ** 2;
    const posit2 = GRID.flat().map((v) => v.v === 0 ? size - 1 : v.v - 1);
    return solvePuzzle_default(size - 1, y, x, posit2, SIZE_LEVEL).slice();
  };
  var solvePuzzle = () => {
    IS_SOLVING = true;
    changeStateButtons(true);
    STEPS_SOLVE_PUZZLE = getSolvePuzzleValues();
    const total = STEPS_SOLVE_PUZZLE.length;
    const speed = Math.max(20, Math.min(100, 15e3 / Math.max(1, total)));
    const movesPerTick = Math.max(1, Math.round(total * speed / 15e3));
    if (speed < 90) {
      const game = $(".game");
      game.style.setProperty("--td", `${Math.round(speed * 0.85)}ms`);
      addClass(game, "fast");
    }
    let counter = 0;
    INTERVAL_SOLVE = window.setInterval(() => {
      if (document.hidden) return;
      if (counter < total) {
        for (let i = 0; i < movesPerTick && counter < total; i++) {
          automaticMovementSolvePuzzle(counter, STEPS_SOLVE_PUZZLE);
          counter++;
        }
      } else {
        stopAutoSolve();
        if (validateOrderedTiles()) {
          showMessage();
        } else {
          showErroMessage();
        }
      }
    }, speed);
  };
  var useHelp = () => {
    if (TOTAL_HELP <= 0 || LEVEL_COMPLETED || IS_SOLVING) return;
    TOTAL_HELP--;
    showTotalHelp();
    if (TOTAL_HELP === 0) {
      $("#help").disabled = true;
    }
    if (STEPS_SOLVE_PUZZLE.length === 0 || CLICK_TILE) {
      COUNTER_SOLVE = 0;
      STEPS_SOLVE_PUZZLE = getSolvePuzzleValues();
      CLICK_TILE = false;
    } else {
      COUNTER_SOLVE++;
    }
    if (STEPS_SOLVE_PUZZLE.length > 0) {
      if (COUNTER_SOLVE < STEPS_SOLVE_PUZZLE.length) {
        automaticMovementSolvePuzzle(COUNTER_SOLVE, STEPS_SOLVE_PUZZLE);
        if (validateOrderedTiles()) {
          levelSolvedByPlayer();
        }
      }
    } else {
      showErroMessage();
    }
  };
  var onKeyDown = (e) => {
    if (!SCREEN_ACTIVE || alert_default.isOpen()) return;
    const keys = {
      ArrowLeft: [0, 1],
      ArrowRight: [0, -1],
      ArrowUp: [1, 0],
      ArrowDown: [-1, 0]
    };
    const k = keys[e.key];
    if (!k) return;
    e.preventDefault();
    if (!GAME_STARTED) return;
    const { r, c } = getCellIDByValue(0);
    const nr = r + k[0];
    const nc = c + k[1];
    if (rowColumnWithinBoard(nr, nc)) {
      clickOnTile(GRID[nr][nc].id);
    }
  };
  var onVisibilityChange = () => {
    if (!SCREEN_ACTIVE) return;
    if (document.hidden) {
      if (INTERVAL_CHRONOMETER) {
        stopChronometer();
        CHRONOMETER_PAUSED = true;
      }
    } else if (CHRONOMETER_PAUSED && !LEVEL_COMPLETED) {
      CHRONOMETER_PAUSED = false;
      if (GAME_STARTED && !IS_SOLVING) startChronometer();
    }
  };
  var initComponent = (size = 3) => {
    SIZE_LEVEL = size;
    TIMER_ELEMET = $(".game-he-t span");
    TOTAL_HELP_ELEMENT = $("#help span");
    GAME_STARTED = false;
    SCREEN_ACTIVE = true;
    LEVEL_COMPLETED = false;
    IS_SOLVING = false;
    CHRONOMETER_PAUSED = false;
    createLevel();
    if (!GLOBAL_EVENTS) {
      GLOBAL_EVENTS = true;
      $on(window, "keydown", onKeyDown);
      $on(document, "visibilitychange", onVisibilityChange);
    }
    $on($(".grid"), "pointerdown", (e) => {
      if (e.button > 0) return;
      const tile = e.target.closest(".tile");
      if (tile) {
        e.preventDefault();
        clickOnTile(tile.id);
      }
    });
    eventButton((action) => {
      if (action === "start") {
        GAME_STARTED = true;
        addClass($(".game-fo"), "s");
        layout();
        startGame();
      }
      if (action === "restart") {
        startGame();
      }
      if (action === "help") {
        useHelp();
      }
      if (action === "solve") {
        stopChronometer();
        solvePuzzle();
      }
      if (action === "lobby") {
        leaveGame();
      }
      if (action === "sounds") {
        toogleSounds($("#sounds"));
      }
    });
    alert_default.events();
  };

  // src/components/game/index.ts
  var Game = ({ s = 3 }) => {
    const render = (
      /*html*/
      `<div class="game wh si-${s}" data-size="${s}"><div class="game-p">${header_default(
        s
      )}${footer_default()}</div><div class="game-bw">${grid_default()}</div>${alert_default.render()}</div>`
    );
    setHtml($(`#${CONTAINER}`), render);
    layout();
    initComponent(s);
  };
  var game_default = Game;

  // src/components/lobby/components/nav/index.ts
  var nav_default = () => (
    /*html*/
    `<div class="game-nav jc"><button id="about" class="rb jc" aria-label="How to play" title="How to play">${ICONS.info}</button><div class="game-nav-logo jc"><span>Number Sort</span></div>${sound_default()}</div>`
  );

  // src/components/lobby/helpers.ts
  var otherLevelsEnabled = () => {
    const time = getValueFromCache(
      `t-${LEVEL_ENABLES_OTHER_LEVELS}`,
      { m: -1, s: -1 }
    );
    return time.m >= 0 || time.s >= 0;
  };
  var helpers_default = () => {
    const enabledOtherLevels = otherLevelsEnabled();
    return fillArray(TOTAL_LEVELS).map((v) => {
      const size = v + 3;
      const time = getValueFromCache(`t-${size}`, {
        m: -1,
        s: -1
      });
      const isDisabled = size <= LEVEL_ENABLES_OTHER_LEVELS ? false : !enabledOtherLevels;
      const hasTime = time.m >= 0 || time.s >= 0;
      const renderTimerOrLabel = hasTime ? `<div class="lobby-t jc">${ICONS.clock}<span>${showIntervalValue(
        time
      )}</span></div>` : isDisabled ? `<div class="lobby-m lock jc">${ICONS.lock}<span>Locked</span></div>` : `<div class="lobby-m">Play now</div>`;
      return (
        /*html*/
        `<button id="level-${size}" class="button lobby-o jc" ${isDisabled ? "disabled" : ""} aria-label="${size} by ${size} board"><span class="lobby-s">${size} \xD7 ${size}</span>${renderTimerOrLabel}</button>`
      );
    }).join("");
  };

  // src/components/lobby/index.ts
  var N = LEVEL_ENABLES_OTHER_LEVELS;
  var showHowToPlay = () => alert_default.show({
    icon: ICONS.info,
    txt: `<h4>How to play</h4><ul><li>Slide the tiles into the empty space until the numbers are in order, left to right and top to bottom, with the gap in the bottom-right corner.</li><li>Click or tap a tile in the same row or column as the gap to slide it (and every tile in between). Arrow keys work too.</li><li>Stuck? <b>Hint</b> plays the next move of the solution, <b>Solve</b> lets the robot finish the board.</li><li>Solve the ${N} \xD7 ${N} board to unlock the bigger ones, up to 13 \xD7 13.</li></ul>`,
    yes: "Got it",
    no: ""
  });
  var lobby_default = () => {
    const note = otherLevelsEnabled() ? "Beat your best time on every board!" : `Solve the ${N} \xD7 ${N} board to unlock the bigger ones`;
    const render = (
      /*html*/
      `<div class="lobby wh">${nav_default()}<div class="lobby-b"><div class="lobby-g">${helpers_default()}</div></div><div class="lobby-n">${note}</div>${alert_default.render()}</div>`
    );
    setHtml($(`#${CONTAINER}`), render);
    eventButton((action) => {
      if (action.includes("level-")) {
        const size = +action.split("-")[1];
        Screen_default("Game", { s: size });
      }
      if (action === "about") {
        showHowToPlay();
      }
      if (action === "sounds") {
        toogleSounds($("#sounds"));
      }
    });
    alert_default.events();
  };

  // src/Screen.ts
  var Handler = { Game: game_default, Lobby: lobby_default };
  var Screen_default = (screen = "Lobby", params = {}) => Handler[screen](params);

  // src/index.ts
  setHtml($(`#${ROOT}`), container_default());
  Screen_default();
  $on(document, "contextmenu", (event) => event.preventDefault());
  window.addEventListener("resize", resize_screen_default);
  window.addEventListener("orientationchange", () => setTimeout(layout, 150));
  layout();
  $on(window, "click", (e) => {
    var _a, _b;
    const target = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "a, button");
    if (target && !target.classList.contains("tile")) {
      PlaySound("click");
    }
  });
})();
