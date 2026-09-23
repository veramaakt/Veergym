import { html, DS, FILLS, pastel, useState, Icon, Switch } from "../ui.js";
import * as store from "../store.js";
import { WEEKDAYS, dateLong, dateShort, minutes, kg, volume, doneWorkouts, weekdayLabel, coachSummary } from "../logic.js";
import { startWorkout, saveActive } from "../session.js";
import { copyText } from "../clipboard.js";
import { foodSummary } from "../food.js";
import { nextMeasure, fmtDate, settings as appSettings, measureSummary } from "../measure.js";

const FOLDER_PLUS = html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2h9A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"></path><path d="M12 11v5M9.5 13.5h5"></path></svg>`;
const DAY_NAMES = { Ma: "Maandag", Di: "Dinsdag", Wo: "Woensdag", Do: "Donderdag", Vr: "Vrijdag", Za: "Zaterdag", Zo: "Zondag" };

export function sortTemplates(ts) {
  return [...ts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name)));
}

/** Eerstvolgende geplande training vanaf vandaag (binnen een week). */
function nextPlanned(templates, now = Date.now()) {
  for (let i = 0; i < 7; i++) {
    const day = weekdayLabel(now + i * 86400000);
    const t = sortTemplates(templates).find((t) => (t.days || []).includes(day));
    if (t) return { template: t, day, offset: i };
  }
  return null;
}

export function start(ctx, template) {
  if (ctx.active) {
    ctx.sheet(html`<${AlreadyActive} ctx=${ctx} template=${template} />`);
    return;
  }
  startWorkout(template, ctx.workouts);
  ctx.go("workout");
}

function AlreadyActive({ ctx, template }) {
  return html`<div>
    <div class="title">Er loopt al een workout</div>
    <div class="sub" style=${{ marginTop: 6 }}>${ctx.active.title} is nog bezig. Wil je die afmaken, of weggooien en ${template ? template.name : "een nieuwe"} starten?</div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${() => { saveActive(null); ctx.closeSheet(); startWorkout(template, ctx.workouts); ctx.go("workout"); }}>Weggooien en starten<//>
      <div class="flex1"></div>
      <${DS.Button} onClick=${() => { ctx.closeSheet(); ctx.go("workout"); }}>Verder<//>
    </div>
  </div>`;
}

function NewFolderSheet({ ctx }) {
  const [name, setName] = useState("");
  const save = () => {
    if (!name.trim()) return;
    store.put("folder", store.uid(), { name: name.trim(), order: Date.now() });
    ctx.closeSheet();
  };
  return html`<div>
    <div class="title">Nieuw mapje</div>
    <input class="field" style=${{ marginTop: 12 }} value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Naam, bijv. Split" autoFocus />
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><${DS.Button} disabled=${!name.trim()} onClick=${save}>Aanmaken<//></div>
  </div>`;
}

function CoachSheet({ ctx }) {
  const text = coachSummary(ctx.workouts, ctx.exById, 4) + measureSummary(4) + foodSummary(4);
  const [copied, setCopied] = useState(false);
  return html`<div>
    <div class="title">Samenvatting training</div>
    <div class="sub">Plak dit in je Claude-chat</div>
    <div class="coachbox">${text}</div>
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
      <${DS.Button} onClick=${async () => setCopied(await copyText(text))}>${copied ? "Gekopieerd" : "Kopiëren"}<//>
    </div>
  </div>`;
}

