/**
 * Audio.js
 * Simple wx-compatible sound-effect player.
 * Each named clip maps to its own wx.createInnerAudioContext(),
 * which avoids the seek/sprite timing issues on mobile.
 */

const CLIPS = {
  button_next: { src: "assets/audio/button-next.mp3", volume: 1.0 },
  button_back: { src: "assets/audio/button-back.mp3", volume: 1.0 },
  a_bigPop: { src: "assets/audio/sfx/a_bigPop.ogg", volume: 1.0 },
  a_bomb: { src: "assets/audio/sfx/a_bomb.ogg", volume: 1.0 },
  a_colorBomb: { src: "assets/audio/sfx/a_colorBomb.ogg", volume: 1.0 },
  a_combo_01: { src: "assets/audio/sfx/a_combo_01.ogg", volume: 1.0 },
  a_combo_02: { src: "assets/audio/sfx/a_combo_02.ogg", volume: 1.0 },
  a_combo_03: { src: "assets/audio/sfx/a_combo_03.ogg", volume: 1.0 },
  a_combo_04: { src: "assets/audio/sfx/a_combo_04.ogg", volume: 1.0 },
  a_fireBallNext: { src: "assets/audio/sfx/a_fireBallNext.ogg", volume: 1.0 },
  a_fireBallShoot: { src: "assets/audio/sfx/a_fireBallShoot.ogg", volume: 1.0 },
  a_glassNext: { src: "assets/audio/sfx/a_glassNext.ogg", volume: 1.0 },
  a_hit: { src: "assets/audio/sfx/a_hit.ogg", volume: 1.0 },
  a_pop_01: { src: "assets/audio/sfx/a_pop_01.ogg", volume: 1.0 },
  a_pop_02: { src: "assets/audio/sfx/a_pop_02.ogg", volume: 1.0 },
  a_pop_03: { src: "assets/audio/sfx/a_pop_03.ogg", volume: 1.0 },
  a_pop_04: { src: "assets/audio/sfx/a_pop_04.ogg", volume: 1.0 },
  a_pop_05: { src: "assets/audio/sfx/a_pop_05.ogg", volume: 1.0 },
  a_pop_06: { src: "assets/audio/sfx/a_pop_06.ogg", volume: 1.0 },
  a_shoot: { src: "assets/audio/sfx/a_shoot.ogg", volume: 1.0 },
  a_swap: { src: "assets/audio/sfx/a_swap.ogg", volume: 0.5 },
  a_floater_popup: { src: "assets/audio/sfx/a_floater_popup.ogg", volume: 1.0 },
  a_levelStart: { src: "assets/audio/sfx/a_levelStart.mp3", volume: 1.0 },
  a_levelComplete: { src: "assets/audio/sfx/a_levelComplete.mp3", volume: 1.0 },
  a_mouseDown: { src: "assets/audio/sfx/a_mouseDown.mp3", volume: 1.0 },
  a_levelend_star_01: { src: "assets/audio/sfx/a_levelend_star_01.ogg", volume: 1.0 },
  a_levelend_star_02: { src: "assets/audio/sfx/a_levelend_star_02.ogg", volume: 1.0 },
  a_levelend_star_03: { src: "assets/audio/sfx/a_levelend_star_03.ogg", volume: 1.0 },
  a_levelend_fail: { src: "assets/audio/sfx/a_levelend_fail.ogg", volume: 1.0 },
  a_levelend_score_counter: { src: "assets/audio/sfx/a_levelend_score_counter.mp3", volume: 1.0 },
  a_levelend_score_end: { src: "assets/audio/sfx/a_levelend_score_end.ogg", volume: 1.0 },
  a_medal: { src: "assets/audio/sfx/a_medal.ogg", volume: 1.0 },
};

const POP_CLIPS = [
  "a_pop_01", "a_pop_02", "a_pop_03",
  "a_pop_04", "a_pop_05", "a_pop_06",
];

export default class Audio {
  constructor() {
    // Load persisted sound-effect preference (default: on)
    this.seOn = true;
    try {
      const saved = wx.getStorageSync("bubblespinner_setting");
      if (saved) this.seOn = JSON.parse(saved).seOn !== false;
    } catch (e) { /* ignore */ }

    // Create one InnerAudioContext per clip
    this._ctx = {};
    for (const [name, { src, volume }] of Object.entries(CLIPS)) {
      const ctx = wx.createInnerAudioContext();
      ctx.src = src;
      ctx.volume = volume;
      this._ctx[name] = ctx;
    }
  }

  /**
   * Toggle sound effects on/off and persist the preference.
   */
  toggleSoundEffect() {
    this.seOn = !this.seOn;
    try {
      wx.setStorageSync("bubblespinner_setting", JSON.stringify({ seOn: this.seOn }));
    } catch (e) { /* ignore */ }
  }

  /**
   * Play a named clip.
   * @param {string} name  e.g. "a_shoot"
   */
  play(name) {
    if (!this.seOn) return;
    const ctx = this._ctx[name];
    if (!ctx) {
      console.warn(`[Audio] Unknown clip: "${name}"`);
      return;
    }
    ctx.stop();
    ctx.play();
  }

  /**
   * Play a random pop sound (a_pop_01 … a_pop_06).
   */
  playRandomPop() {
    this.play(POP_CLIPS[Math.floor(Math.random() * POP_CLIPS.length)]);
  }

  /**
   * Play a combo sound scaled to the number of bubbles cleared.
   *  3       → random pop
   *  4–6     → a_combo_01
   *  7–9     → a_combo_02
   *  10–12   → a_combo_03
   *  13–15   → a_combo_04
   *  16+     → a_bigPop
   * @param {number} count  total bubbles eliminated
   */
  playCombo(count) {
    if      (count >= 16) this.play("a_bigPop");
    else if (count >= 13) this.play("a_combo_04");
    else if (count >= 10) this.play("a_combo_03");
    else if (count >=  7) this.play("a_combo_02");
    else if (count >=  4) this.play("a_combo_01");
    else                  this.playRandomPop();
  }

  static getInstance() {
    if (!Audio.instance) {
      Audio.instance = new Audio();
    }
    return Audio.instance;
  }
}
