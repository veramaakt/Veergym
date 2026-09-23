import { html, DS, useState, useRef, Icon } from "../ui.js";
import * as store from "../store.js";
import { syncNow } from "../sync.js";
import { num, dateNum, TYPES } from "../logic.js";

const STEPS = ["Bestand", "Oefeningen", "Titels", "Klaar"];
const monthYear = (ms) => {
  const d = new Date(ms);
  return `${dateNum(ms).split(" ")[1]} ${d.getFullYear()}`;
};
const stripEmoji = (s) => s.replace(/[\p{Extended_Pictographic}️‍]/gu, "").replace(/\s+/g, " ").trim();

async function api(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + store.getMeta("token") },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || "Er ging iets mis (" + res.status + ")");
  return json;
}

const selectStyle = { width: "100%", height: 44, border: "none", borderRadius: "var(--radius-sm)", background: "var(--surface-tint)", color: "var(--ink)", fontFamily: "inherit", fontSize: "var(--body-sm-size)", fontWeight: 700, padding: "0 10px", marginTop: 6 };

export function HevyImport({ ctx }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null); // {name, text}
  const [prev, setPrev] = useState(null);
  const [choices, setChoices] = useState({});
  const [titles, setTitles] = useState({});
  const [onlyNew, setOnlyNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const input = useRef(null);

  const pick = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      await syncNow(); // eigen oefeningen eerst naar de server, zodat ze gekoppeld kunnen worden
      const text = await f.text();
      const p = await api("api/import/hevy/preview", { csv: text });
      setFile({ name: f.name, text });
      setPrev(p);
      setChoices(Object.fromEntries(p.names.map((n) => [n.name, n.match || "new"])));
      setTitles(Object.fromEntries(p.titles.map((t) => [t.title, { rename: stripEmoji(t.title), template: null }])));
    } catch (e) {
      setErr(navigator.onLine ? e.message : "Importeren kan alleen online.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const run = async () => {
    setBusy(true);
    setErr("");
    try {
      const t = Object.fromEntries(Object.entries(titles).map(([k, v]) => [k, { rename: v.rename && v.rename !== k ? v.rename : null, template: v.template || null }]));
      const r = await api("api/import/hevy", { csv: file.text, choices, titles: t });
      setResult(r);
      setStep(4);
      await syncNow();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const exOptions = [...ctx.exercises].sort((a, b) => a.name.localeCompare(b.name));
  const next = () => {
    if (step === 1 && prev) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) run();
    else if (step === 4) ctx.tab("progress");
  };
  const nextLabel = ["Volgende", "Volgende", "Importeren", "Naar voortgang"][step - 1];
  const nextDisabled = busy || (step === 1 && !prev);

  let body;
  if (step === 1) {
    const checks = prev && [
      prev.new_workouts < prev.workouts ? `${prev.workouts - prev.new_workouts} workouts staan er al in en worden overgeslagen.` : "Alle workouts zijn nieuw.",
      prev.no_weight ? `${prev.no_weight} sets zonder gewicht (lichaamsgewicht of tijd). Die worden gewoon meegenomen.` : null,
      prev.no_reps ? `${prev.no_reps} sets zonder reps, zoals plank of hardlopen.` : null,
      prev.has_rpe ? "RPE wordt meegenomen." : "Er staat geen RPE in het bestand; grafieken daarvan komen pas als je RPE logt.",
      "Warming-up sets tellen niet mee voor volume en records.",
      "Assisted oefeningen: lager gewicht is beter.",
    ].filter(Boolean);
    body = html`<div style=${{ marginTop: 16 }}>
      <input ref=${input} type="file" accept=".csv,text/csv" onChange=${pick} style=${{ display: "none" }} />
      ${!prev ? html`<div>
        <div class="title">Kies je Hevy-export</div>
        <div class="sub" style=${{ marginTop: 4 }}>In Hevy: Profiel > Instellingen > Export & Import Data > Export Workouts. Je krijgt een CSV-bestand.</div>
        <div style=${{ marginTop: 16 }}><${DS.Button} disabled=${busy} onClick=${() => input.current.click()}>${busy ? "Bezig met lezen…" : "Bestand kiezen"}<//></div>
      </div>` : html`<div>
        <div class="display">${file.name}</div>
        <div class="sub" style=${{ fontWeight: 700, marginTop: 4 }}>${dateNum(prev.first)} ${new Date(prev.first).getFullYear()} t/m ${dateNum(prev.last)} ${new Date(prev.last).getFullYear()}</div>
        <div style=${{ marginTop: 14 }}><${DS.StatStrip} items=${[{ label: "Workouts", value: num(prev.new_workouts) }, { label: "Sets", value: num(prev.sets) }, { label: "Oefeningen", value: String(prev.names.length) }]} /></div>
        <div style=${{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 12 }}>
          ${checks.map((c) => html`<div key=${c} style=${{ display: "flex", gap: 10, padding: "6px 0" }}>
            <span style=${{ color: "var(--ink-soft)", paddingTop: 2 }}>${Icon("check", 14)}</span>
            <div class="flex1" style=${{ fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)", fontWeight: 600 }}>${c}</div>
          </div>`)}
        </div>
        <${DS.Button} variant="quiet" onClick=${() => input.current.click()}>Ander bestand kiezen<//>
      </div>`}
    </div>`;
  } else if (step === 2) {
    const linked = prev.names.filter((n) => choices[n.name] !== "new").length;
    const rows = onlyNew ? prev.names.filter((n) => choices[n.name] === "new") : prev.names;
    body = html`<div style=${{ marginTop: 16 }}>
      <div class="title">Oefeningsnamen</div>
      <div class="sub">${prev.names.length} namen gevonden, ${linked} gekoppeld aan een oefening in de app. De rest wordt een nieuwe eigen oefening. Kies een oefening om varianten en typefouten samen te voegen.</div>
      <div class="chips" style=${{ marginTop: 10 }}>
        <${DS.Chip} selected=${!onlyNew} onClick=${() => setOnlyNew(false)}>Alle<//>
        <${DS.Chip} selected=${onlyNew} onClick=${() => setOnlyNew(true)}>Alleen nieuwe<//>
      </div>
      <div style=${{ marginTop: 10 }}>
        ${rows.map((n) => html`<div key=${n.name} style=${{ borderTop: "1px solid var(--border)", padding: "10px 0" }}>
          <div class="body">${n.name}</div>
          <div class="sub">${n.sets} sets · ${n.sessions}× gedaan${choices[n.name] === "new" ? ` · nieuw: ${TYPES[n.type].label.toLowerCase()}${n.group ? ", " + n.group : ""}` : ""}</div>
          <select value=${choices[n.name]} onChange=${(e) => setChoices({ ...choices, [n.name]: e.target.value })} style=${selectStyle}>
            <option value="new">Nieuwe oefening: ${n.name}</option>
            ${exOptions.map((e) => html`<option key=${e.id} value=${e.id}>${e.name}</option>`)}
          </select>
        </div>`)}
      </div>
    </div>`;
  } else if (step === 3) {
    body = html`<div style=${{ marginTop: 16 }}>
      <div class="title">Workout-titels</div>
      <div class="sub">${prev.titles.length} titels. Schema's worden niet automatisch herkend. Pas een titel aan of koppel hem aan een schema als je wilt.</div>
      <div style=${{ marginTop: 10 }}>
        ${prev.titles.map((t) => html`<div key=${t.title} style=${{ borderTop: "1px solid var(--border)", padding: "10px 0" }}>
          <div class="row" style=${{ gap: 10 }}>
            <input class="field" style=${{ height: 44 }} value=${titles[t.title]?.rename ?? ""} placeholder=${t.title}
              onInput=${(e) => setTitles({ ...titles, [t.title]: { ...titles[t.title], rename: e.target.value } })} />
            <span class="sub" style=${{ flex: "none", width: 36, textAlign: "right" }}>${t.count}×</span>
          </div>
          ${ctx.templates.length > 0 && html`<select value=${titles[t.title]?.template || ""} style=${selectStyle}
            onChange=${(e) => setTitles({ ...titles, [t.title]: { ...titles[t.title], template: e.target.value || null } })}>
            <option value="">Niet koppelen aan een schema</option>
            ${ctx.templates.map((tp) => html`<option key=${tp.id} value=${tp.id}>Schema: ${tp.name || "Naamloos"}</option>`)}
          </select>`}
        </div>`)}
      </div>
    </div>`;
  } else {
    body = html`<div style=${{ marginTop: 16 }}>
      <div class="display">Geïmporteerd</div>
      <div class="sub" style=${{ marginTop: 4 }}>${num(result.workouts_added)} workouts en ${num(result.sets)} sets${result.exercises_created ? `, ${result.exercises_created} nieuwe oefeningen` : ""}.${result.workouts_skipped ? ` ${result.workouts_skipped} workouts stonden er al in en zijn overgeslagen.` : ""} Bij een volgende import worden dubbele workouts genegeerd.</div>
      ${result.checks.length > 0 && html`<div>
        <div class="caption" style=${{ marginTop: 18 }}>Controle</div>
        <div style=${{ marginTop: 4 }}>${result.checks.map((c, i) => html`<${DS.ListRow} key=${c.exercise} first=${i === 0} icon="check" badgeFill="var(--accent-mint)"
          name=${c.name} sub=${c.type === "assist" ? "Assist, lager is beter" : `${monthYear(c.first_at)} → ${monthYear(c.last_at)}`} value=${`${num(c.first)} → ${num(c.last)} kg`} />`)}</div>
      </div>`}
    </div>`;
  }

  return html`<div class="fill">
    <${DS.TopBar} title="Hevy-import" leading="close" onLeading=${ctx.back} />
    <div class="scroll">
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div class="caption">Stap ${step} van 4 · ${STEPS[step - 1]}</div>
        <div style=${{ display: "flex", gap: 4, marginTop: 8 }}>${[1, 2, 3, 4].map((n) => html`<div key=${n} style=${{ flex: 1, height: 4, borderRadius: 2, background: n <= step ? "var(--ink)" : "var(--border)" }}></div>`)}</div>
      </div>
      ${body}
      ${err && html`<div class="error">${err}</div>`}
    </div>
    <div class="row" style=${{ gap: 10, padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
      ${step > 1 && step < 4 && html`<${DS.Button} variant="quiet" onClick=${() => setStep(step - 1)}>Terug<//>`}
      <div class="flex1"></div>
      <${DS.Button} disabled=${nextDisabled} onClick=${next}>${busy && step === 3 ? "Importeren…" : nextLabel}<//>
    </div>
  </div>`;
}
