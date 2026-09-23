import { html, DS, useState, useMemo, Icon } from "../ui.js";
import * as store from "../store.js";
import { kg, dateNum, doneWorkouts, volume } from "../logic.js";
import { inRange, strengthCharts, volumeBuckets, countPrs, formatMetric, METRICS, MONTHS_LONG, monthOf, shiftMonth, groupColor } from "../stats.js";

const SHOW = 6;

function StrengthChart({ ctx, c, onMetric }) {
  const delta = c.pct === 0 ? "0%" : (c.pct > 0 ? "+" : "−") + Math.abs(c.pct) + "%";
  const fmt = (v) => formatMetric(c.type, v, c.metric);
  const color = groupColor(c.ex.group);
  return html`<div style=${{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 14 }}>
    <button type="button" class="plainbtn" onClick=${() => ctx.go("exercise", { id: c.id })} style=${{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
      <${DS.IconBadge} icon="dumbbell" size=${30} fill=${`color-mix(in srgb, ${color} 20%, var(--surface-primary))`} color=${color} />
      <div class="flex1"><div class="body">${c.ex.name}</div><div class="sub">${c.ex.group || "Overig"}</div></div>
      <div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700, color: c.good ? "var(--delta-up)" : "var(--ink-soft)" }}>${delta}</div>
    </button>
    <div class="display" style=${{ marginTop: 8 }}>${fmt(c.value)}</div>
    <${DS.LineChart} values=${c.points.map((p) => p.v)} labels=${c.points.map((p) => dateNum(p.at))} prIndex=${c.prIndex} height=${116} formatValue=${fmt} color=${color} />
    <div style=${{ marginTop: 18 }}><${DS.MetricSelector} options=${METRICS[c.type] || METRICS.kg} value=${c.metric} onChange=${onMetric} /></div>
  </div>`;
}

export function Progress({ ctx }) {
  const [range, setRange] = useState(() => store.getMeta("progressRange", "3m"));
  const [metrics, setMetrics] = useState(() => store.getMeta("progressMetrics", {}));
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");
  const pickRange = (r) => { setRange(r); store.setMeta("progressRange", r); };
  const setMetric = (id, m) => { const x = { ...metrics, [id]: m }; setMetrics(x); store.setMeta("progressMetrics", x); };

  const done = useMemo(() => doneWorkouts(ctx.workouts), [ctx.workouts]);
  const ws = useMemo(() => inRange(ctx.workouts, range), [ctx.workouts, range]);
  const charts = useMemo(() => strengthCharts(ws, ctx.exById, (id) => metrics[id]), [ws, ctx.exById, metrics]);
  const vol = useMemo(() => volumeBuckets(ws, ctx.exById, range), [ws, ctx.exById, range]);
  const prs = useMemo(() => countPrs(ws, ctx.workouts, ctx.exById), [ws, ctx.workouts, ctx.exById]);
  const totalVol = useMemo(() => ws.reduce((n, w) => n + volume(w, ctx.exById), 0), [ws, ctx.exById]);

  if (!done.length) {
    return html`<div class="page">
      <div class="title">Voortgang</div>
      <div style=${{ marginTop: 40 }}><${DS.EmptyState} icon="trend" title="Nog geen trainingen" body="Na je eerste workout zie je hier je voortgang. Of haal je historie uit Hevy binnen." action="Hevy importeren" onAction=${() => ctx.go("import")} /></div>
    </div>`;
  }

  const needle = q.trim().toLowerCase();
  const filtered = needle ? charts.filter((c) => c.ex.name.toLowerCase().includes(needle)) : charts;
  const shown = all || needle ? filtered : filtered.slice(0, SHOW);
  const month = shiftMonth(monthOf(Date.now()), -1); // laatste afgeronde maand

  return html`<div class="page">
    <div class="row" style=${{ gap: 11, paddingBottom: 8 }}>
      <span class="avatar">V</span>
      <div>
        <div class="title">Voortgang</div>
        <div class="sub" style=${{ fontWeight: 700 }}>Sinds ${dateNum(done[done.length - 1].start)} ${new Date(done[done.length - 1].start).getFullYear()}</div>
      </div>
    </div>
    <div style=${{ marginTop: 24 }}><${DS.RangeSelector} value=${range} onChange=${pickRange} /></div>
    <div style=${{ display: "flex", gap: 8, marginTop: 16 }}>
      <div style=${{ flex: 1 }}><${DS.StatChip} label="PR's" value=${String(prs)} fill="var(--stat-pr-fill)" color="var(--stat-pr-ink)" /></div>
      <div style=${{ flex: 1 }}><${DS.StatChip} label="Sessies" value=${String(ws.length)} fill="var(--stat-sessions-fill)" color="var(--stat-sessions-ink)" /></div>
      <div style=${{ flex: 1.4 }}><${DS.StatChip} label="Volume" value=${kg(totalVol)} fill="var(--stat-volume-fill)" color="var(--stat-volume-ink)" /></div>
    </div>

    <div style=${{ marginTop: 22 }}>
      <div class="title">Kracht per oefening</div>
      <div class="sub">Oefeningen die je in deze periode minstens 2× deed</div>
    </div>
    ${charts.length > SHOW && (all || needle) && html`<div class="row" style=${{ gap: 8, marginTop: 12, background: "var(--surface-tint)", borderRadius: "var(--radius-md)", padding: "0 12px", color: "var(--ink-soft)" }}>
      ${Icon("search", 17)}
      <input value=${q} onInput=${(e) => setQ(e.target.value)} placeholder="Zoek oefening"
        style=${{ flex: 1, minWidth: 0, height: 44, border: "none", background: "transparent", fontFamily: "inherit", fontSize: "var(--body-md-size)", fontWeight: 700, outline: "none" }} />
    </div>`}
    ${!charts.length && html`<div class="sub" style=${{ marginTop: 12 }}>Nog geen oefening twee keer gedaan in deze periode. Kies een langere periode.</div>`}
    ${shown.map((c) => html`<${StrengthChart} key=${c.id + c.metric} ctx=${ctx} c=${c} onMetric=${(m) => setMetric(c.id, m)} />`)}
    ${charts.length > SHOW && !needle && html`<div style=${{ marginTop: 12 }}>
      <${DS.Chip} onClick=${() => setAll(!all)}>${all ? "Minder tonen" : `Alle ${charts.length} oefeningen`}<//>
    </div>`}

    <div style=${{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 14 }}>
      <div class="row" style=${{ gap: 10 }}>
        <${DS.IconBadge} icon="bars" size=${30} fill="var(--accent-blue-light)" color="var(--accent-blue)" />
        <div><div class="body">Volume</div><div class="sub">${vol.weekly ? "Per week" : "Per maand"}, alle oefeningen</div></div>
      </div>
      <div class="display" style=${{ marginTop: 10 }}>${kg(vol.values[vol.values.length - 1] || 0)}</div>
      <div class="sub">${vol.weekly ? "Deze week" : "Deze maand"} tot nu toe</div>
      ${vol.values.length >= 2 && html`<${DS.LineChart} values=${vol.values} labels=${vol.labels} color="var(--accent-blue)" height=${110} formatValue=${(v) => kg(v)} />`}
    </div>

    <div class="row" style=${{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 14, gap: 10 }}>
      <div class="flex1 sub">Je maandoverzicht van ${MONTHS_LONG[month.m]} staat klaar.</div>
      <${DS.Chip} onClick=${() => ctx.go("recap", month)}>Bekijken<//>
    </div>
  </div>`;
}
