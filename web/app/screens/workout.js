import { html, DS, Fragment, FILLS, useState, useEffect, useRef, useTick, Icon } from "../ui.js";
import * as store from "../store.js";
import { TYPES, SET_TYPES, num, time, kg, fmtSet, exMeta, hasValue, previousSets, exerciseHistory, prsFor, volume } from "../logic.js";
import { getActive, saveActive, fillFromPrevious, finishWorkout, restDefault } from "../session.js";

/** Wijzig de lopende workout; leest altijd de nieuwste versie. */
function mutate(fn) {
  const a = getActive();
  if (!a) return;
  const copy = JSON.parse(JSON.stringify(a));
  fn(copy);
  saveActive(copy);
}

const typeOf = (ctx, item) => ctx.exById[item.exercise]?.type || "kg";

function parseValue(field, text) {
  const t = String(text).trim().replace(",", ".");
  if (t === "") return "";
  if (field.time && t.includes(":")) {
    const [m, s] = t.split(":");
    return Number(m || 0) * 60 + Number(s || 0);
  }
  const n = Number(t);
  return Number.isNaN(n) ? "" : n;
}
const showValue = (field, v) => (!hasValue(v) ? "" : field.time ? time(v) : num(v));

function doneSetsThisSession(a, exerciseId, uptoItem, uptoSet) {
  const out = [];
  a.items.forEach((it, ii) => {
    if (it.exercise !== exerciseId) return;
    it.sets.forEach((s, si) => {
      if (s.done && (ii < uptoItem || (ii === uptoItem && si !== uptoSet))) out.push(s);
    });
  });
  return out;
}

/** Set afvinken of weer openzetten. Geeft false als er niets in te vullen viel. */
export function toggleSet(ctx, itemIdx, setIdx) {
  const a = getActive();
  const item = a.items[itemIdx];
  const s = item.sets[setIdx];
  if (s.done) {
    mutate((x) => { x.items[itemIdx].sets[setIdx].done = false; });
    return true;
  }
  const ex = ctx.exById[item.exercise] || {};
  const type = ex.type || "kg";
  const prev = previousSets(ctx.workouts, item.exercise);
  const filled = fillFromPrevious(s, prev[setIdx] || prev[prev.length - 1]);
  if (!TYPES[type].fields.some((f) => hasValue(filled[f.k]))) return false;

  const history = exerciseHistory(ctx.workouts, item.exercise).flatMap((h) => h.sets);
  // Eerste keer deze oefening? Dan nog geen records melden.
  const labels = history.length ? prsFor(type, filled, history.concat(doneSetsThisSession(a, item.exercise, itemIdx, setIdx))) : [];
  const rest = item.rest ?? ex.rest ?? restDefault();
  mutate((x) => {
    x.items[itemIdx].sets[setIdx] = { ...filled, done: true };
    if (rest > 0) {
      x.restEnd = Date.now() + rest * 1000;
      x.restTotal = rest * 1000;
    }
  });
  if (labels.length) ctx.toast({ title: "Nieuw record", detail: `${ex.name} · ${fmtSet(type, filled)} · ${labels.join(", ")}`, icon: "trend" });
  return true;
}

// ---------- sheets ----------

