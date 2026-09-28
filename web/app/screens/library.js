import { html, DS, useState, Icon, SearchField } from "../ui.js";
import * as store from "../store.js";
import { TYPES, GROUPS, exMeta, sortByRole, ROLES } from "../logic.js";
import { getActive, saveActive, newItem } from "../session.js";

const TITLES = { browse: "Oefeningen", "add-template": "Oefeningen toevoegen", "add-workout": "Oefeningen toevoegen", swap: "Oefening wisselen" };

/** Eén of meer oefeningen toevoegen aan een schema of de lopende workout (in de volgorde van aantikken). */
function addMany(ctx, params, ids) {
  const mode = params.mode;
  if (mode === "add-template") {
    const t = store.get(params.templateId);
    if (t) {
      const role = params.role && params.role !== "main" ? { role: params.role } : {};
      // Warming-up en cooling-down: standaard één set (bijv. 5 minuten fietsen).
      const added = ids.map((id) => ({ exercise: id, rest: null, sets: role.role ? [{}] : newItem(id, ctx.workouts).sets.map(() => ({})), ...role }));
      store.update(t.id, { items: sortByRole([...(t.items || []), ...added]) });
    }
  } else if (mode === "add-workout") {
    const a = getActive();
    if (a) {
      const first = a.items.length;
      for (const id of ids) a.items.push(newItem(id, ctx.workouts));
      a.exIdx = first;
      saveActive({ ...a });
    }
  }
  ctx.back();
}

function choose(ctx, params, ex) {
  const mode = params.mode || "browse";
  if (mode === "browse") return ctx.go("exercise", { id: ex.id });
  if (mode === "swap") {
    const a = getActive();
    if (a) {
      const item = newItem(ex.id, ctx.workouts);
      const old = a.items[params.itemIdx] || {};
      item.rest = old.rest ?? null;
      if (old.role) item.role = old.role;
      a.items[params.itemIdx] = item;
      saveActive({ ...a });
    }
    return ctx.back();
  }
  addMany(ctx, params, [ex.id]);
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
  const multi = mode === "add-template" || mode === "add-workout";
  const [picked, setPicked] = useState([]);
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("Alle");
  const needle = q.trim().toLowerCase();
  const rows = ctx.exercises
    .filter((e) => (group === "Alle" ? true : group === "Eigen" ? e.custom : group === "Overig" ? !GROUPS.includes(e.group) : e.group === group))
    .filter((e) => !needle || e.name.toLowerCase().includes(needle) || (e.group || "").toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));

  const custom = () => ctx.sheet(html`<${CustomExerciseSheet} ctx=${ctx} initialName=${q} onCreated=${(ex) => (multi ? setPicked((p) => [...p, ex.id]) : choose(ctx, params, ex))} />`);
  const roleName = mode === "add-template" && params.role && params.role !== "main" ? ROLES.find((r) => r.id === params.role)?.label : null;

  return html`<div class="fill">
    <${DS.TopBar} title=${roleName ? roleName + " toevoegen" : TITLES[mode]} leading="close" onLeading=${ctx.back} />
    ${multi && html`<div class="sub" style=${{ padding: "0 16px 8px" }}>Tik de oefeningen aan die je wilt toevoegen, in de volgorde die je wilt.</div>`}
    <div style=${{ padding: "0 16px" }}>
      <${SearchField} value=${q} onChange=${setQ} placeholder="Zoek oefening" />
      <div class="chips scrollx" style=${{ margin: "10px -16px 0 0", paddingBottom: 6 }}>
        ${["Alle", ...GROUPS, "Eigen", ...(ctx.exercises.some((e) => !GROUPS.includes(e.group)) ? ["Overig"] : [])].map((g) => html`<div key=${g} style=${{ flex: "none" }}><${DS.Chip} selected=${group === g} onClick=${() => setGroup(g)}>${g}<//></div>`)}
      </div>
    </div>
    <div class="scroll" style=${{ paddingTop: 4 }}>
      ${rows.map((e) => {
        const n = picked.indexOf(e.id) + 1;
        return html`<button type="button" key=${e.id} class="plainbtn" onClick=${() => (multi ? toggle(e.id) : choose(ctx, params, e))} aria-pressed=${multi ? n > 0 : undefined}
          style=${{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border)", padding: "8px 0" }}>
          <${DS.IconBadge} icon="dumbbell" size=${34} />
          <span class="flex1" style=${{ display: "flex", flexDirection: "column" }}>
            <span class="body">${e.name}</span>
            <span class="sub">${exMeta(e)}${e.type === "assist" ? " · assisted" : ""}</span>
          </span>
          ${multi
            ? html`<span style=${{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", fontSize: "var(--body-sm-size)", fontWeight: 800,
                background: n ? "var(--ink)" : "transparent", color: n ? "var(--surface-primary)" : "var(--ink-soft)", border: n ? "none" : "1.5px solid var(--border)" }}>${n || ""}</span>`
            : mode !== "browse" && html`<span style=${{ color: "var(--ink-soft)", display: "grid", placeItems: "center", width: 28 }}>${Icon("plus", 16)}</span>`}
        </button>`;
      })}
      ${!rows.length && html`<${DS.EmptyState} icon="search" title="Niets gevonden" body="Maak hem aan als eigen oefening." />`}
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <${DS.Button} variant="quiet" onClick=${custom}>${Icon("plus", 14)}Eigen oefening<//>
      </div>
    </div>
    ${multi && picked.length > 0 && html`<div class="dock" style=${{ paddingTop: 10, borderTop: "1px solid var(--border)" }}>
      <${DS.Button} style=${{ width: "100%" }} onClick=${() => addMany(ctx, params, picked)}>${picked.length === 1 ? "1 oefening toevoegen" : picked.length + " oefeningen toevoegen"}<//>
    </div>`}
  </div>`;
}
