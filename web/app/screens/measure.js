import { html, DS, DEMO, useState, useRef, Icon } from "../ui.js";
import * as store from "../store.js";
import { num } from "../logic.js";
import {
  fields, measurements, series, sinceStart, weekWindow, nextMeasure, saveMeasurement,
  fmtDate, fmtDay, todayISO, parseMeasurementsCSV, BODY_FIELDS, describe, importWeighings,
} from "../measure.js";

const cm = (v) => (v === null || v === undefined ? null : num(v));
const signed = (d, unit) => (d === null || d === 0 ? "" : `${num(Math.abs(d))}${unit ? " " + unit : ""}`);

/** Kop van een inklapbaar blok: icoon, titel, subregel en een pijltje. */
function FoldHeader({ icon, fill, color, title, sub, open, onToggle }) {
  return html`<button type="button" class="plainbtn" onClick=${onToggle} aria-expanded=${open} style=${{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 10 }}>
    <${DS.IconBadge} icon=${icon} size=${30} fill=${fill} color=${color} />
    <div class="flex1"><div class="body">${title}</div><div class="sub">${sub}</div></div>
    <span style=${{ display: "grid", placeItems: "center", color: "var(--ink-soft)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}>${Icon("chevron-down", 18)}</span>
  </button>`;
}

