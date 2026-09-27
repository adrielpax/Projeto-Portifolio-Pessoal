export const input = {
  keys: new Set(),
  pressed: new Set(),
  mouse: { x: 0, y: 0, left: false, right: false },
  clicks: [], // cliques deste frame (para a UI)
  wheel: 0,
  typing: false,
};

const BLOCK = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
const isTyping = (e) => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

export function initInput(canvas) {
  addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    if (BLOCK.includes(e.code)) e.preventDefault();
    if (!input.keys.has(e.code)) input.pressed.add(e.code);
    input.keys.add(e.code);
  });
  addEventListener('keyup', (e) => input.keys.delete(e.code));
  addEventListener('blur', () => {
    input.keys.clear();
    input.mouse.left = input.mouse.right = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
  });
  canvas.addEventListener('mousedown', (e) => {
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
    if (e.button === 0) input.mouse.left = true;
    if (e.button === 2) input.mouse.right = true;
    input.clicks.push({ button: e.button, cx: e.clientX, cy: e.clientY, shift: e.shiftKey });
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  });
  addEventListener('mouseup', (e) => {
    if (e.button === 0) input.mouse.left = false;
    if (e.button === 2) input.mouse.right = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => { input.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
}

export function endFrame() {
  input.pressed.clear();
  input.clicks.length = 0;
  input.wheel = 0;
}