export function Home({ ctx }) {
  const { templates, folders, workouts, exById, active } = ctx;
  const [openMap, setOpenMap] = useState(() => store.getMeta("folderOpen", {}));
  const toggle = (id) => {
    const m = { ...openMap, [id]: !isOpen(id) };
    setOpenMap(m);
    store.setMeta("folderOpen", m);
  };

  const now = Date.now();
  // Het "huidige" mapje: blijft open, en de volgende training komt daaruit.
  const current = folders.find((f) => f.current);
  const planned = nextPlanned(current ? templates.filter((t) => t.folder === current.id) : templates, now);
  const setCurrent = (id, on) => {
    for (const f of folders) {
      const want = on && f.id === id;
      if (!!f.current !== want) store.update(f.id, { current: want });
    }
    setOpenMap({});
    store.setMeta("folderOpen", {});
  };
  const today = planned && planned.offset === 0;
  const recent = doneWorkouts(workouts).slice(0, 3);
  const measurePlan = nextMeasure();

  const newTemplate = () => {
    const id = store.uid();
    store.put("template", id, { name: "", folder: null, days: [], items: [], order: Date.now(), color: FILLS[templates.length % FILLS.length] });
    ctx.go("template", { id, isNew: true });
  };

  const groups = sortTemplates(folders).map((f) => ({ id: f.id, name: f.name, items: sortTemplates(templates.filter((t) => t.folder === f.id)) }));
  const loose = sortTemplates(templates.filter((t) => !t.folder || !folders.some((f) => f.id === t.folder)));
  if (loose.length || !groups.length) groups.push({ id: "_none", name: folders.length ? "Zonder mapje" : "Alle schema's", items: loose });
  // Mapjes staan standaard dicht, behalve het mapje met je volgende training (of als er maar één is).
  // Standaard: alleen het huidige mapje open. Geen huidig mapje? Dan dat met je volgende training.
  const isOpen = (id) => openMap[id] ?? (groups.length === 1 || (current ? id === current.id : !!groups.find((g) => g.id === id)?.items.some((t) => t.id === planned?.template.id)));

  let heroTitle = today ? "Trainingsdag" : "Rustdag";
  let panel;
  if (active) {
    heroTitle = "Bezig";
    panel = { label: "Workout loopt", name: active.title, btn: "Verder", onClick: () => ctx.go("workout") };
  } else if (planned) {
    const label = today ? "Vandaag" : planned.offset === 1 ? "Morgen" : DAY_NAMES[planned.day];
    panel = { label: today ? "Training van vandaag" : "Volgende training", name: `${label} · ${planned.template.name || "Naamloos"}`, btn: "Start", onClick: () => start(ctx, planned.template) };
  } else if (current && templates.some((t) => t.folder === current.id)) {
    const first = sortTemplates(templates.filter((t) => t.folder === current.id))[0];
    heroTitle = "Vandaag";
    panel = { label: `Uit je huidige schema · ${current.name}`, name: first.name || "Naamloos", btn: "Start", onClick: () => start(ctx, first) };
  } else {
    heroTitle = "Vandaag";
    panel = { label: templates.length ? "Geen dagen ingepland" : "Nog geen schema's", name: "Vrije training", btn: "Start", onClick: () => start(ctx, null) };
  }

  return html`<div class="page">
    <div class="row" style=${{ gap: 10 }}>
      <div class="flex1 title">Veergym</div>
      <button type="button" class="iconbtn" aria-label="Instellingen" onClick=${() => ctx.go("settings")} style=${{ marginRight: -5 }}><span class="avatar">V</span></button>
    </div>
    <div style=${{ marginTop: 2 }}><${DS.SyncStatus} mode=${ctx.sync.mode} /></div>

    <div class="hero" style=${{ marginTop: 20 }}>
      <div class="caption" style=${{ color: "#211a12" }}>${dateLong(now)}</div>
      <div style=${{ fontSize: "var(--display-lg-size)", lineHeight: "var(--display-lg-line)", fontWeight: 800, marginTop: 6 }}>${heroTitle}</div>
      <div style=${{ marginTop: 24 }}>
        <${DS.GlassPanel} tone="light" style=${{ color: "#211a12" }}>
          <div class="row">
            <div class="flex1">
              <div style=${{ fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)", fontWeight: 700 }}>${panel.label}</div>
              <div class="title">${panel.name}</div>
            </div>
            <${DS.Button} onClick=${panel.onClick} style=${{ background: "#211a12", color: "#ffffff" }}>${panel.btn}<//>
          </div>
        <//>
      </div>
    </div>

    ${measurePlan.due && appSettings().measureReminder !== false && html`<div class="row" style=${{ gap: 12, marginTop: 32 }}>
      <${DS.IconBadge} icon="scale" size=${34} fill="var(--accent-pink)" color="var(--accent-pink-ink)" />
      <div class="flex1">
        <div class="body">${measurePlan.missed ? "Meetmoment gemist" : "Meetmoment vandaag"}</div>
        <div class="sub">${measurePlan.last ? `Laatste meting ${fmtDate(measurePlan.last)}` : "Nog geen metingen"}</div>
      </div>
      <${DS.Chip} onClick=${() => ctx.go("measureEntry", {})}>Invullen<//>
    </div>`}

    <div style=${{ marginTop: 40 }}>
      <div class="row" style=${{ gap: 4 }}>
        <div class="flex1">
          <div class="title">Schema's</div>
          <div class="sub">Tik op een schema om het te bewerken</div>
        </div>
        <div style=${{ display: "flex", gap: 2, marginRight: -4 }}>
          <button type="button" class="iconbtn" aria-label="Nieuw mapje" title="Nieuw mapje" style=${{ color: "var(--ink)" }} onClick=${() => ctx.sheet(html`<${NewFolderSheet} ctx=${ctx} />`)}>${FOLDER_PLUS}</button>
          <button type="button" class="iconbtn" aria-label="Nieuw schema" title="Nieuw schema" style=${{ color: "var(--ink)" }} onClick=${newTemplate}>${Icon("plus", 20)}</button>
        </div>
      </div>
      ${groups.map((g) => {
        const open = isOpen(g.id);
        return html`<div key=${g.id} style=${{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 4 }}>
          <div class="row" style=${{ gap: 4 }}>
            <button type="button" class="plainbtn flex1" onClick=${() => toggle(g.id)} style=${{ minHeight: 44, display: "flex", alignItems: "center", gap: 8 }}>
              <span style=${{ display: "grid", placeItems: "center", color: "var(--ink-soft)", transform: open ? "none" : "rotate(-90deg)", transition: "transform .15s ease" }}>${Icon("chevron-down", 18)}</span>
              <span class="flex1" style=${{ display: "flex", flexDirection: "column" }}>
                <span class="body">${g.name}</span>
                <span class="sub">${g.items.length} ${g.items.length === 1 ? "schema" : "schema's"}${current?.id === g.id ? " · huidig" : ""}</span>
              </span>
            </button>
            ${g.id !== "_none" && html`<div class="row" style=${{ gap: 0, marginRight: -6 }}>
              <span class="caption" style=${{ letterSpacing: ".04em" }}>Huidig</span>
              <${Switch} on=${current?.id === g.id} label=${`${g.name} als huidig schema`} onChange=${(on) => setCurrent(g.id, on)} />
            </div>`}
          </div>
          ${open && html`<div>
            ${g.items.map((t, i) => html`<div key=${t.id} class="row" style=${{ padding: "6px 0" }}>
              <button type="button" class="plainbtn flex1" style=${{ minHeight: 48, display: "flex", alignItems: "center", gap: 12 }} onClick=${() => ctx.go("template", { id: t.id })}>
                <${DS.IconBadge} icon=${t.icon || "dumbbell"} size=${34} fill=${pastel(t.color) || FILLS[i % FILLS.length]} color="#211a12" />
                <span style=${{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span class="body">${t.name || "Naamloos schema"}</span>
                  <span class="sub">${[(t.days || []).filter((d) => WEEKDAYS.includes(d)).join(" · "), `${(t.items || []).length} oefeningen`].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
              <${DS.Chip} onClick=${() => start(ctx, t)}>Start<//>
            </div>`)}
            ${!g.items.length && html`<div class="sub" style=${{ padding: "4px 0 8px 26px" }}>${g.id === "_none" ? "Nog geen schema's. Tik op + om er een te maken." : "Leeg. Kies dit mapje bij het bewerken van een schema."}</div>`}
          </div>`}
        </div>`;
      })}
    </div>

    <div style=${{ marginTop: 48 }}>
      <div class="caption">Recent</div>
      <div style=${{ marginTop: 8 }}>
        ${recent.map((w, i) => html`<button type="button" key=${w.id} class="plainbtn" onClick=${() => ctx.go("summary", { id: w.id, readonly: true })}
          style=${{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: i ? "1px solid var(--border)" : "none", fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)" }}>
          <span style=${{ fontWeight: 800 }}>${w.title}</span>
          <span class="flex1" style=${{ fontWeight: 600, color: "var(--ink-soft)" }}>${dateShort(w.start)} · ${minutes(w.end - w.start)}</span>
          <span style=${{ fontWeight: 700 }}>${kg(volume(w, exById))}</span>
        </button>`)}
        ${!recent.length && html`<div class="sub">Nog geen trainingen. Je laatste drie komen hier te staan.</div>`}
      </div>
    </div>

    <div class="row" style=${{ borderTop: "1px solid var(--border)", marginTop: 32, paddingTop: 14, gap: 10 }}>
      <div class="flex1 sub">De laatste 4 weken als tekst voor je coach.</div>
      <${DS.Button} size="sm" onClick=${() => ctx.sheet(html`<${CoachSheet} ctx=${ctx} />`)}>Samenvatting kopiëren<//>
    </div>
  </div>`;
}
