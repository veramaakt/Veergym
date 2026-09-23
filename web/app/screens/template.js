import { html, DS, FILLS, pastel, useEffect, useState, Icon } from "../ui.js";
import * as store from "../store.js";
import { TYPES, WEEKDAYS, num, time, exMeta, hasValue } from "../logic.js";

const REST_OPTIONS = [null, 0, 30, 60, 90, 120, 180, 240];
// Iconen uit het design system die passen bij een schema.
const SCHEMA_ICONS = ["dumbbell", "trend", "bars", "radar", "repeat", "clock", "calendar", "home", "scale"];
const restLabel = (v) => (v === null ? "Standaard" : v === 0 ? "Geen" : time(v));

function parse(field, text) {
  const t = String(text).trim().replace(",", ".");
  if (t === "") return "";
  if (field.time && t.includes(":")) {
    const [m, s] = t.split(":");
    return Number(m || 0) * 60 + Number(s || 0);
  }
  const n = Number(t);
  return Number.isNaN(n) ? "" : n;
}
const show = (field, v) => (!hasValue(v) ? "" : field.time ? time(v) : num(v));

function DeleteSheet({ ctx, id }) {
  return html`<div>
    <div class="title">Schema verwijderen?</div>
    <div class="sub" style=${{ marginTop: 6 }}>Je gelogde workouts blijven bewaard.</div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${ctx.closeSheet}>Bewaren<//>
      <div class="flex1"></div>
      <${DS.Button} onClick=${() => { store.remove(id); ctx.closeSheet(); ctx.tab("home"); }}>Verwijderen<//>
    </div>
  </div>`;
}

