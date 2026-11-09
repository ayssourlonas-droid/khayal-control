// Biblioteca SVG interna - sem dependências externas
window.FlowForgeIcons={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>',
 user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7z"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',
 save:'<svg viewBox="0 0 24 24"><path d="M4 3h14l2 2v16H4z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>',
 image:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 5-5 4 4 3-3 5 5"/></svg>',
 camera:'<svg viewBox="0 0 24 24"><path d="M4 7h4l2-2h4l2 2h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg>',
 heart:'<svg viewBox="0 0 24 24"><path d="M12 21 3 12C-1 7 5 2 9 6l3 3 3-3c4-4 10 1 6 6z"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>',
 menu:'<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
 plus:'<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg>',
 trash:'<svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3m2 0-1 14H8L7 7"/></svg>'
};
window.ffIcon=n=>FlowForgeIcons[n]||FlowForgeIcons.image;
