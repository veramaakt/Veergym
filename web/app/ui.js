// Gedeelde hulpmiddelen voor alle schermen: React, htm (JSX zonder bouwstap)
// en de componenten uit het design system.
const R = window.React;
export const { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } = R;
export const html = window.htm.bind(R.createElement);
export const DS = window.DesignSystem_de9512;
export const Fragment = R.Fragment;
// Demo-stand: zonder server en inlog, met voorbeelddata (zie tools/build_demo.py).
export const DEMO = !!window.VEERGYM_DEMO;

// Oefening-kleuren, in vaste volgorde (design: FILLS).
export const FILLS = ["var(--accent-peach)", "var(--accent-mint)", "var(--accent-blue-light)", "var(--accent-lavender)", "var(--accent-pink)"];

export function Sheet({ onClose, children }) {
  return html`<div class="sheet-wrap">
    <div class="sheet-backdrop" onClick=${onClose}></div>
    <div class="sheet" role="dialog"><div class="sheet-grip"></div>${children}</div>
  </div>`;
}

export function Icon(name, size = 16) {
  return html`<${DS.Icon} name=${name} size=${size} />`;
}

export function useTick(active, ms = 250) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [active, ms]);
}