function SetSheet({ ctx, itemIdx, setIdx }) {
  const a = getActive();
  const item = a.items[itemIdx];
  const ex = ctx.exById[item.exercise] || {};
  const type = ex.type || "kg";
  const fields = TYPES[type].fields;
  const prev = previousSets(ctx.workouts, item.exercise);
  const p = prev[setIdx] || prev[prev.length - 1] || {};
  const [s, setS] = useState(() => ({ ...item.sets[setIdx] }));
  const [text, setText] = useState(() => Object.fromEntries(fields.map((f) => [f.k, showValue(f, item.sets[setIdx][f.k])])));

  const setField = (f, v) => {
    setS((x) => ({ ...x, [f.k]: v }));
    setText((t) => ({ ...t, [f.k]: showValue(f, v) }));
  };
  const step = (f, dir) => {
    const base = hasValue(s[f.k]) ? Number(s[f.k]) : hasValue(p[f.k]) ? Number(p[f.k]) : 0;
    setField(f, Math.max(0, Math.round((base + dir * f.step) * 100) / 100));
  };
  const save = (andDone) => {
    mutate((x) => { x.items[itemIdx].sets[setIdx] = { ...x.items[itemIdx].sets[setIdx], ...s, done: x.items[itemIdx].sets[setIdx].done }; });
    ctx.closeSheet();
    if (andDone && !s.done) toggleSet(ctx, itemIdx, setIdx);
  };
  const del = () => {
    mutate((x) => { x.items[itemIdx].sets.splice(setIdx, 1); });
    ctx.closeSheet();
  };

  return html`<div>
    <div class="title">Set ${setIdx + 1} · ${ex.name}</div>
    <div class="sub">Vorige keer: ${fmtSet(type, p) || "–"}</div>
    <div style=${{ display: "flex", gap: 16, marginTop: 16 }}>
      ${fields.map((f) => html`<div key=${f.k} class="flex1">
        <div class="caption">${type === "assist" && f.k === "w" ? "Assist (kg)" : f.label}</div>
        <div style=${{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <button type="button" class="stepper-btn" aria-label="Minder" onClick=${() => step(f, -1)}>−</button>
          <input class="stepper-val" inputMode=${f.time ? "text" : "decimal"} value=${text[f.k]} placeholder=${showValue(f, p[f.k]) || "–"}
            onInput=${(e) => { const v = e.target.value; setText((t) => ({ ...t, [f.k]: v })); setS((x) => ({ ...x, [f.k]: parseValue(f, v) })); }} />
          <button type="button" class="stepper-btn" aria-label="Meer" onClick=${() => step(f, 1)}>+</button>
        </div>
      </div>`)}
    </div>
    <div class="label">Type set</div>
    <div class="chips">${SET_TYPES.map((t) => html`<${DS.Chip} key=${t.id} selected=${(s.type || "normal") === t.id} onClick=${() => setS((x) => ({ ...x, type: t.id }))}>${t.label}<//>`)}</div>
    <div style=${{ marginTop: 16 }}><${DS.RpeInput} value=${s.rpe} onChange=${(v) => setS((x) => ({ ...x, rpe: v }))} /></div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${del}>Verwijderen<//>
      <div class="flex1"></div>
      <${DS.Button} variant="quiet" onClick=${() => save(false)}>Opslaan<//>
      ${!item.sets[setIdx].done && html`<${DS.Button} onClick=${() => save(true)}>Afvinken<//>`}
    </div>
  </div>`;
}

function NoteSheet({ ctx, exerciseId }) {
  const ex = ctx.exById[exerciseId];
  const [note, setNote] = useState(ex?.note || "");
  return html`<div>
    <div class="title">Vaste notitie</div>
    <div class="sub">Elke sessie zichtbaar bij ${ex?.name}</div>
    <textarea class="field" style=${{ marginTop: 12 }} value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="Stoelstand, repbereik, aanwijzingen"></textarea>
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
      <${DS.Button} onClick=${() => { store.update(exerciseId, { note }); ctx.closeSheet(); }}>Opslaan<//>
    </div>
  </div>`;
}

const REST_OPTIONS = [null, 0, 30, 60, 90, 120, 150, 180, 240];
const restLabel = (v) => (v === null ? "Standaard" : v === 0 ? "Geen" : time(v));

function ExMenu({ ctx, itemIdx }) {
  const a = getActive();
  const item = a.items[itemIdx];
  const ex = ctx.exById[item.exercise] || {};
  const go = (fn) => () => { ctx.closeSheet(); fn(); };
  const rows = [
    { icon: "trend", label: "Spieren en geschiedenis", go: go(() => ctx.go("exercise", { id: item.exercise })) },
    { icon: "repeat", label: "Oefening wisselen", go: go(() => ctx.go("library", { mode: "swap", itemIdx })) },
    { icon: "kebab", label: "Vaste notitie bewerken", go: () => ctx.sheet(html`<${NoteSheet} ctx=${ctx} exerciseId=${item.exercise} />`) },
    { icon: "skip", label: "Overslaan, naar de volgende", go: go(() => mutate((x) => { x.exIdx = Math.min(x.items.length - 1, itemIdx + 1); })) },
    { icon: "close", label: "Verwijderen uit deze workout", go: go(() => mutate((x) => { x.items.splice(itemIdx, 1); x.exIdx = Math.max(0, Math.min(x.exIdx, x.items.length - 1)); })) },
  ];
  return html`<div>
    <div class="title" style=${{ marginBottom: 6 }}>${ex.name}</div>
    ${rows.map((o) => html`<button type="button" key=${o.label} class="plainbtn" onClick=${o.go}
      style=${{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border)", fontSize: "var(--body-md-size)", fontWeight: 700 }}>
      <span style=${{ color: "var(--ink-soft)", display: "grid", placeItems: "center", width: 24 }}>${Icon(o.icon, 18)}</span>${o.label}
    </button>`)}
    <div class="label">Rust na elke set</div>
    <div class="chips">${REST_OPTIONS.map((v) => html`<${DS.Chip} key=${String(v)} selected=${(item.rest ?? null) === v} onClick=${() => { mutate((x) => { x.items[itemIdx].rest = v; }); ctx.closeSheet(); }}>${restLabel(v)}<//>`)}</div>
  </div>`;
}

function AbortSheet({ ctx }) {
  return html`<div>
    <div class="title">Workout afbreken?</div>
    <div class="sub" style=${{ fontSize: "var(--body-md-size)", lineHeight: "var(--body-md-line)", marginTop: 6 }}>Er wordt niets opgeslagen. Je sets en de tijd verdwijnen.</div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${ctx.closeSheet}>Doorgaan<//>
      <div class="flex1"></div>
      <${DS.Button} onClick=${() => { ctx.closeSheet(); saveActive(null); ctx.tab("home"); }}>Afbreken<//>
    </div>
  </div>`;
}

function NothingDoneSheet({ ctx }) {
  return html`<div>
    <div class="title">Nog geen sets afgevinkt</div>
    <div class="sub" style=${{ marginTop: 6 }}>Alleen afgevinkte sets worden bewaard. Vink je sets af, of breek de workout af.</div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${() => ctx.sheet(html`<${AbortSheet} ctx=${ctx} />`)}>Afbreken<//>
      <div class="flex1"></div>
      <${DS.Button} onClick=${ctx.closeSheet}>Verder loggen<//>
    </div>
  </div>`;
}

// ---------- scherm ----------

function Check({ done, onClick }) {
  return html`<button type="button" class=${"check" + (done ? " on" : "")} aria-label=${done ? "Set voltooid" : "Set afvinken"} onClick=${onClick}>
    <span>${Icon("check", 15)}</span>
  </button>`;
}

function setIndexLabel(sets, i) {
  const s = sets[i];
  if (s.type && s.type !== "normal") return html`<${DS.SetTypeBadge} type=${s.type} />`;
  return sets.slice(0, i + 1).filter((x) => !x.type || x.type === "normal").length;
}

export function Workout({ ctx }) {
  const a = ctx.active;
  useTick(!!a, 1000);
  useEffect(() => { if (!a) ctx.replace("home"); }, [a]);
  if (!a) return null;

  const now = Date.now();
  if (!a.items.length) {
    return html`<div class="fill">
      <${DS.TopBar} title=${a.title} leading="collapse" onLeading=${() => ctx.tab("home")} />
      <div class="scroll">
        <${DS.EmptyState} icon="dumbbell" title="Nog geen oefeningen" body="Voeg een oefening toe om te beginnen." action="Oefening toevoegen" onAction=${() => ctx.go("library", { mode: "add-workout" })} />
        <div style=${{ display: "flex", justifyContent: "center" }}><${DS.Button} variant="quiet" onClick=${() => ctx.sheet(html`<${AbortSheet} ctx=${ctx} />`)}>Workout afbreken<//></div>
      </div>
    </div>`;
  }

  const idx = Math.min(a.exIdx, a.items.length - 1);
  const item = a.items[idx];
  const ex = ctx.exById[item.exercise] || { name: "Onbekende oefening" };
  const type = ex.type || "kg";
  const fields = TYPES[type].fields;
  const prev = previousSets(ctx.workouts, item.exercise);
  const allSets = a.items.flatMap((it) => it.sets);
  const doneCount = allSets.filter((s) => s.done).length;
  const vol = volume({ items: a.items.map((it) => ({ exercise: it.exercise, sets: it.sets.filter((s) => s.done) })) }, ctx.exById);
  const resting = a.restEnd > now;

  const openSet = (i) => ctx.sheet(html`<${SetSheet} ctx=${ctx} itemIdx=${idx} setIdx=${i} />`);
  const toggle = (i) => { if (!toggleSet(ctx, idx, i)) openSet(i); };
  const addSet = () => mutate((x) => {
    const sets = x.items[idx].sets;
    const last = sets[sets.length - 1] || {};
    sets.push({ w: last.w ?? "", r: last.r ?? "", dur: last.dur ?? "", dist: last.dist ?? "", type: "normal", rpe: null, done: false });
  });
  const finish = () => {
    if (!doneCount) return ctx.sheet(html`<${NothingDoneSheet} ctx=${ctx} />`);
    const id = finishWorkout(getActive());
    ctx.tab("home");
    ctx.go("summary", { id });
  };

  return html`<div class="fill">
    <${DS.TopBar} title=${a.title} leading="collapse" onLeading=${() => ctx.tab("home")}
      action=${html`<${DS.Button} onClick=${finish}>Voltooien<//>`} progress=${resting ? (a.restEnd - now) / a.restTotal : null} />
    <div class="scroll" style=${{ paddingBottom: 16 }}>
      <div style=${{ borderTop: "1px solid var(--border)", padding: "12px 0 14px" }}>
        <${DS.StatStrip} items=${[{ label: "Duur", value: time((now - a.start) / 1000) }, { label: "Volume", value: kg(vol) }, { label: "Sets", value: `${doneCount} / ${allSets.length}` }]} />
        ${ctx.sync.mode === "offline" && html`<div style=${{ marginTop: 10 }}><${DS.SyncStatus} mode="offline" /></div>`}
      </div>
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div class="caption" style=${{ marginBottom: 10 }}>Oefening ${idx + 1} van ${a.items.length}</div>
        <${DS.ExerciseHeader} name=${ex.name} meta=${exMeta(ex)} target=${ex.target ? "Doel " + ex.target : null} note=${ex.note || null}
          badgeFill=${FILLS[idx % FILLS.length]} onMenu=${() => ctx.sheet(html`<${ExMenu} ctx=${ctx} itemIdx=${idx} />`)} />
        ${type === "assist" && html`<div class="sub" style=${{ marginTop: 8 }}>Het gewicht is de assist. Lager is beter.</div>`}

        <div class="caption" style=${{ display: "flex", gap: 10, padding: "14px 10px 4px" }}>
          <span style=${{ width: 22, flex: "none" }}>#</span><span class="flex1">Vorige</span>
          ${fields.map((f) => html`<span key=${f.k} style=${{ width: 58, flex: "none", textAlign: "center" }}>${type === "assist" && f.k === "w" ? "Assist" : f.label}</span>`)}
          <span style=${{ width: 44, flex: "none" }}></span>
        </div>
        ${item.sets.map((s, i) => html`<div key=${i} class="altrow" style=${{ marginTop: 4, background: s.done ? "var(--accent-mint-soft)" : "transparent" }}>
          <div style=${{ width: 22, flex: "none", fontSize: "var(--body-sm-size)", fontWeight: 700, color: "var(--ink-soft)" }}>${setIndexLabel(item.sets, i)}</div>
          <div class="flex1 sub">${fmtSet(type, prev[i], true) || "–"}</div>
          ${fields.map((f) => html`<${DS.ValueField} key=${f.k} value=${showValue(f, s[f.k])} placeholder=${showValue(f, (prev[i] || {})[f.k]) || "–"} active=${s.done} onClick=${() => openSet(i)} />`)}
          <${Check} done=${s.done} onClick=${() => toggle(i)} />
        </div>`)}
        <div style=${{ padding: "10px 10px 0" }}>
          <${DS.Button} variant="quiet" onClick=${addSet}>${Icon("plus", 14)}Set toevoegen<//>
        </div>
      </div>

      <div style=${{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 14 }}>
        <div class="caption">Oefeningen</div>
        <div class="chips" style=${{ marginTop: 10, gap: 8 }}>
          ${a.items.map((it, i) => {
            if (i === idx) return null;
            const allDone = it.sets.length && it.sets.every((s) => s.done);
            return html`<${DS.NextUpPill} key=${i} label=${ctx.exById[it.exercise]?.name || "?"} fill=${allDone ? "var(--accent-mint-soft)" : FILLS[i % FILLS.length]} color="#211a12"
              onClick=${() => mutate((x) => { x.exIdx = i; })} />`;
          })}
        </div>
        <div style=${{ marginTop: 6 }}><${DS.Button} variant="quiet" onClick=${() => ctx.go("library", { mode: "add-workout" })}>${Icon("plus", 14)}Oefening toevoegen<//></div>
      </div>
      <div style=${{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 12, display: "flex", justifyContent: "center" }}>
        <${DS.Button} variant="quiet" onClick=${() => ctx.sheet(html`<${AbortSheet} ctx=${ctx} />`)}>Workout afbreken<//>
      </div>
    </div>
  </div>`;
}

/** Rustbalk en "Bezig"-balk onderin, op elk scherm. */
export function WorkoutDock({ ctx, onWorkout }) {
  const a = ctx.active;
  useTick(!!a, 250);
  const fired = useRef(0);
  const now = Date.now();
  const resting = a && a.restEnd > now;

  useEffect(() => {
    if (a && a.restEnd && now >= a.restEnd && fired.current !== a.restEnd) {
      fired.current = a.restEnd;
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
      mutate((x) => { x.restEnd = 0; });
    }
  });
  if (!a) return null;

  return html`<${Fragment}>
    ${resting && html`<${DS.RestTimerBar} time=${time((a.restEnd - now) / 1000)}
      onMinus=${() => mutate((x) => { x.restEnd -= 15000; })}
      onPlus=${() => mutate((x) => { x.restEnd += 15000; x.restTotal += 15000; })}
      onSkip=${() => mutate((x) => { x.restEnd = 0; })} />`}
    ${!onWorkout && html`<button type="button" class="mini" onClick=${() => ctx.go("workout")}>
      <span class="flex1" style=${{ fontSize: "var(--body-md-size)", fontWeight: 800 }}>Bezig · ${a.title} · ${time((now - a.start) / 1000)}</span>
      <span style=${{ fontSize: "var(--button-size)", fontWeight: 800 }}>Verder</span>
    </button>`}
  <//>`;
}
