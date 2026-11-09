const AUDIO_EFFECTS = {
  blank: "sfx/blank.ogg",
  "briefcase-latch": "sfx/briefcase-latch.ogg",
  "briefcase-open": "sfx/briefcase-open.ogg",
  "briefcase-show": "sfx/briefcase-show.ogg",
  "dealer-talk": "sfx/dealer-talk.ogg",
  "item-1": "items/item-1.ogg",
  "item-2": "items/item-2.ogg",
  "item-3": "items/item-3.ogg",
  "item-4": "items/item-4.ogg",
  cigarette: "items/cigarette.ogg",
  contraption: "items/contraption.ogg",
  flashlight: "items/flashlight.ogg",
  jammer: "items/jammer.ogg",
  vodka: "items/vodka.ogg",
  live: "sfx/live.ogg",
  "load-shell": "sfx/load-shell.ogg",
  "lose-health": "sfx/lose-health.ogg",
  "pump-shotgun": "sfx/pump-shotgun.ogg",
  "round-light": "sfx/round-light.ogg",
};

const audioClips = Object.fromEntries(
  Object.entries(AUDIO_EFFECTS).map(([name, path]) => {
    const clip = new Audio(`assets/audio/${path}`);
    clip.preload = "auto";
    return [name, clip];
  }),
);

let activeMusic = null;

/** Plays a one-shot sound effect when the requested clip exists.
 * @param {string} name - Key in AUDIO_EFFECTS.
 */
function playSound(name) {
  const clip = audioClips[name];

  if (!clip) {
    return;
  }

  const playback = clip.cloneNode();
  playback.volume = 0.65;
  playback.play().catch(() => {});
}

/** Replaces the current music track with the requested track.
 * @param {string} name - Music filename without its extension.
 */
function playMusic(name) {
  if (activeMusic) {
    activeMusic.pause();
    activeMusic.currentTime = 0;
  }

  activeMusic = new Audio(`assets/audio/music/${name}.ogg`);
  activeMusic.loop = name === "background-music" || name === "blank-shell";
  activeMusic.volume = 0.35;
  activeMusic.play().catch(() => {});
}
