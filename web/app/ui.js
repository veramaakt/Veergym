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
// Pastelvlakken met altijd donkere iconen erop; ook in donker thema licht (zie --fill-peach in app.css).
/** Opgeslagen kleur van een schema, omgezet naar de pastelvariant die in beide thema's licht blijft. */
export const pastel = (c) => (c === "var(--accent-peach)" ? "var(--fill-peach)" : c);
export const FILLS = ["var(--fill-peach)", "var(--accent-mint)", "var(--accent-blue-light)", "var(--accent-lavender)", "var(--accent-pink)"];

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

/** Aan/uit-schuifje (44px tikvlak). */
export function Switch({ on, onChange, label }) {
  return html`<button type="button" role="switch" aria-checked=${on} aria-label=${label} onClick=${() => onChange(!on)}
    style=${{ width: 52, height: 44, border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center", flex: "none" }}>
    <span style=${{ width: 38, height: 22, borderRadius: "var(--radius-pill)", background: on ? "var(--ink)" : "var(--surface-tint)", border: on ? "1px solid var(--ink)" : "1px solid var(--border)", position: "relative", transition: "background .15s ease" }}>
      <span style=${{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: on ? "var(--surface-primary)" : "var(--ink-soft)", transition: "left .15s ease" }}></span>
    </span>
  </button>`;
}
