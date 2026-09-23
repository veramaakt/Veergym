import { html, DS, useMemo, Icon } from "../ui.js";
import { kg, fmtSet, prTag } from "../logic.js";
import { monthRecap, shiftMonth, MONTHS_LONG, RADAR_GROUPS } from "../stats.js";

function delta(cur, prev, prevLabel, pct = false) {
  if (!prev && !cur) return { dir: "up", text: "" };
  const d = pct ? (prev ? Math.round(((cur - prev) / prev) * 100) : 0) : cur - prev;
  return { dir: d >= 0 ? "up" : "down", text: `${Math.abs(d)}${pct ? "%" : ""} vs ${prevLabel}` };
}


export function Recap({ ctx, params }) {
  const month = { y: params.y, m: params.m };
  const r = useMemo(() => monthRecap(ctx.workouts, ctx.exById, month), [ctx.workouts, ctx.exById, params.y, params.m]);
  const name = MONTHS_LONG[month.m];
  const prevName = MONTHS_LONG[shiftMonth(month, -1).m].slice(0, 3);
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const go = (d) => ctx.replace("recap", shiftMonth(month, d));
  const now = new Date();
  const isCurrent = month.y === now.getFullYear() && month.m === now.getMonth();

  const stats = [
    { label: "Sessies", value: String(r.sessions), ...delta(r.sessions, r.prevSessions, prevName), color: "var(--ink)" },
    { label: "PR's", value: String(r.prs), ...delta(r.prs, r.prevPrs, prevName), color: "var(--accent-orange-fg)" },
    { label: "Volume", value: kg(r.volume), ...delta(r.volume, r.prevVolume, prevName, true), color: "var(--ink)" },
  ];
  const axes = RADAR_GROUPS.filter((g) => r.groups[g] || r.prevGroups[g]);
  const bars = RADAR_GROUPS.map((g) => ({ label: g, count: r.groups[g] })).filter((b) => b.count).sort((a, b) => b.count - a.count);
  const maxBar = Math.max(1, ...bars.map((b) => b.count));

  const head = (icon, fill, color, title) => html`<div class="row" style=${{ gap: 10 }}>
    <${DS.IconBadge} icon=${icon} size=${30} fill=${fill} color=${color} />
    <div class="body">${title}</div>
  </div>`;

  return html`<div class="page" style=${{ padding: "16px 16px 28px" }}>
    <div class="row" style=${{ justifyContent: "space-between" }}>
      <div class="row" style=${{ gap: 0, marginLeft: -10 }}>
        <button type="button" class="iconbtn" aria-label="Vorige maand" onClick=${() => go(-1)}><span style=${{ transform: "rotate(90deg)", display: "grid" }}>${Icon("chevron-down", 18)}</span></button>
        <button type="button" class="iconbtn" aria-label="Volgende maand" disabled=${isCurrent} style=${{ opacity: isCurrent ? 0.4 : 1 }} onClick=${() => !isCurrent && go(1)}><span style=${{ transform: "rotate(-90deg)", display: "grid" }}>${Icon("chevron-down", 18)}</span></button>
      </div>
      <button type="button" class="iconbtn" aria-label="Sluiten" onClick=${ctx.back} style=${{ marginRight: -5 }}>
        <span style=${{ width: 34, height: 34, borderRadius: "50%", background: "var(--surface-tint)", display: "grid", placeItems: "center" }}>${Icon("close", 16)}</span>
      </button>
    </div>
    <div class="caption" style=${{ marginTop: 8 }}>Maandoverzicht</div>
    <div class="display" style=${{ marginTop: 4 }}>Dit zijn je resultaten van ${name}</div>
    <div class="sub" style=${{ fontWeight: 700, marginTop: 8 }}>1 t/m ${days} ${name} ${month.y}</div>

    ${!r.sessions ? html`<div class="section"><${DS.EmptyState} icon="calendar" title="Geen trainingen" body=${`In ${name} heb je niets gelogd.`} /></div>` : html`<div>
      <div style=${{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        ${stats.map((s, i) => html`<div key=${s.label} style=${{ textAlign: i === 2 ? "right" : "left" }}>
          <div class="caption">${s.label}</div>
          <div class="display" style=${{ color: s.color }}>${s.value}</div>
          ${s.text && html`<${DS.StatDelta} direction=${s.dir}>${s.text}<//>`}
        </div>`)}
      </div>

      <div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("calendar", "var(--accent-blue-light)", "var(--accent-blue)", "Welke dagen trainde je")}
        <div style=${{ marginTop: 14 }}><${DS.CalendarGrid} days=${days} startWeekday=${new Date(month.y, month.m, 1).getDay()} trained=${r.trained} note=${r.pattern} /></div>
      </div>

      ${axes.length >= 3 && html`<div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("radar", "var(--accent-pink)", "var(--accent-pink-ink)", "Verdeling per spiergroep")}
        <div class="sub">Aantal sets per spiergroep</div>
        <div class="radar" style=${{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <${DS.RadarChart} size=${250} axes=${axes} series=${axes.map((g) => r.groups[g])} compare=${r.prev.length ? axes.map((g) => r.prevGroups[g]) : null}
            legend=${[{ label: name, color: "var(--accent-orange-fg)" }, ...(r.prev.length ? [{ label: MONTHS_LONG[shiftMonth(month, -1).m], color: "var(--accent-compare)" }] : [])]} />
        </div>
        <div style=${{ marginTop: 14 }}>${bars.map((b) => html`<${DS.MuscleBar} key=${b.label} label=${b.label} count=${b.count} max=${maxBar} />`)}</div>
      </div>`}

      ${r.records.length > 0 && html`<div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("trend", "var(--accent-orange)", "var(--accent-orange-ink)", "Personal records")}
        <div style=${{ marginTop: 8 }}>${r.records.map((p, i) => html`<button type="button" key=${p.exercise} class="plainbtn" style=${{ width: "100%" }} onClick=${() => ctx.go("exercise", { id: p.exercise })}>
          <${DS.ListRow} first=${i === 0} name=${ctx.exById[p.exercise]?.name} tags=${[...new Set(p.labels.map(prTag))]} value=${fmtSet(ctx.exById[p.exercise]?.type, p.set, true)} />
        </button>`)}</div>
      </div>`}

      <div class="section" style=${{ marginTop: 20, paddingTop: 16 }}>
        ${head("repeat", "var(--accent-mint)", "var(--accent-mint-ink)", "Top oefeningen")}
        <div style=${{ marginTop: 8 }}>${r.top.map(([id, n], i) => html`<${DS.ListRow} key=${id} first=${i === 0} name=${ctx.exById[id]?.name} badgeFill="var(--accent-mint)" sub=${ctx.exById[id]?.group || ""} value=${n + "×"} />`)}</div>
      </div>
    </div>`}
  </div>`;
}