function DueRow({ ctx, plan, any }) {
  const title = plan.last === null ? (any ? "Nog geen omtrekken gemeten" : "Nog geen metingen") : plan.missed ? "Meetmoment gemist" : plan.due ? "Meetmoment vandaag" : `Volgende meetmoment: ${fmtDay(plan.next)}`;
  const sub = plan.last === null ? (any ? "Vul je eerste meting in, of importeer je sheet" : "Vul je eerste meting in, of importeer je sheet of weegschaal") : `Laatste meting ${fmtDate(plan.last)}`;
  return html`<div class="row" style=${{ gap: 10, marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
    <div class="flex1"><div class="body">${title}</div><div class="sub">${sub}</div></div>
    ${plan.due
      ? html`<${DS.Button} size="sm" onClick=${() => ctx.go("measureEntry", {})}>Invullen<//>`
      : html`<${DS.Chip} onClick=${() => ctx.go("measureEntry", {})}>Invullen<//>`}
  </div>`;
}

export function Measure({ ctx }) {
  const list = measurements();
  const plan = nextMeasure(list);
  const w = series(list, "weight");
  const ws = sinceStart(w);
  const win = weekWindow(w);
  const [folds, setFolds] = useState(() => store.getMeta("measureFolds", {}));
  const fold = (k) => { const x = { ...folds, [k]: !folds[k] }; setFolds(x); store.setMeta("measureFolds", x); };
  const lastOf = (key) => sinceStart(series(list, key));
  const bodyRows = BODY_FIELDS.map((f) => ({ f, s: lastOf("body." + f.key) })).filter((x) => x.s.value !== null);
  // Ingeklapt een korte samenvatting, zodat je ook dicht iets ziet.
  const circSummary = ["taille", "buik", "heupen", "billen"].map((k) => ({ k, s: lastOf(k) })).filter((x) => x.s.value !== null)
    .map(({ k, s }) => `${describe(k).label.split(" /")[0]} ${num(s.value)}`).join(" · ");
  const bodySummary = bodyRows.filter(({ f }) => f.key === "fat_pct" || f.key === "muscle_kg").map(({ f, s }) => `${f.key === "fat_pct" ? "Vet" : "Spieren"} ${num(s.value)} ${f.unit}`).join(" · ");

  return html`<div class="page">
    <div class="title">Metingen</div>
    <${DueRow} ctx=${ctx} plan=${plan} any=${list.length > 0} />

    ${!list.length ? html`<div class="section">
      <${DS.EmptyState} icon="scale" title="Nog geen metingen" body="Vul je gewicht en omtrekken in, of haal je metingen uit je Google Sheet of weegschaal."
        action="Importeren" onAction=${() => ctx.go("measureImport")} />
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
        <${FoldHeader} icon="bars" fill="var(--accent-lavender)" color="#211a12" title="Omtrekken" open=${!!folds.circ} onToggle=${() => fold("circ")}
          sub=${plan.last === null ? "Nog geen omtrekken" : folds.circ ? `Laatste meting ${fmtDate(plan.last)} · verschil t.o.v. start` : `${circSummary} cm`} />
        ${!folds.circ ? null : plan.last === null ? html`<div class="sub" style=${{ marginTop: 10 }}>Nog geen omtrekken. Vul ze in via Invullen hierboven, of importeer je Google Sheet.</div>` : html`<div style=${{ marginTop: 8 }}>
          ${fields().map((f, i) => {
            const s = sinceStart(series(list, f.key));
            return html`<${DS.MeasurementRow} key=${f.key} first=${i === 0} label=${f.label} value=${cm(s.value)}
              sinceStart=${signed(s.delta, "cm")} direction=${s.direction} onClick=${() => ctx.go("measureDetail", { key: f.key })} />`;
          })}
        </div>`}
      </div>
    </div>`}

    ${bodyRows.length > 0 && html`<div class="section" style=${{ marginTop: 20 }}>
      <${FoldHeader} icon="radar" fill="var(--accent-mint)" color="var(--accent-mint-ink)" title="Lichaamssamenstelling" open=${!!folds.body} onToggle=${() => fold("body")}
        sub=${folds.body ? "Van je weegschaal · verschil t.o.v. eerste weging" : bodySummary} />
      ${folds.body && html`<div style=${{ marginTop: 8 }}>
        ${bodyRows.map(({ f, s: st }, i) => html`<${DS.MeasurementRow}
          key=${f.key} first=${i === 0} label=${f.label} value=${num(st.value)} unit=${f.unit}
          sinceStart=${signed(st.delta, f.unit)} direction=${st.direction} onClick=${() => ctx.go("measureDetail", { key: "body." + f.key })} />`)}
      </div>`}
    </div>`}

    <div class="section" style=${{ marginTop: 20 }}>
      <div class="row" style=${{ gap: 10 }}>
        <${DS.IconBadge} icon="calendar" size=${30} fill="var(--fill-peach)" color="#211a12" />
        <div class="flex1"><div class="body">Foto's</div><div class="sub">Voor, zij en achter per meetmoment</div></div>
        <span class="tag">Binnenkort</span>
      </div>
      <div class="sub" style=${{ marginTop: 8 }}>Zie je vooruitgang ook als de cijfers stilstaan. Je vorige foto ligt half doorzichtig over de camera, zodat je steeds precies zo staat, en je zet twee datums naast elkaar.</div>
    </div>

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
  const { label: title, unit } = describe(key);
  const list = measurements();
  const pts = series(list, key);
  const s = sinceStart(pts);
  return html`<div class="fill">
    <${DS.TopBar} title=${title} leading="close" onLeading=${ctx.back} />
    <div class="scroll">
      <div style=${{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div class="caption">Laatste meting${s.lastDate ? " · " + fmtDate(s.lastDate) : ""}</div>
        <div class="display" style=${{ marginTop: 4 }}>${s.value === null ? "–" : `${num(s.value)}${unit ? " " + unit : ""}`}</div>
        ${s.delta ? html`<div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700, color: "var(--ink-soft)" }}>${s.direction === "up" ? "↑" : "↓"}${signed(s.delta, unit)} sinds ${fmtDate(s.startDate)}</div>` : null}
      </div>
      ${pts.length >= 2
        ? html`<div style=${{ marginTop: 16 }}><${DS.LineChart} values=${pts.map((p) => p.v)} labels=${pts.map((p) => fmtDate(p.date))} color="var(--accent-pink)" height=${140} formatValue=${(v) => `${num(v)}${unit ? " " + unit : ""}`} /></div>`
        : html`<${DS.EmptyState} icon="trend" title="Nog geen verloop" body="Na twee metingen zie je hier een grafiek." />`}
      <div style=${{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 6 }}>
        ${[...pts].reverse().map((p) => html`<button type="button" key=${p.date} class="plainbtn" onClick=${() => ctx.go("measureEntry", { date: p.date })}
          style=${{ width: "100%", display: "flex", alignItems: "baseline", gap: 10, padding: "10px 0", fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)" }}>
          <span class="flex1" style=${{ fontWeight: 600, color: "var(--ink-soft)" }}>${fmtDate(p.date)}</span>
          <span style=${{ fontWeight: 800 }}>${num(p.v)}${unit ? " " + unit : ""}</span>
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
      <div class="row" style=${{ gap: 10, marginTop: 18 }}>
        <div class="flex1"><div class="label" style=${{ margin: 0 }}>Foto's</div></div>
        <span class="tag">Binnenkort</span>
      </div>
      <div style=${{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
        ${["Voor", "Zij", "Achter"].map((side) => html`<div key=${side} aria-disabled="true"
          style=${{ aspectRatio: "3 / 4", borderRadius: "var(--radius-md)", border: "1px dashed var(--border)", background: "var(--surface-tint)", display: "grid", placeItems: "center", color: "var(--ink-soft)", opacity: 0.7 }}>
          <div style=${{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>${Icon("plus", 18)}<span class="caption">${side}</span></div>
        </div>`)}
      </div>
      <div class="sub" style=${{ marginTop: 6 }}>Straks maak je hier per meting drie foto's, met je vorige foto als hulplijn over de camera.</div>
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
  const ffInput = useRef(null);
  const [ff, setFf] = useState({ busy: false, res: null, err: "", done: null });

  const pickFeelfit = async (e) => {
    const list = [...e.target.files];
    e.target.value = "";
    if (!list.length) return;
    setFf({ busy: true, res: null, err: "", done: null });
    try {
      const files = await Promise.all(list.map(async (f) => {
        const bytes = new Uint8Array(await f.arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return { name: f.name, data: btoa(bin) };
      }));
      const r = await fetch("api/import/feelfit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + store.getMeta("token") },
        body: JSON.stringify({ files }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.detail || "Inlezen mislukt (" + r.status + ")");
      setFf({ busy: false, res: body, err: "", done: null });
    } catch (x) {
      setFf({ busy: false, res: null, err: navigator.onLine ? x.message : "Importeren kan alleen online.", done: null });
    }
  };
  const runFeelfit = () => setFf({ ...ff, done: importWeighings(ff.res.rows) });

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
      <div class="section">
        <input ref=${ffInput} type="file" multiple accept=".xlsx,.csv" onChange=${pickFeelfit} style=${{ display: "none" }} />
        <div class="title">Uit je weegschaal (Feelfit)</div>
        <div class="sub" style=${{ marginTop: 4 }}>Exporteer in de Feelfit-app je meetwaarden (Excel). Je kunt meerdere bestanden tegelijk kiezen; dubbele wegingen worden samengevoegd. Per dag telt de vroegste weging.</div>
        <div style=${{ marginTop: 16 }}><${DS.Button} disabled=${ff.busy} onClick=${() => (DEMO ? ctx.toast({ title: "Niet in de demo", detail: "Dit werkt alleen in je echte app.", icon: "close" }) : ffInput.current.click())}>${ff.busy ? "Bezig met lezen…" : ff.res ? "Andere bestanden kiezen" : "Bestanden kiezen"}<//></div>
        ${ff.err && html`<div class="error">${ff.err}</div>`}
        ${ff.res && html`<div style=${{ marginTop: 14 }}>
          <div class="body">${ff.res.rows.length} dagen met een weging</div>
          <div class="sub">${ff.res.weighings} wegingen, ${fmtDate(ff.res.first)} t/m ${fmtDate(ff.res.last)}. Gewicht plus vetpercentage, spiermassa en meer.</div>
          ${ff.done === null
            ? html`<div style=${{ marginTop: 12 }}><${DS.Button} onClick=${runFeelfit}>Importeren<//></div>
                <div class="sub" style=${{ marginTop: 8 }}>Staat er op een dag al een meting (bijv. uit je sheet), dan blijven die waarden staan en wordt alleen aangevuld.</div>`
            : html`<div style=${{ marginTop: 12 }}>
                <${DS.Toast} icon="check" fill="var(--accent-mint)" color="var(--accent-mint-ink)" title="Geïmporteerd" detail=${`${ff.done.added} nieuwe dagen, ${ff.done.merged} aangevuld`} />
                <div style=${{ marginTop: 12 }}><${DS.Button} onClick=${() => ctx.tab("measure")}>Naar metingen<//></div>
              </div>`}
        </div>`}
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
