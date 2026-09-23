import { html, DS, useState, useEffect, Icon } from "../ui.js";
import * as store from "../store.js";
import { num, time, exMeta, exerciseHistory, bests, workoutPrs, dateNum, dateShort, TYPES, GROUPS, hasValue } from "../logic.js";
import { METRICS, METRIC_HELP, sessionValue, formatMetric, lowerIsBetter, groupColor } from "../stats.js";
import { MuscleFigure } from "../muscles.js";

const HIST_SHOWN = 10;

function Records({ type, b }) {
  const rows = [];
  if (type === "kg" && b.maxW !== null) {
    rows.push({ name: "Zwaarste gewicht", val: num(b.maxW) + " kg" });
    rows.push({ name: "Geschat 1RM", sub: "Epley-formule", val: num(Math.round(b.e1rm * 2) / 2) + " kg" });
  }
  if (type === "assist" && b.minW !== null) rows.push({ name: "Minste assist", sub: "Lager is beter", val: num(b.minW) + " kg" });
  if (["kg", "assist", "reps"].includes(type) && b.maxR) rows.push({ name: "Meeste reps in een set", val: num(b.maxR) });
  if (type === "duur" && b.maxDur) rows.push({ name: "Langste tijd", val: time(b.maxDur) });
  if (type === "afstand" && b.maxDist) rows.push({ name: "Verste afstand", val: num(b.maxDist) + " km" });
  if (!rows.length) return null;
  return html`<div class="section">
    <div class="title">Records</div>
    <div style=${{ marginTop: 6 }}>${rows.map((r, i) => html`<${DS.ListRow} key=${r.name} first=${i === 0} icon="trend" badgeFill="var(--accent-orange-soft)" name=${r.name} sub=${r.sub} value=${r.val} />`)}</div>
  </div>`;
}

/** Eén sessie als blok, zoals tijdens een workout: Set · Kg · Reps. */
function SessionBlock({ h, type, pr }) {
  const fields = TYPES[type].fields;
  const cell = (f, s) => (!hasValue(s[f.k]) ? "–" : f.time ? time(s[f.k]) : num(s[f.k]));
  let n = 0;
  return html`<div style=${{ borderTop: "1px solid var(--border)", padding: "12px 0 6px" }}>
    <div class="row" style=${{ gap: 8 }}>
      <div class="flex1">
        <div class="body">${dateShort(h.workout.start)} ${new Date(h.workout.start).getFullYear()}</div>
        <div class="sub">${h.workout.title}</div>
      </div>
      ${pr && html`<span class="pr-badge">PR</span>`}
    </div>
    <div class="caption" style=${{ display: "flex", gap: 10, padding: "10px 10px 4px" }}>
      <span style=${{ width: 28, flex: "none" }}>Set</span>
      ${fields.map((f) => html`<span key=${f.k} class="flex1" style=${{ textAlign: "center" }}>${type === "assist" && f.k === "w" ? "Assist" : f.label}</span>`)}
    </div>
    ${h.sets.map((s, i) => {
      const normal = !s.type || s.type === "normal";
      if (normal) n++;
      return html`<div key=${i} class="altrow" style=${{ padding: "6px 10px", background: i % 2 ? "transparent" : "var(--surface-tint)" }}>
        <span style=${{ width: 28, flex: "none", fontSize: "var(--body-sm-size)", fontWeight: 700, color: "var(--ink-soft)" }}>${normal ? n : html`<${DS.SetTypeBadge} type=${s.type} />`}</span>
        ${fields.map((f) => html`<span key=${f.k} class="flex1" style=${{ textAlign: "center", fontSize: "var(--body-md-size)", fontWeight: 800 }}>${cell(f, s)}</span>`)}
      </div>`;
    })}
  </div>`;
}

