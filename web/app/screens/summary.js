import { html, DS, useState, useEffect } from "../ui.js";
import * as store from "../store.js";
import { dateLong, minutes, kg, time, fmtSet, volume, setCount, workoutPrs, bests } from "../logic.js";

function DeleteSheet({ ctx, id }) {
  return html`<div>
    <div class="title">Workout verwijderen?</div>
    <div class="sub" style=${{ marginTop: 6 }}>Deze training en alle sets verdwijnen, ook op je andere apparaten.</div>
    <div style=${{ display: "flex", gap: 10, marginTop: 18 }}>
      <${DS.Button} variant="quiet" onClick=${ctx.closeSheet}>Bewaren<//>
      <div class="flex1"></div>
      <${DS.Button} onClick=${() => { store.remove(id); ctx.closeSheet(); ctx.tab("home"); }}>Verwijderen<//>
    </div>
  </div>`;
}

export function Summary({ ctx, params }) {
  const w = store.get(params.id);
  const [note, setNote] = useState(w?.note || "");
  useEffect(() => { if (!w) ctx.tab("home"); }, [w]);
  if (!w) return null;

  const exById = ctx.exById;
  const prs = workoutPrs(w, ctx.workouts, exById);
  const saveNote = () => note !== (w.note || "") && store.update(w.id, { note });

  return html`<div class="fill">
    <${DS.TopBar} title="Samenvatting" leading=${params.readonly ? "close" : "none"} onLeading=${() => { saveNote(); ctx.back(); }}
      action=${params.readonly ? null : html`<${DS.Button} onClick=${() => { saveNote(); ctx.tab("home"); }}>Opslaan<//>`} />
    <div class="scroll">
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div class="display">${w.title}</div>
        <div class="sub" style=${{ fontWeight: 700, marginTop: 4 }}>${dateLong(w.start)} · ${minutes(w.end - w.start)}</div>
        <div style=${{ marginTop: 14 }}>
          <${DS.StatStrip} items=${[{ label: "Duur", value: time((w.end - w.start) / 1000) }, { label: "Volume", value: kg(volume(w, exById)) }, { label: "Sets", value: String(setCount(w)) }]} />
        </div>
      </div>

      ${prs.length > 0 && html`<div class="section">
        <div class="title">Nieuwe records</div>
        <div style=${{ marginTop: 6 }}>
          ${prs.map((p, i) => html`<${DS.ListRow} key=${p.exercise} first=${i === 0} icon="trend" badgeFill="var(--accent-mint)"
            name=${exById[p.exercise]?.name} sub=${p.labels.join(", ")} value=${fmtSet(exById[p.exercise]?.type, p.set, true)} />`)}
        </div>
      </div>`}

      <div class="section">
        <div class="title">Oefeningen</div>
        <div style=${{ marginTop: 6 }}>
          ${(w.items || []).map((it, i) => {
            const ex = exById[it.exercise] || {};
            const type = ex.type || "kg";
            const b = bests(type, it.sets);
            const top = it.sets.find((s) => Number(s.w) === (type === "assist" ? b.minW : b.maxW)) || it.sets[it.sets.length - 1];
            const v = volume({ items: [it] }, exById);
            return html`<button type="button" key=${i} class="plainbtn" style=${{ width: "100%" }} onClick=${() => ctx.go("exercise", { id: it.exercise })}>
              <${DS.ListRow} first=${i === 0} icon="dumbbell" name=${ex.name || "Onbekende oefening"}
                sub=${`${it.sets.length} ${it.sets.length === 1 ? "set" : "sets"} · beste ${fmtSet(type, top)}`} value=${v ? kg(v) : ""} />
            </button>`;
          })}
        </div>
      </div>

      <div class="section">
        <div class="title">Hoe zwaar was het?</div>
        <div class="sub" style=${{ marginBottom: 10 }}>Sessie-RPE, optioneel</div>
        <${DS.RpeInput} value=${w.rpe} onChange=${(v) => store.update(w.id, { rpe: v })} />
        <textarea class="field" style=${{ marginTop: 12 }} placeholder="Notitie bij deze training" value=${note} onInput=${(e) => setNote(e.target.value)} onBlur=${saveNote}></textarea>
      </div>

      <div class="section">
        <div class="row" style=${{ gap: 10 }}>
          <${DS.IconBadge} icon="clock" size=${30} fill="var(--accent-lavender)" color="#211a12" />
          <div class="flex1 body">Galaxy Watch</div>
          <span class="tag">Fase 2</span>
        </div>
        <div class="sub" style=${{ marginTop: 8 }}>Hartslag en calorieën van je watch komen hier later bij, via Health Connect.</div>
      </div>

      ${params.readonly && html`<div class="section" style=${{ display: "flex", justifyContent: "center" }}>
        <${DS.Button} variant="quiet" onClick=${() => ctx.sheet(html`<${DeleteSheet} ctx=${ctx} id=${w.id} />`)}>Workout verwijderen<//>
      </div>`}
    </div>
  </div>`;
}
