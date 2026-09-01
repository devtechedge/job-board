const DROP_MS = 680;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function spawnDrop(target: HTMLElement, clientX: number, clientY: number): void {
  if (prefersReducedMotion()) return;
  const rect = target.getBoundingClientRect();
  const drop = document.createElement("span");
  drop.className = "water-drop";
  drop.style.left = `${clientX - rect.left}px`;
  drop.style.top = `${clientY - rect.top}px`;
  target.appendChild(drop);
  window.setTimeout(() => drop.remove(), DROP_MS);
}

export function onPressDrop(event: { currentTarget: EventTarget; clientX: number; clientY: number }): void {
  const node = event.currentTarget;
  if (!(node instanceof HTMLElement)) return;
  spawnDrop(node, event.clientX, event.clientY);
}

export function attachScrollParallax(): () => void {
  if (typeof window === "undefined" || prefersReducedMotion()) return () => undefined;
  const root = document.documentElement;
  let frame = 0;
  const tick = () => {
    frame = 0;
    const y = Math.min(window.scrollY, 220);
    root.style.setProperty("--parallax-y", y.toFixed(1));
  };
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(tick);
  };
  tick();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    root.style.removeProperty("--parallax-y");
  };
}
