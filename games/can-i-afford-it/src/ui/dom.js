/* DOM 小工具。 */

/* ============================================================
   工具
   ============================================================ */
export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
