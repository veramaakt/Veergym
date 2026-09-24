// Weekoverzicht eten, in de stijl van het maandoverzicht van de gym.
// Cijfers en grafiek rekent de app zelf; de tekst onderaan komt van Claude (één keer per week, bewaard).
import { html, DS, useState, useEffect, Icon } from "../ui.js";
import * as store from "../store.js";
import { num } from "../logic.js";
import { todayISO } from "../measure.js";
import { goals, shiftDay, dayLabel, lastSunday, weekId, weekStats, weekDays, topMeals, weekPlanText } from "../food.js";
import { makeWeekReview } from "../foodai.js";
import { copyText } from "../clipboard.js";

// Zelfde kleuren als de blokjes op Eten (en PR's/Sessies/Volume op Voortgang).
const METRICS = [
  { key: "kcal", label: "Kcal", unit: "kcal", fill: "var(--food-hero-fill)", ink: "var(--food-hero-ink)" },
  { key: "protein", label: "Eiwit", unit: "g", fill: "var(--stat-pr-fill)", ink: "var(--stat-pr-ink)" },
  { key: "fat", label: "Vet", unit: "g", fill: "var(--stat-sessions-fill)", ink: "var(--stat-sessions-ink)" },
  { key: "carbs", label: "Koolhydraten", unit: "g", fill: "var(--stat-volume-fill)", ink: "var(--stat-volume-ink)" },
];

const head = (icon, fill, color, title) => html`<div class="row" style=${{ gap: 10 }}>
  <${DS.IconBadge} icon=${icon} size=${30} fill=${fill} color=${color} />
  <div class="body">${title}</div>
</div>`;

/** Staaf per dag, met een stippellijn op je dagdoel. Boven of onder het doel: zelfde kleur (geen oordeel). */
function DayBars({ days, metric, goal }) {
  const max = Math.max(goal * 1.25, ...days.map((d) => d[metric.key]));
  const H = 140;
  const h = (v) => (v / max) * H;
  return html`<div style=${{ marginTop: 26 }}>
    <div style=${{ position: "relative", height: H, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
      <div style=${{ position: "absolute", left: 0, right: 0, bottom: h(goal), borderTop: "1.5px dashed var(--ink-soft)", opacity: 0.6, zIndex: 1 }}></div>
      <div class="caption" style=${{ position: "absolute", right: 0, bottom: h(goal) + 3, zIndex: 1 }}>doel ${num(goal)}</div>
      ${days.map((d) => {
        const bh = d.logged ? Math.max(4, h(d[metric.key])) : 4;
        return html`<div key=${d.date} style=${{ position: "relative", height: "100%", display: "flex", justifyContent: "center" }}>
          <div style=${{ position: "absolute", bottom: 0, width: "100%", maxWidth: 34, height: bh, background: d.logged ? metric.fill : "var(--surface-tint)", borderRadius: d.logged ? "8px 8px 4px 4px" : 4 }}></div>
          ${d.logged && bh > 24
            ? html`<div style=${{ position: "absolute", bottom: bh - 18, fontSize: "var(--caption-size)", fontWeight: 800, color: metric.ink, zIndex: 2 }}>${num(Math.round(d[metric.key]))}</div>`
            : html`<div style=${{ position: "absolute", bottom: bh + 4, fontSize: "var(--caption-size)", fontWeight: 800, color: d.logged ? "var(--ink)" : "var(--ink-soft)", zIndex: 2 }}>${d.logged ? num(Math.round(d[metric.key])) : "–"}</div>`}
        </div>`;
      })}
    </div>
    <div style=${{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 6 }}>
      ${days.map((d) => html`<div key=${d.date} class="caption" style=${{ textAlign: "center" }}>${d.short}</div>`)}
    </div>
  </div>`;
}

