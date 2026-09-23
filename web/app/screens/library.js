import { html, DS, useState, Icon } from "../ui.js";
import * as store from "../store.js";
import { TYPES, GROUPS, exMeta } from "../logic.js";
import { getActive, saveActive, newItem } from "../session.js";

const TITLES = { browse: "Oefeningen", "add-template": "Oefening toevoegen", "add-workout": "Oefening toevoegen", swap: "Oefening wisselen" };

function choose(ctx, params, ex) {
  const mode = params.mode || "browse";
  if (mode === "browse") return ctx.go("exercise", { id: ex.id });
  if (mode === "add-template") {
    const t = store.get(params.templateId);
    if (t) {
      const item = newItem(ex.id, ctx.workouts);
      store.update(t.id, { items: [...(t.items || []), { exercise: ex.id, rest: null, sets: item.sets.map(() => ({})) }] });
    }
  } else {
    const a = getActive();
    if (a) {
      const item = newItem(ex.id, ctx.workouts);
      if (mode === "swap") {
        item.rest = a.items[params.itemIdx]?.rest ?? null;
        a.items[params.itemIdx] = item;
      } else {
        a.items.push(item);
        a.exIdx = a.items.length - 1;
      }
      saveActive({ ...a });
    }
  }
  ctx.back();
}

export function CustomExerciseSheet({ ctx, initialName = "", onCreated }) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState("kg");
  const [group, setGroup] = useState(null);
  const [equip, setEquip] = useState("");
  const [note, setNote] = useState("");
  const valid = name.trim() && group;
  const save = () => {
    if (!valid) return;
    const id = store.uid();
    store.put("exercise", id, { name: name.trim(), group, equip: equip.trim(), type, note, custom: true });
    ctx.closeSheet();
    onCreated && onCreated({ id, name, type, group });
  };
  return html`<div>
    <div class="title">Eigen oefening</div>
    <input class="field" style=${{ marginTop: 12 }} value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Naam, bijv. Hip Abduction (Machine)" />
    <div class="label">Type</div>
    <div class="chips">${Object.entries(TYPES).map(([k, v]) => html`<${DS.Chip} key=${k} selected=${type === k} onClick=${() => setType(k)}>${v.label}<//>`)}</div>
    <div class="label">Spiergroep</div>
    <div class="chips">${GROUPS.map((g) => html`<${DS.Chip} key=${g} selected=${group === g} onClick=${() => setGroup(g)}>${g}<//>`)}</div>
    <input class="field" style=${{ marginTop: 16 }} value=${equip} onInput=${(e) => setEquip(e.target.value)} placeholder="Apparatuur, bijv. Machine of Kabel" />
    <input class="field" style=${{ marginTop: 8 }} value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="Vaste notitie (stoelstand, repbereik)" />
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><${DS.Button} disabled=${!valid} onClick=${save}>Toevoegen<//></div>
  </div>`;
}

export function Library({ ctx, params }) {
  const mode = params.mode || "browse";
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("Alle");
  const needle = q.trim().toLowerCase();
  const rows = ctx.exercises
    .filter((e) => (group === "Alle" ? true : group === "Eigen" ? e.custom : e.group === group))
    .filter((e) => !needle || e.name.toLowerCase().includes(needle) || (e.group || "").toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));

  const custom = () => ctx.sheet(html`<${CustomExerciseSheet} ctx=${ctx} initialName=${q} onCreated=${(ex) => choose(ctx, params, ex)} />`);

  return html`<div class="fill">
    <${DS.TopBar} title=${TITLES[mode]} leading="close" onLeading=${ctx.back} />
    <div style=${{ padding: "0 16px" }}>
      <div class="row" style=${{ gap: 8, background: "var(--surface-tint)", borderRadius: "var(--radius-md)", padding: "0 12px", color: "var(--ink-soft)" }}>
        ${Icon("search", 17)}
        <input value=${q} onInput=${(e) => setQ(e.target.value)} placeholder="Zoek oefening"
          style=${{ flex: 1, minWidth: 0, height: 44, border: "none", background: "transparent", fontFamily: "inherit", fontSize: "var(--body-md-size)", fontWeight: 700, outline: "none" }} />
      </div>
      <div class="chips scrollx" style=${{ margin: "10px -16px 0 0", paddingBottom: 6 }}>
        ${["Alle", ...GROUPS, "Eigen"].map((g) => html`<div key=${g} style=${{ flex: "none" }}><${DS.Chip} selected=${group === g} onClick=${() => setGroup(g)}>${g}<//></div>`)}
      </div>
    </div>
    <div class="scroll" style=${{ paddingTop: 4 }}>
      ${rows.map((e) => html`<button type="button" key=${e.id} class="plainbtn" onClick=${() => choose(ctx, params, e)}
        style=${{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border)", padding: "8px 0" }}>
        <${DS.IconBadge} icon="dumbbell" size=${34} />
        <span class="flex1" style=${{ display: "flex", flexDirection: "column" }}>
          <span class="body">${e.name}</span>
          <span class="sub">${exMeta(e)}${e.type === "assist" ? " · assisted" : ""}</span>
        </span>
        ${mode !== "browse" && html`<span style=${{ color: "var(--ink-soft)", display: "grid", placeItems: "center", width: 28 }}>${Icon("plus", 16)}</span>`}
      </button>`)}
      ${!rows.length && html`<${DS.EmptyState} icon="search" title="Niets gevonden" body="Maak hem aan als eigen oefening." />`}
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <${DS.Button} variant="quiet" onClick=${custom}>${Icon("plus", 14)}Eigen oefening<//>
      </div>
    </div>
  </div>`;
}
