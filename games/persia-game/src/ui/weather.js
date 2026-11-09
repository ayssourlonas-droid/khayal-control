// A level's weather (levels.js weatherOf) is drawn by its kind: each kind in WEATHER names the
// phase of the frame it falls in and the function that draws it. Rain and petals fall in the field,
// under what fights; stars, the moon, dawn, sunrise and the rainbow belong to the sky, so the mountains
// and the landmark cover them.
//   fadeWeather(w, t) -> k   w = { since: null } eases k from 0 up to 1 over FADE s from the first
//     frame the weather is drawn (it never stops within a world, and each level and retry has a view
//     of its own, so a world that has weather from its start fades it in too)
//   drawWeather(ctx, v, world, t, phase)   draws the world's weather if it falls in `phase` ('sky' or
//     'field'); view.js calls it at both places. A kind's function takes (ctx, k, t, quality, reduced,
//     age): the fade, the view's clock, the quality level, reduced motion, and the seconds since the
//     weather began, which only sunrise's climb reads
import { weatherOf } from '../core/levels.js';
import { drawRain } from './rain.js';
import { drawStars } from './stars.js';
import { drawPetals } from './petals.js';
import { drawMoon } from './moon.js';
import { drawDawn } from './dawn.js';
import { drawSunrise } from './sunrise.js';
import { drawRainbow } from './rainbow.js';

const FADE = 2; // s to fade in

const WEATHER = {
  rain: ['field', drawRain], stars: ['sky', drawStars], petals: ['field', drawPetals], moon: ['sky', drawMoon],
  dawn: ['sky', drawDawn], sunrise: ['sky', drawSunrise], rainbow: ['sky', drawRainbow],
};

export function fadeWeather(w, t) {
  w.since ??= t;
  return Math.min(1, (t - w.since) / FADE);
}

export function drawWeather(ctx, v, world, t, phase) {
  const [at, draw] = WEATHER[weatherOf(world)] ?? [];
  if (at !== phase) return;
  const k = fadeWeather(v.weather, t); // starts the weather's clock on its first frame
  draw(ctx, k, t, v.quality.level, v.reduced, t - v.weather.since);
}