function AvgRow({ m, value, goal }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return html`<div style=${{ padding: "8px 0" }}>
    <div class="row" style=${{ justifyContent: "space-between" }}>
      <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 800 }}>${m.label}</div>
      <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 700, color: "var(--ink-soft)" }}>${num(Math.round(value))} van ${num(goal)} ${m.unit}</div>
    </div>
    <div style=${{ height: 10, borderRadius: "var(--radius-pill)", background: "var(--surface-tint)", overflow: "hidden", marginTop: 6 }}>
      <div style=${{ width: pct + "%", height: "100%", borderRadius: "var(--radius-pill)", background: m.fill }}></div>
    </div>
  </div>`;
}

export function FoodWeek({ ctx, params }) {
  const today = todayISO();
  const newest = lastSunday(today);
  const current = today === newest ? newest : shiftDay(newest, 7); // lopende week
  const sunday = params.sunday || newest;
  const g = goals();
  const st = weekStats(sunday);
  const prev = weekStats(shiftDay(sunday, -7));
  const days = weekDays(sunday);
  const top = topMeals(sunday);
  const saved = store.get(weekId(sunday));
  const [metric, setMetric] = useState("Kcal");
  const [state, setState] = useState({ busy: false, err: "" });
  const [copied, setCopied] = useState(false);
  const m = METRICS.find((x) => x.label === metric) || METRICS[0];
  const running = sunday > today;
  const go = (n) => ctx.replace("foodweek", { sunday: shiftDay(sunday, 7 * n) });
  const make = () => {
    setState({ busy: true, err: "" });
    makeWeekReview(sunday).then(() => setState({ busy: false, err: "" }), (e) => setState({ busy: false, err: e.message }));
  };
  // Van de laatste (afgeronde) week maakt de app het Claude-deel vanzelf; oudere weken alleen op verzoek.
  useEffect(() => { setCopied(false); if (sunday === newest && !saved && st.noted) make(); }, [sunday]);
  const { date: from } = dayLabel(shiftDay(sunday, -6));
  const { date: to } = dayLabel(sunday);
  const stats = [
    { label: "Gem. kcal", value: st.days ? num(Math.round(st.kcal)) : "–", prev: prev.days ? `vorige week ${num(Math.round(prev.kcal))}` : "", color: "var(--ink)" },
    { label: "Gem. eiwit", value: st.days ? num(Math.round(st.protein)) + " g" : "–", prev: prev.days ? `vorige week ${num(Math.round(prev.protein))} g` : "", color: "var(--stat-pr-ink)" },
    { label: "Eiwitdoel", value: st.days ? `${st.proteinHit}/${st.days}` : "–", prev: st.days ? "dagen gehaald" : "", color: "var(--ink)" },
  ];

  return html`<div class="page" style=${{ padding: "16px 16px 28px" }}>
    <div class="row" style=${{ justifyContent: "space-between" }}>
      <div class="row" style=${{ gap: 0, marginLeft: -10 }}>
        <button type="button" class="iconbtn" aria-label="Vorige week" onClick=${() => go(-1)}><span style=${{ transform: "rotate(90deg)", display: "grid" }}>${Icon("chevron-down", 18)}</span></button>
        <button type="button" class="iconbtn" aria-label="Volgende week" disabled=${sunday >= current} style=${{ opacity: sunday >= current ? 0.4 : 1 }} onClick=${() => sunday < current && go(1)}><span style=${{ transform: "rotate(-90deg)", display: "grid" }}>${Icon("chevron-down", 18)}</span></button>
      </div>
      <button type="button" class="iconbtn" aria-label="Sluiten" onClick=${ctx.back} style=${{ marginRight: -5 }}>
        <span style=${{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-tint)", display: "grid", placeItems: "center" }}>${Icon("close", 16)}</span>
      </button>
    </div>
    <div class="caption" style=${{ marginTop: 8 }}>Weekoverzicht eten</div>
    <div class="display" style=${{ marginTop: 4 }}>${running ? "Zo gaat je week tot nu toe" : "Zo at je deze week"}</div>
    <div class="sub" style=${{ fontWeight: 700, marginTop: 8 }}>${from} t/m ${to}${running ? " · loopt nog" : ""}</div>

    ${!st.noted ? html`<div class="section"><${DS.EmptyState} icon="fork" title="Niets ingevuld" body="In deze week staan geen maaltijden." /></div>` : html`<div>
      <div style=${{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 8 }}>
        ${stats.map((s, i) => html`<div key=${s.label} style=${{ textAlign: i === 2 ? "right" : "left" }}>
          <div class="caption">${s.label}</div>
          <div class="display" style=${{ color: s.color }}>${s.value}</div>
          ${s.prev && html`<div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700, color: "var(--ink-soft)" }}>${s.prev}</div>`}
        </div>`)}
      </div>

      <div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("bars", "var(--food-hero-fill)", "var(--food-hero-ink)", "Per dag")}
        <div style=${{ marginTop: 14 }}><${DS.MetricSelector} options=${METRICS.map((x) => x.label)} value=${m.label} onChange=${setMetric} /></div>
        <${DayBars} days=${days} metric=${m} goal=${g[m.key]} />
        <div class="sub" style=${{ marginTop: 8 }}>${st.days} van 7 dagen met macro's ingevuld.</div>
      </div>

      ${st.days > 0 && html`<div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("fork", "var(--stat-pr-fill)", "var(--stat-pr-ink)", "Gemiddeld per dag")}
        <div class="sub">Over de dagen met macro's, naast je dagdoel</div>
        <div style=${{ marginTop: 6 }}>${METRICS.map((x) => html`<${AvgRow} key=${x.key} m=${x} value=${st[x.key]} goal=${g[x.key]} />`)}</div>
      </div>`}

      ${top.length > 0 && html`<div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("repeat", "var(--stat-sessions-fill)", "var(--stat-sessions-ink)", "Wat je het vaakst at")}
        <div style=${{ marginTop: 8 }}>${top.map((t, i) => html`<div key=${i} class="on-pastel-row"><${DS.ListRow} first=${i === 0} icon="fork" badgeFill=${t.meal.accent} name=${t.note} sub=${t.meal.label} value=${t.count + "×"} /></div>`)}</div>
      </div>`}

      <div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("trend", "var(--stat-volume-fill)", "var(--stat-volume-ink)", "Voor je maaltijdplan")}
        ${saved ? html`<div>
          <div style=${{ fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)", fontWeight: 600, marginTop: 12 }}>${saved.summary}</div>
          ${saved.tips.map((t, i) => html`<div key=${i} style=${{ marginTop: 10, background: "var(--surface-tint)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
            <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 800 }}>${t.title}</div>
            <div class="sub" style=${{ marginTop: 2 }}>${t.detail}</div>
          </div>`)}
          <div class="caption" style=${{ margin: "16px 0 2px" }}>Ideeën voor volgende week</div>
          ${saved.meal_ideas.map((idea, i) => {
            const [meal, ...rest] = idea.split(":");
            const has = rest.length > 0;
            return html`<div key=${i} class="row" style=${{ gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              ${has && html`<span class="tag" style=${{ flex: "none" }}>${meal.trim()}</span>`}
              <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 700 }}>${has ? rest.join(":").trim() : idea}</div>
            </div>`;
          })}
          <div class="chips" style=${{ marginTop: 12, justifyContent: "flex-end" }}>
            <${DS.Chip} onClick=${make}>${state.busy ? "Bezig…" : "Opnieuw maken"}<//>
            <${DS.Chip} onClick=${async () => setCopied(await copyText(weekPlanText(sunday, saved)))}>${copied ? "Gekopieerd" : "Kopieer voor maaltijdplan"}<//>
          </div>
        </div>` : html`<div>
          <div class="sub" style=${{ marginTop: 10 }}>${state.busy ? "Claude maakt je weekoverzicht…" : "Claude kijkt naar je week en geeft tips en maaltijdideeën voor volgende week."}</div>
          ${!state.busy && html`<div class="chips" style=${{ marginTop: 10, justifyContent: "flex-end" }}><${DS.Chip} onClick=${make}>Maak tips<//></div>`}
        </div>`}
        ${state.err && html`<div class="error">${state.err}</div>`}
      </div>
    </div>`}
  </div>`;
}