export function ExerciseDetail({ ctx, params }) {
  const ex = store.get(params.id);
  const [note, setNote] = useState(ex?.note || "");
  const [tab, setTab] = useState("overzicht");
  const [noteOpen, setNoteOpen] = useState(false);
  const [allHist, setAllHist] = useState(false);
  const [metrics, setMetrics] = useState(() => store.getMeta("progressMetrics", {}));
  useEffect(() => { if (!ex) ctx.back(); }, [ex]);
  if (!ex) return null;

  const type = ex.type || "kg";
  const hist = exerciseHistory(ctx.workouts, ex.id);
  const b = bests(type, hist.flatMap((h) => h.sets));
  const options = METRICS[type];
  const metric = options.includes(metrics[ex.id]) ? metrics[ex.id] : options[0];
  const setMetric = (m) => { const x = { ...metrics, [ex.id]: m }; setMetrics(x); store.setMeta("progressMetrics", x); };
  const chrono = [...hist].reverse().map((h) => ({ at: h.workout.start, v: sessionValue(type, h.sets, metric) })).filter((p) => p.v !== null && p.v !== undefined);
  const fmt = (v) => formatMetric(type, v, metric);
  const color = groupColor(ex.group);
  let bi = 0;
  chrono.forEach((p, i) => { if (lowerIsBetter(metric) ? p.v <= chrono[bi].v : p.v >= chrono[bi].v) bi = i; });
  const saveNote = () => note !== (ex.note || "") && store.update(ex.id, { note });
  const shown = allHist ? hist : hist.slice(0, HIST_SHOWN);

  return html`<div class="fill">
    <${DS.TopBar} title=${ex.name} leading="close" onLeading=${() => { saveNote(); ctx.back(); }} />
    <div style=${{ padding: "0 16px 10px" }}>
      <div class="sub">${exMeta(ex)} · ${TYPES[type].label}</div>
      <div class="chips" style=${{ marginTop: 10 }}>
        <${DS.Chip} selected=${tab === "overzicht"} onClick=${() => setTab("overzicht")}>Overzicht<//>
        <${DS.Chip} selected=${tab === "geschiedenis"} onClick=${() => setTab("geschiedenis")}>Geschiedenis${hist.length ? ` (${hist.length})` : ""}<//>
      </div>
    </div>
    <div class="scroll">
      ${tab === "overzicht" ? html`<div>
        <div class="section first" style=${{ paddingTop: 4 }}>
          <button type="button" class="plainbtn" onClick=${() => { if (noteOpen) saveNote(); setNoteOpen(!noteOpen); }}
            style=${{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 8 }}>
            <span style=${{ display: "grid", placeItems: "center", color: "var(--ink-soft)", transform: noteOpen ? "none" : "rotate(-90deg)", transition: "transform .15s ease" }}>${Icon("chevron-down", 18)}</span>
            <span class="flex1" style=${{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span class="body">Vaste notitie</span>
              ${!noteOpen && html`<span class="sub" style=${{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>${note.trim() || "Nog leeg · stoelstand, repbereik, aanwijzingen"}</span>`}
            </span>
          </button>
          ${noteOpen && html`<div>
            <div class="sub">Staat bij elke sessie boven je sets</div>
            <textarea class="field" style=${{ marginTop: 8, minHeight: 72 }} value=${note} onInput=${(e) => setNote(e.target.value)} onBlur=${saveNote} placeholder="Stoelstand, repbereik, aanwijzingen" autoFocus></textarea>
          </div>`}
        </div>

        <div class="section">
          <${MuscleFigure} ex=${ex} />
          <div class="caption" style=${{ margin: "16px 0 8px" }}>Spiergroep in je overzichten</div>
          <div class="chips">${GROUPS.map((g) => html`<${DS.Chip} key=${g} selected=${ex.group === g} onClick=${() => store.update(ex.id, { group: g })}>${g}<//>`)}</div>
        </div>

        ${chrono.length >= 3 && html`<div class="section">
          <div class="title">Verloop</div>
          <div class="sub">${METRIC_HELP[metric] || ""}</div>
          <div class="display" style=${{ marginTop: 8 }}>${fmt(chrono[chrono.length - 1].v)}</div>
          <${DS.LineChart} values=${chrono.map((p) => p.v)} labels=${chrono.map((p) => dateNum(p.at))} prIndex=${bi === chrono.length - 1 ? null : bi} color=${color} height=${140} formatValue=${fmt} />
          <div style=${{ marginTop: 18 }}><${DS.MetricSelector} options=${options} value=${metric} onChange=${setMetric} /></div>
        </div>`}

        <${Records} type=${type} b=${b} />

        ${!hist.length && html`<div class="section"><${DS.EmptyState} icon="trend" title="Nog geen geschiedenis" body="Na je eerste sessie zie je hier je sets en records." /></div>`}

        ${ex.custom && html`<div class="section" style=${{ display: "flex", justifyContent: "center" }}>
          <${DS.Button} variant="quiet" onClick=${() => { store.remove(ex.id); ctx.back(); }}>Eigen oefening verwijderen<//>
        </div>`}
      </div>` : html`<div>
        ${!hist.length && html`<${DS.EmptyState} icon="calendar" title="Nog geen geschiedenis" body="Na je eerste sessie staan je sets hier." />`}
        ${shown.map((h) => html`<${SessionBlock} key=${h.workout.id} h=${h} type=${type}
          pr=${workoutPrs(h.workout, ctx.workouts, ctx.exById).some((p) => p.exercise === ex.id)} />`)}
        ${hist.length > HIST_SHOWN && html`<div style=${{ marginTop: 12 }}>
          <${DS.Chip} onClick=${() => setAllHist(!allHist)}>${allHist ? "Minder tonen" : `Alle ${hist.length} sessies tonen`}<//>
        </div>`}
      </div>`}
    </div>
  </div>`;
}
