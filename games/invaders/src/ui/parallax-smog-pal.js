// The colours of World 17's mid and near layers, one palette per mode: 'smog' is the grey, grimy city (umber brick, ash-grey
// stone, a dull amber on the edges that face the sun behind the smog) and 'clean' is the same streets on a bright morning
// (warm brick and cream render, sky-blue glass, a gold edge). A painter never asks which mode it is in; it asks the
// palette, so one drawing serves both. Both stay low in the frame: `shade` darkens the foot of the blocks and `shadeA` is
// how hard, so the player's zone (screen y 620-1040) is calm for the bullets, hot magenta, to be read against. No colour here is
// magenta or a bright saturated dot, and flowers (the 'over' pass) are muted.
export const MID = {
  smog: {
    walls: ['#3b2f2a', '#352a29', '#3e3731', '#302d2e', '#43362b'], brickWalls: ['#3a2a25', '#34272a', '#3f3029'],
    roof: '#1f1917', roofHi: '#4f4439', trim: '#4e443a', frame: '#5a4e40', sill: '#675a4a',
    glassTop: '#463d33', glassBot: '#15110f', glint: '#9a8a76', glintA: 0.14, lit: '#dba354', litA: 0.5, board: '#52402f', boardDark: '#241c16',
    iron: '#181413', wood: '#3a2e25', woodHi: '#5e4a38', hoop: '#1c1613',
    edge: '#c09462', edgeA: 0.5, shade: '#0b0807', shadeA: 0.66,
    soot: '#0a0807', sootA: 0.38, dust: '#a39a8e', dustA: 0.34,
    panel: '#6d5d4c', panelB: '#584b3e', trunk: '#241d19', trunkHi: '#5a4838', stone: '#4c443d', sky: '#7a6850',
  },
  clean: {
    walls: ['#b98a6c', '#a4573f', '#cfc3a6', '#9fb3bb', '#c6a36a'], brickWalls: ['#a9593f', '#b4664a', '#9c523c'],
    roof: '#5d5662', roofHi: '#f6e7bf', trim: '#e6dcc4', frame: '#f4efe2', sill: '#f8f2e4',
    glassTop: '#a9d4ee', glassBot: '#4f86b0', glint: '#ffffff', glintA: 0.42, lit: '#f3dfae', litA: 0.8, board: '#9a7a54', boardDark: '#6a5338',
    iron: '#2b3a42', wood: '#8a6a4c', woodHi: '#c4a074', hoop: '#4a4a52',
    edge: '#fff0c4', edgeA: 0.6, shade: '#233646', shadeA: 0.6,
    soot: '#445a6a', sootA: 0.08, dust: '#ffffff', dustA: 0.16,
    panel: '#e8e2d2', panelB: '#a9d0e6', trunk: '#4a3a30', trunkHi: '#b08a60', stone: '#b4aa94', sky: '#9fd0f0',
  },
};

export const NEAR = {
  smog: {
    paving: '#2c2622', paving2: '#25201c', joint: '#0f0c0a', crack: '#080605', kerbTop: '#4d443c', kerbFace: '#342d28',
    gutter: '#110d0b', road: '#1b1714', butt: '#847a6e', buttTip: '#5e4430', paper: '#6e675c', puddle: '#5a4c3e', puddleHi: '#8c7656', sheenA: 0.07,
    ash: '#76706a', ashA: 0.5, litterA: 0.85, soil: '#221b16', tuft: '#4a4232', iron: '#0f0c0b', ironHi: '#4a3f36', plinth: '#2e2824', plinthHi: '#4a413a', wood: '#35291f', woodHi: '#5a4636',
    edge: '#b08a5c', edgeA: 0.42, bin: '#1c1714', drain: '#0a0807', trunk: '#2a221c', trunkHi: '#5a4838',
  },
  clean: {
    paving: '#5a6a72', paving2: '#526169', joint: '#3a4850', crack: '#2c3840', kerbTop: '#a8b6b8', kerbFace: '#74868c',
    gutter: '#3a4d57', road: '#3c4a52', butt: '#d8d0b8', buttTip: '#b09870', paper: '#d8d4c4', puddle: '#7eaed0', puddleHi: '#e2f2fa', sheenA: 0.16,
    ash: '#c8d0d0', ashA: 0, litterA: 0, soil: '#4a3d33', tuft: '#6a5a46', iron: '#233038', ironHi: '#7a949a', plinth: '#94a0a0', plinthHi: '#d4dcd8', wood: '#8a6a48', woodHi: '#c8a474',
    edge: '#fff0c4', edgeA: 0.5, bin: '#3f5560', drain: '#26343c', trunk: '#4a3a30', trunkHi: '#b08a60',
  },
};

export const midPal = (mode) => MID[mode === 'smog' ? 'smog' : 'clean'];
export const nearPal = (mode) => NEAR[mode === 'smog' ? 'smog' : 'clean'];
