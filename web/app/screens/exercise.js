import { html, DS, useState, useEffect } from "../ui.js";
import * as store from "../store.js";
import { num, time, fmtSets, exMeta, exerciseHistory, bests, workoutPrs, dateNum, TYPES, GROUPS } from "../logic.js";

const REST_OPTIONS = [null, 0, 30, 60, 90, 120, 180, 240];
const HIST_SHOWN = 5;
const restLabel = (v) => (v === null ? "Standaard" : v === 0 ? "Geen" : time(v));

/** Beste waarde per sessie, voor de grafiek. */
function sessionValue(type, sets) {
  const b = bests(type, sets);
  if (type === "assist") return b.minW;
  if (type === "reps") return b.maxR || null;
  if (type === "duur") return b.maxDur || null;
  if (type === "afstand") return b.maxDist || null;
  return b.maxW;
}

const CHART_TITLE = { kg: "Zwaarste set per sessie", assist: "Assist per sessie", reps: "Meeste reps per sessie", duur: "Langste tijd per sessie", afstand: "Afstand per sessie" };

export function ExerciseDetail({ ctx, params }) {
  const ex = store.get(params.id);
  const [note, setNote] = useState(ex?.note || "");
  const [allHist, setAllHist] = useState(false);
  useEffect(() => { if (!ex) ctx.back(); }, [ex]);
  if (!ex) return null;

  const type = ex.type || "kg";
  const hist = exerciseHistory(ctx.workouts, ex.id);
  const all = hist.flatMap((h) => h.sets);
  const b = bests(type, all);
  const chrono = [...hist].reverse().map((h) => ({ at: h.workout.start, v: sessionValue(type, h.sets) })).filter((p) => p.v !== null);
  const fmtV = (v) => (type === "duur" ? time(v) : type === "afstand" ? num(v) + " km" : type === "reps" ? num(v) : num(v) + " kg");
  const labels = chrono.map((p) => dateNum(p.at));

  const records = [];
  if (type === "kg" && b.maxW !== null) {
    records.push({ name: "Zwaarste gewicht", val: num(b.maxW) + " kg" });
    records.push({ name: "Geschat 1RM", sub: "Epley-formule", val: num(Math.round(b.e1rm * 2) / 2) + " kg" });
  }
  if (type === "assist" && b.minW !== null) records.push({ name: "Minste assist", sub: "Lager is beter", val: num(b.minW) + " kg" });
  if (["kg", "assist", "reps"].includes(type) && b.maxR) records.push({ name: "Meeste reps in een set", val: num(b.maxR) });
  if (type === "duur" && b.maxDur) records.push({ name: "Langste tijd", val: time(b.maxDur) });
  if (type === "afstand" && b.maxDist) records.push({ name: "Verste afstand", val: num(b.maxDist) + " km" });

  const saveNote = () => note !== (ex.note || "") && store.update(ex.id, { note });

  return html`<div class="fill">
    <${DS.TopBar} title=${ex.name} leading="close" onLeading=${() => { saveNote(); ctx.back(); }} />
    <div class="scroll">
      <div class="sub">${exMeta(ex)} · ${TYPES[type].label}</div>

      <div class="section">
        <div class="title">Vaste notitie</div>
        <div class="sub">Staat bij elke sessie boven je sets</div>
        <textarea class="field" style=${{ marginTop: 10, minHeight: 72 }} value=${note} onInput=${(e) => setNote(e.target.value)} onBlur=${saveNote} placeholder="Stoelstand, repbereik, aanwijzingen"></textarea>
        <div class="caption" style=${{ margin: "14px 0 8px" }}>Spiergroep</div>
        <div class="chips">${GROUPS.map((g) => html`<${DS.Chip} key=${g} selected=${ex.group === g} onClick=${() => store.update(ex.id, { group: g })}>${g}<//>`)}</div>
        <div class="caption" style=${{ margin: "14px 0 8px" }}>Rust na elke set</div>
        <div class="chips">${REST_OPTIONS.map((v) => html`<${DS.Chip} key=${String(v)} selected=${(ex.rest ?? null) === v} onClick=${() => store.update(ex.id, { rest: v })}>${restLabel(v)}<//>`)}</div>
      </div>

      ${hist.length ? html`<div>
        ${records.length > 0 && html`<div class="section">
          <div class="title">Records</div>
          <div style=${{ marginTop: 6 }}>${records.map((r, i) => html`<${DS.ListRow} key=${r.name} first=${i === 0} icon="trend" badgeFill="var(--accent-orange-soft)" name=${r.name} sub=${r.sub} value=${r.val} />`)}</div>
        </div>`}
        ${chrono.length >= 3 && html`<div class="section">
          <div class="title">${CHART_TITLE[type]}</div>
          ${type === "assist" && html`<div class="sub">Lager is beter</div>`}
          <div style=${{ marginTop: 12 }}><${DS.LineChart} values=${chrono.map((p) => p.v)} labels=${labels} color="var(--accent-orange)" height=${140} formatValue=${fmtV} /></div>
        </div>`}
        <div class="section">
          <div class="title">Geschiedenis</div>
          <div style=${{ marginTop: 4 }}>
            ${(allHist ? hist : hist.slice(0, HIST_SHOWN)).map((h, i) => {
              const pr = workoutPrs(h.workout, ctx.workouts, ctx.exById).some((p) => p.exercise === ex.id);
              return html`<div key=${h.workout.id} style=${{ display: "flex", alignItems: "baseline", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)" }}>
                <span style=${{ flex: "none", width: 52, fontWeight: 600, color: "var(--ink-soft)" }}>${dateNum(h.workout.start)}</span>
                <span class="flex1" style=${{ fontWeight: 700 }}>${fmtSets(type, h.sets)}</span>
                ${pr && html`<span class="pr-badge">PR</span>`}
              </div>`;
            })}
          </div>
          ${hist.length > HIST_SHOWN && html`<div style=${{ marginTop: 8 }}>
            <${DS.Chip} onClick=${() => setAllHist(!allHist)}>${allHist ? "Minder tonen" : `Alle ${hist.length} sessies tonen`}<//>
          </div>`}
        </div>
      </div>` : html`<div class="section"><${DS.EmptyState} icon="trend" title="Nog geen geschiedenis" body="Na je eerste sessie zie je hier je sets en records." /></div>`}

      ${ex.custom && html`<div class="section" style=${{ display: "flex", justifyContent: "center" }}>
        <${DS.Button} variant="quiet" onClick=${() => { store.remove(ex.id); ctx.back(); }}>Eigen oefening verwijderen<//>
      </div>`}
    </div>
  </div>`;
}
