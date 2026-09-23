import { html, DS, DEMO, useState, useRef, Icon } from "../ui.js";
import * as store from "../store.js";
import { num } from "../logic.js";
import {
  fields, measurements, series, sinceStart, weekWindow, nextMeasure, saveMeasurement,
  fmtDate, fmtDay, todayISO, parseMeasurementsCSV,
} from "../measure.js";

const cm = (v) => (v === null || v === undefined ? null : num(v));
const signed = (d, unit) => (d === null || d === 0 ? "" : `${num(Math.abs(d))} ${unit}`);
const label = (key) => (key === "weight" ? "Gewicht" : fields({ includeHidden: true }).find((f) => f.key === key)?.label || key);

function DueRow({ ctx, plan }) {
  const title = plan.last === null ? "Nog geen metingen" : plan.missed ? "Meetmoment gemist" : plan.due ? "Meetmoment vandaag" : `Volgende meetmoment: ${fmtDay(plan.next)}`;
  const sub = plan.last === null ? "Vul je eerste meting in, of importeer je sheet" : `Laatste meting ${fmtDate(plan.last)}`;
  return html`<div class="row" style=${{ gap: 10, marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
    <div class="flex1"><div class="body">${title}</div><div class="sub">${sub}</div></div>
    ${plan.due && html`<${DS.Button} size="sm" onClick=${() => ctx.go("measureEntry", {})}>Invullen<//>`}
  </div>`;
}

export function Measure({ ctx }) {
  const list = measurements();
  const plan = nextMeasure(list);
  const w = series(list, "weight");
  const ws = sinceStart(w);
  const win = weekWindow(w);

  return html`<div class="page">
    <div class="row">
      <div class="flex1 title">Metingen</div>
      <button type="button" class="iconbtn" aria-label="Meting toevoegen" style=${{ color: "var(--ink)", marginRight: -8 }} onClick=${() => ctx.go("measureEntry", {})}>${Icon("plus", 20)}</button>
    </div>
    <${DueRow} ctx=${ctx} plan=${plan} />

    ${!list.length ? html`<div class="section">
      <${DS.EmptyState} icon="scale" title="Nog geen metingen" body="Vul je gewicht en omtrekken in, of haal je metingen uit je Google Sheet."
        action="Sheet importeren" onAction=${() => ctx.go("measureImport")} />
    </div>` : html`<div>
      <div class="section" style=${{ marginTop: 18 }}>
        <button type="button" class="plainbtn" style=${{ width: "100%" }} onClick=${() => ctx.go("measureDetail", { key: "weight" })}>
          <div class="row" style=${{ gap: 10 }}>
            <${DS.IconBadge} icon="scale" size=${30} fill="var(--accent-pink)" color="var(--accent-pink-ink)" />
            <div class="flex1"><div class="body">Gewicht</div><div class="sub">${win > 1 ? "Lijn is het 7-daags gemiddelde" : "Per meting"}</div></div>
          </div>
        </button>
        ${ws.value !== null ? html`<div>
          <div class="display" style=${{ marginTop: 12 }}>${num(ws.value)}<span style=${{ fontSize: "var(--body-md-size)", fontWeight: 700 }}> kg</span></div>
          ${ws.delta ? html`<div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700, color: "var(--ink-soft)" }}>${ws.direction === "up" ? "↑" : "↓"}${signed(ws.delta, "kg")} sinds ${fmtDate(ws.startDate)}</div>` : null}
          ${w.length >= 2 && html`<div style=${{ marginTop: 6 }}><${DS.WeightTrendChart} values=${w.map((p) => p.v)} labels=${w.map((p) => fmtDate(p.date))} window=${win} /></div>`}
        </div>` : html`<div class="sub" style=${{ marginTop: 8 }}>Nog geen gewicht ingevuld.</div>`}
      </div>

      <div class="section" style=${{ marginTop: 20 }}>
        <div class="row" style=${{ gap: 10 }}>
          <${DS.IconBadge} icon="bars" size=${30} fill="var(--accent-lavender)" color="#211a12" />
          <div><div class="body">Omtrekken</div><div class="sub">${plan.last ? `Laatste meting ${fmtDate(plan.last)} · ` : ""}verschil t.o.v. start</div></div>
        </div>
        <div style=${{ marginTop: 8 }}>
          ${fields().map((f, i) => {
            const s = sinceStart(series(list, f.key));
            return html`<${DS.MeasurementRow} key=${f.key} first=${i === 0} label=${f.label} value=${cm(s.value)}
              sinceStart=${signed(s.delta, "cm")} direction=${s.direction} onClick=${() => ctx.go("measureDetail", { key: f.key })} />`;
          })}
        </div>
      </div>
    </div>`}

    <div class="section" style=${{ marginTop: 20 }}>
      <div class="row" style=${{ gap: 10 }}>
        <${DS.IconBadge} icon="clock" size=${30} fill="var(--accent-lavender)" color="#211a12" />
        <div class="flex1"><div class="body">Slaap en stappen</div><div class="sub">Van je Galaxy Watch 7</div></div>
        <span class="tag">Fase 2</span>
      </div>
      <div class="sub" style=${{ marginTop: 8 }}>Hier komen slaap en stappen per week, via Health Connect.</div>
    </div>
  </div>`;
}

export function MeasureDetail({ ctx, params }) {
  const key = params.key;
  const unit = key === "weight" ? "kg" : "cm";
  const list = measurements();
  const pts = series(list, key);
  const s = sinceStart(pts);
  return html`<div class="fill">
    <${DS.TopBar} title=${label(key)} leading="close" onLeading=${ctx.back} />
    <div class="scroll">
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div class="caption">Laatste meting${s.lastDate ? " · " + fmtDate(s.lastDate) : ""}</div>
        <div class="display" style=${{ marginTop: 4 }}>${s.value === null ? "–" : `${num(s.value)} ${unit}`}</div>
        ${s.delta ? html`<div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700, color: "var(--ink-soft)" }}>${s.direction === "up" ? "↑" : "↓"}${signed(s.delta, unit)} sinds ${fmtDate(s.startDate)}</div>` : null}
      </div>
      ${pts.length >= 2
        ? html`<div style=${{ marginTop: 16 }}><${DS.LineChart} values=${pts.map((p) => p.v)} labels=${pts.map((p) => fmtDate(p.date))} color="var(--accent-pink)" height=${140} formatValue=${(v) => `${num(v)} ${unit}`} /></div>`
        : html`<${DS.EmptyState} icon="trend" title="Nog geen verloop" body="Na twee metingen zie je hier een grafiek." />`}
      <div style=${{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 6 }}>
        ${[...pts].reverse().map((p) => html`<button type="button" key=${p.date} class="plainbtn" onClick=${() => ctx.go("measureEntry", { date: p.date })}
          style=${{ width: "100%", display: "flex", alignItems: "baseline", gap: 10, padding: "10px 0", fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)" }}>
          <span class="flex1" style=${{ fontWeight: 600, color: "var(--ink-soft)" }}>${fmtDate(p.date)}</span>
          <span style=${{ fontWeight: 800 }}>${num(p.v)} ${unit}</span>
        </button>`)}
      </div>
      <div style=${{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 12 }}>
        <${DS.Button} variant="quiet" onClick=${() => ctx.go("measureEntry", {})}>Meting invullen of aanpassen<//>
      </div>
    </div>
  </div>`;
}

const inputStyle = { width: 88, height: 44, border: "none", borderRadius: "var(--radius-sm)", background: "var(--surface-tint)", fontFamily: "inherit", fontSize: "var(--body-md-size)", fontWeight: 800, textAlign: "center", outline: "none" };
const parse = (t) => {
  const s = String(t).trim().replace(",", ".");
  return s === "" ? "" : Number.isNaN(Number(s)) ? "" : Number(s);
};

export function MeasureEntry({ ctx, params }) {
  const [date, setDate] = useState(params.date || todayISO());
  const existing = store.get("m-" + date);
  const list = measurements().filter((m) => m.date < date);
  const prevOf = (key) => { const p = series(list, key); return p.length ? p[p.length - 1].v : null; };
  const [weight, setWeight] = useState(() => (existing?.weight ?? "") === "" ? "" : num(existing.weight));
  const [vals, setVals] = useState(() => Object.fromEntries(Object.entries(existing?.fields || {}).map(([k, v]) => [k, num(v)])));
  const [note, setNote] = useState(existing?.note || "");

  const changeDate = (d) => {
    if (!d) return;
    setDate(d);
    const e = store.get("m-" + d);
    setWeight(e?.weight == null ? "" : num(e.weight));
    setVals(Object.fromEntries(Object.entries(e?.fields || {}).map(([k, v]) => [k, num(v)])));
    setNote(e?.note || "");
  };
  const save = () => {
    const f = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, parse(v)]));
    const w = parse(weight);
    if (w === "" && !Object.values(f).some((v) => v !== "") && !existing) return ctx.back();
    saveMeasurement(date, { weight: w === "" ? null : w, fields: f, note });
    ctx.toast({ title: "Meting opgeslagen", detail: fmtDate(date), icon: "check", fill: "var(--accent-mint)", color: "var(--accent-mint-ink)" });
    ctx.back();
  };
  const del = () => { store.remove("m-" + date); ctx.back(); };

  return html`<div class="fill">
    <${DS.TopBar} title="Meting" leading="close" onLeading=${ctx.back} action=${html`<${DS.Button} onClick=${save}>Opslaan<//>`} />
    <div class="scroll">
      <div class="row" style=${{ borderTop: "1px solid var(--border)", paddingTop: 14, gap: 10 }}>
        <div class="flex1"><div class="body">Datum</div><div class="sub">Vorige waarde staat grijs ernaast</div></div>
        <input type="date" value=${date} max=${todayISO()} onChange=${(e) => changeDate(e.target.value)} style=${{ ...inputStyle, width: 150, fontSize: "var(--body-sm-size)" }} />
      </div>
      <div class="row" style=${{ gap: 12, marginTop: 14, paddingBottom: 12 }}>
        <div class="flex1">
          <div class="body">Gewicht</div>
          <div class="sub">${prevOf("weight") !== null ? `vorige ${num(prevOf("weight"))} kg` : "kg"}</div>
        </div>
        <input inputMode="decimal" placeholder="kg" value=${weight} onInput=${(e) => setWeight(e.target.value)} style=${inputStyle} />
      </div>
      <div class="label">Omtrekken in cm</div>
      ${fields().map((f) => html`<div key=${f.key} class="row" style=${{ gap: 12, padding: "6px 0" }}>
        <div class="flex1" style=${{ fontSize: "var(--body-md-size)", fontWeight: 700 }}>${f.label}</div>
        <div class="sub">${prevOf(f.key) !== null ? num(prevOf(f.key)) : ""}</div>
        <input inputMode="decimal" placeholder="–" value=${vals[f.key] ?? ""} onInput=${(e) => setVals({ ...vals, [f.key]: e.target.value })} style=${inputStyle} />
      </div>`)}
      <textarea class="field" style=${{ marginTop: 12, minHeight: 64 }} value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="Opmerking (optioneel)"></textarea>
      <div class="sub" style=${{ marginTop: 12 }}>Lege velden sla je over. Welke omtrekken je bijhoudt, pas je aan in Instellingen.</div>
      ${existing && html`<div style=${{ display: "flex", justifyContent: "center", marginTop: 12 }}><${DS.Button} variant="quiet" onClick=${del}>Meting verwijderen<//></div>`}
    </div>
  </div>`;
}

export function MeasureImport({ ctx }) {
  const [res, setRes] = useState(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const input = useRef(null);

  const pick = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setErr(""); setDone(null);
    try {
      setRes(parseMeasurementsCSV(await f.text()));
      setName(f.name);
    } catch (x) {
      setRes(null);
      setErr(x.message);
    }
    e.target.value = "";
  };
  const run = () => {
    for (const r of res.rows) saveMeasurement(r.date, r);
    setDone(res.rows.length);
  };

  return html`<div class="fill">
    <${DS.TopBar} title="Metingen importeren" leading="close" onLeading=${ctx.back} />
    <div class="scroll">
      <input ref=${input} type="file" accept=".csv,text/csv" onChange=${pick} style=${{ display: "none" }} />
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div class="title">Uit je Google Sheet</div>
        <div class="sub" style=${{ marginTop: 4 }}>Open "Gym dashboard" in Google Sheets en kies Bestand > Downloaden > Door komma's gescheiden waarden (.csv). Kies dat bestand hieronder. De app zoekt zelf de kopregel met Datum, Gewicht, Borst, enzovoort.</div>
        <div style=${{ marginTop: 16 }}><${DS.Button} onClick=${() => (DEMO ? ctx.toast({ title: "Niet in de demo", detail: "Dit werkt alleen in je echte app.", icon: "close" }) : input.current.click())}>${res ? "Ander bestand kiezen" : "Bestand kiezen"}<//></div>
        ${err && html`<div class="error">${err}</div>`}
      </div>
      ${res && html`<div class="section">
        <div class="title">${name}</div>
        <div class="sub">${res.rows.length} ${res.rows.length === 1 ? "meting" : "metingen"} gevonden${res.skipped ? `, ${res.skipped} lege rijen overgeslagen` : ""}.${res.unknown.length ? ` Niet herkend en dus niet meegenomen: ${res.unknown.join(", ")}.` : ""}</div>
        <div style=${{ marginTop: 8 }}>
          ${res.rows.map((r, i) => html`<div key=${r.date} class="row" style=${{ gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
            <span class="flex1 body">${fmtDate(r.date)}</span>
            <span class="sub">${r.weight !== null ? num(r.weight) + " kg · " : ""}${Object.keys(r.fields).length} omtrekken</span>
          </div>`)}
        </div>
        ${done === null
          ? html`<div style=${{ marginTop: 14 }}><${DS.Button} disabled=${!res.rows.length} onClick=${run}>Importeren<//></div>
              <div class="sub" style=${{ marginTop: 8 }}>Staat er op een datum al een meting, dan worden de waarden aangevuld.</div>`
          : html`<div style=${{ marginTop: 14 }}>
              <${DS.Toast} icon="check" fill="var(--accent-mint)" color="var(--accent-mint-ink)" title="Geïmporteerd" detail=${`${done} metingen staan nu in de app`} />
              <div style=${{ marginTop: 12 }}><${DS.Button} onClick=${() => ctx.tab("measure")}>Naar metingen<//></div>
            </div>`}
      </div>`}
    </div>
  </div>`;
}