export function TemplateEditor({ ctx, params }) {
  const t = store.get(params.id);
  const [look, setLook] = useState(false);
  useEffect(() => { if (!t) ctx.tab("home"); }, [t]);
  if (!t) return null;

  const items = t.items || [];
  const set = (patch) => store.update(t.id, patch);
  const setItems = (fn) => {
    const copy = JSON.parse(JSON.stringify(items));
    fn(copy);
    set({ items: copy });
  };
  const close = () => {
    if (params.isNew && !String(t.name || "").trim() && !items.length) store.remove(t.id);
    ctx.tab("home");
  };
  const days = t.days || [];

  return html`<div class="fill">
    <${DS.TopBar} title="Schema" leading="close" onLeading=${close} action=${html`<${DS.Button} onClick=${close}>Klaar<//>`} />
    <div class="scroll">
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div class="label" style=${{ marginTop: 0 }}>Naam</div>
        <input class="field big" value=${t.name || ""} placeholder="Bijv. Full Body A" onInput=${(e) => set({ name: e.target.value })} autoFocus=${!!params.isNew} />
        <div class="label">Dagen</div>
        <div class="chips">${WEEKDAYS.map((d) => html`<${DS.Chip} key=${d} selected=${days.includes(d)} onClick=${() => set({ days: days.includes(d) ? days.filter((x) => x !== d) : WEEKDAYS.filter((x) => x === d || days.includes(x)) })}>${d}<//>`)}</div>
        <div class="label">Mapje</div>
        <div class="chips">
          <${DS.Chip} selected=${!t.folder} onClick=${() => set({ folder: null })}>Geen<//>
          ${ctx.folders.map((f) => html`<${DS.Chip} key=${f.id} selected=${t.folder === f.id} onClick=${() => set({ folder: f.id })}>${f.name}<//>`)}
        </div>
        <div class="label">Icoon en kleur</div>
        <button type="button" class="plainbtn" onClick=${() => setLook(!look)} style=${{ minHeight: 48, display: "flex", alignItems: "center", gap: 12 }}>
          <${DS.IconBadge} icon=${t.icon || "dumbbell"} size=${40} fill=${pastel(t.color) || FILLS[0]} color="#211a12" />
          <span class="sub" style=${{ fontWeight: 700 }}>${look ? "Klaar met kiezen" : "Tik om te wijzigen"}</span>
        </button>
        ${look && html`<div>
          <div class="chips" style=${{ marginTop: 10 }}>${SCHEMA_ICONS.map((ic) => html`<button type="button" key=${ic} aria-label=${"Icoon " + ic} onClick=${() => set({ icon: ic })}
            style=${{ width: 44, height: 44, border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <span style=${{ width: 36, height: 36, borderRadius: 12, display: "grid", placeItems: "center", background: (t.icon || "dumbbell") === ic ? "var(--ink)" : "var(--surface-tint)", color: (t.icon || "dumbbell") === ic ? "var(--surface-primary)" : "var(--ink)" }}>${Icon(ic, 19)}</span>
          </button>`)}</div>
          <div class="chips" style=${{ marginTop: 6 }}>${FILLS.map((c) => html`<button type="button" key=${c} aria-label="Kleur" onClick=${() => set({ color: c })}
            style=${{ width: 44, height: 44, border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <span style=${{ width: 30, height: 30, borderRadius: 11, background: c, outline: (pastel(t.color) || FILLS[0]) === c ? "2px solid var(--ink)" : "none", outlineOffset: 2 }}></span>
          </button>`)}</div>
        </div>`}
      </div>

      <div class="section">
        <div class="title">Oefeningen</div>
        ${!items.length && html`<${DS.EmptyState} icon="dumbbell" title="Nog geen oefeningen" body="Voeg oefeningen toe uit de bibliotheek of maak een eigen oefening." />`}
        ${items.map((it, ii) => {
          const ex = ctx.exById[it.exercise] || { name: "Onbekende oefening" };
          const fields = TYPES[ex.type || "kg"].fields;
          const sets = it.sets || [];
          return html`<div key=${ii + ":" + it.exercise} style=${{ borderTop: "1px solid var(--border)", padding: "14px 0 6px", marginTop: 10 }}>
            <div class="row">
              <${DS.IconBadge} icon="dumbbell" size=${34} fill=${FILLS[ii % FILLS.length]} color="#211a12" />
              <div class="flex1">
                <div class="body">${ex.name}</div>
                <div class="sub">${exMeta(ex)}</div>
              </div>
              ${ii > 0 && html`<button type="button" class="iconbtn" aria-label="Omhoog" onClick=${() => setItems((x) => { [x[ii - 1], x[ii]] = [x[ii], x[ii - 1]]; })}
                ><span style=${{ transform: "rotate(180deg)", display: "grid" }}>${Icon("chevron-down", 18)}</span></button>`}
              <button type="button" class="iconbtn" aria-label="Oefening verwijderen" onClick=${() => setItems((x) => { x.splice(ii, 1); })}>${Icon("close", 16)}</button>
            </div>
            <div class="caption" style=${{ display: "flex", gap: 10, marginTop: 12, paddingBottom: 4 }}>
              <span style=${{ width: 22, flex: "none" }}>#</span>
              ${fields.map((f) => html`<span key=${f.k} class="flex1" style=${{ textAlign: "center" }}>${ex.type === "assist" && f.k === "w" ? "Assist" : f.label}</span>`)}
              <span style=${{ width: 44, flex: "none" }}></span>
            </div>
            ${sets.map((s, si) => html`<div key=${si + "/" + sets.length} style=${{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0" }}>
              <span style=${{ width: 22, flex: "none", fontSize: "var(--body-sm-size)", fontWeight: 800, color: "var(--ink-soft)" }}>${si + 1}</span>
              ${fields.map((f) => html`<input key=${f.k} class="cell" inputMode=${f.time ? "text" : "decimal"} placeholder=${f.time ? "0:00" : "–"} defaultValue=${show(f, s[f.k])}
                onChange=${(e) => setItems((x) => { x[ii].sets[si][f.k] = parse(f, e.target.value); })} />`)}
              <button type="button" class="iconbtn" aria-label="Set verwijderen" onClick=${() => setItems((x) => { x[ii].sets.splice(si, 1); })}>${Icon("close", 14)}</button>
            </div>`)}
            <${DS.Button} variant="quiet" onClick=${() => setItems((x) => { const last = x[ii].sets[x[ii].sets.length - 1] || {}; x[ii].sets = [...(x[ii].sets || []), { ...last }]; })}>${Icon("plus", 14)}Set toevoegen<//>
            <div class="caption" style=${{ margin: "6px 0 8px" }}>Rust na elke set</div>
            <div class="chips scrollx">${REST_OPTIONS.map((v) => html`<div key=${String(v)} style=${{ flex: "none" }}><${DS.Chip} selected=${(it.rest ?? null) === v} onClick=${() => setItems((x) => { x[ii].rest = v; })}>${restLabel(v)}<//></div>`)}</div>
          </div>`;
        })}
        <div style=${{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 10 }}>
          <${DS.Button} variant="quiet" onClick=${() => ctx.go("library", { mode: "add-template", templateId: t.id })}>${Icon("plus", 14)}Oefening toevoegen<//>
        </div>
      </div>

      <div class="section">
        <${DS.Button} style=${{ width: "100%" }} onClick=${close}>Klaar<//>
        <div class="sub" style=${{ textAlign: "center", marginTop: 8 }}>Je wijzigingen worden automatisch opgeslagen.</div>
        <div style=${{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <${DS.Button} variant="quiet" onClick=${() => ctx.sheet(html`<${DeleteSheet} ctx=${ctx} id=${t.id} />`)}>Schema verwijderen<//>
        </div>
      </div>
    </div>
  </div>`;
}
