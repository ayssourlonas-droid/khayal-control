// The keys the game and every menu share (DOM-free).
//   MOVE[code] -> [dx, dy]   arrows and WASD     isConfirm(code)  Enter, NumpadEnter, Space
//   isBack(code)             Escape, Backspace
export const MOVE = {
  ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
  ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1],
};
export const isConfirm = (code) => code === 'Enter' || code === 'NumpadEnter' || code === 'Space';
export const isBack = (code) => code === 'Escape' || code === 'Backspace';
