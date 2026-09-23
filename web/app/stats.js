// Cijfers voor de voortgangstab en het maandoverzicht. Alles wordt uit je
// workouts berekend, dus het werkt ook offline.
import { bests, doneWorkouts, volume, workoutPrs, dateNum } from "./logic.js";

const DAY = 86400000;
export const RANGES = { "4w": 28 * DAY, "3m": 91 * DAY, "1j": 365 * DAY, Alles: Infinity };
export const RADAR_GROUPS = ["Benen", "Billen", "Borst", "Rug", "Schouders", "Armen", "Core"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
export const MONTHS_LONG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const DAY_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export const METRICS = {
  kg: ["Zwaarste gewicht", "Geschat 1RM", "Beste set", "Sessievolume", "Totaal reps"],
  assist: ["Laagste assist", "Meeste reps", "Totaal reps"],
  reps: ["Meeste reps", "Totaal reps"],
  duur: ["Langste tijd", "Totale tijd"],
  afstand: ["Verste afstand", "Totale tijd"],
};

export function inRange(workouts, range, now = Date.now()) {
  const from = now - RANGES[range];
  return doneWorkouts(workouts).filter((w) => w.start >= from && w.start <= now);
}

/** Beste waarde van één sessie voor de gekozen meetwaarde. */
export function sessionValue(type, sets, metric) {
  const b = bests(type, sets);
  const counted = sets.filter((s) => s.type !== "warmup");
  const sum = (k) => counted.reduce((n, s) => n + (Number(s[k]) || 0), 0) || null;
  switch (metric) {
    case "Meeste reps": return b.maxR || null;
    case "Totaal reps": return sum("r");
    case "Beste set": return Math.max(0, ...counted.map((s) => (Number(s.w) || 0) * (Number(s.r) || 0))) || null;
    case "Sessievolume": return counted.reduce((n, s) => n + (Number(s.w) || 0) * (Number(s.r) || 0), 0) || null;
    case "Totale tijd": return sum("dur");
    case "Geschat 1RM": return b.e1rm ? Math.round(b.e1rm * 2) / 2 : null;
    case "Laagste assist": return b.minW;
    case "Langste tijd": return b.maxDur || null;
    case "Verste afstand": return b.maxDist || null;
    default: return b.maxW;
  }
}

/** Uitleg bij een meetwaarde, voor onder de grafiek. */
export const METRIC_HELP = {
  "Zwaarste gewicht": "Het zwaarste gewicht dat je per sessie tilde.",
  "Geschat 1RM": "Wat je naar schatting één keer zou kunnen tillen (Epley-formule).",
  "Beste set": "Je zwaarste set per sessie: gewicht × reps.",
  "Sessievolume": "Alle sets van deze oefening in een sessie opgeteld: gewicht × reps.",
  "Totaal reps": "Alle reps van deze oefening in een sessie opgeteld.",
  "Laagste assist": "Hoeveel hulp je nodig had. Lager is beter.",
  "Meeste reps": "Je beste set in aantal reps.",
};

const GROUP_SLUG = { Benen: "benen", Billen: "billen", Borst: "borst", Rug: "rug", Schouders: "schouders", Armen: "armen", Core: "core", Cardio: "cardio" };
/** Vaste kleur per spiergroep (tokens in app.css), voor lijn en icoon. */
export const groupColor = (group) => `var(--g-${GROUP_SLUG[group] || "overig"})`;

/** Is een lagere waarde beter? Alleen bij het assist-gewicht. */
export const lowerIsBetter = (metric) => metric === "Laagste assist";

export function formatMetric(type, v, metric) {
  const n = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(v);
  if (metric === "Meeste reps" || metric === "Totaal reps") return n + " reps";
  if (metric === "Langste tijd" || metric === "Totale tijd") return `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")}`;
  if (metric === "Verste afstand") return n + " km";
  if (metric === "Laagste assist") return n + " kg assist";
  return n + " kg";
}

/** Krachtgrafieken: oefeningen die minstens 2× in de periode voorkomen, meest recente eerst. */
export function strengthCharts(ws, exById, metricFor) {
  const per = new Map();
  for (const w of [...ws].sort((a, b) => a.start - b.start)) {
    for (const it of w.items || []) {
      const ex = exById[it.exercise];
      if (!ex) continue;
      if (!per.has(it.exercise)) per.set(it.exercise, []);
      const list = per.get(it.exercise);
      const last = list[list.length - 1];
      if (last && last.w === w) last.sets.push(...it.sets);
      else list.push({ w, sets: [...it.sets] });
    }
  }
  const out = [];
  for (const [id, sessions] of per) {
    if (sessions.length < 2) continue;
    const ex = exById[id];
    const type = ex.type || "kg";
    const chosen = metricFor(id);
    const metric = METRICS[type].includes(chosen) ? chosen : METRICS[type][0];
    const points = sessions.map((s) => ({ at: s.w.start, v: sessionValue(type, s.sets, metric) })).filter((p) => p.v !== null && p.v !== undefined);
    if (points.length < 2) continue;
    const lowerBetter = lowerIsBetter(metric);
    const first = points[0].v;
    const last = points[points.length - 1].v;
    const pct = first ? Math.round(((last - first) / first) * 100) : 0;
    let bi = 0;
    points.forEach((p, i) => { if (lowerBetter ? p.v <= points[bi].v : p.v >= points[bi].v) bi = i; });
    out.push({
      id, ex, type, metric, points,
      lastAt: points[points.length - 1].at,
      value: last,
      pct,
      good: lowerBetter ? pct < 0 : pct > 0,
      prIndex: bi === points.length - 1 ? null : bi,
    });
  }
  return out.sort((a, b) => b.lastAt - a.lastAt);
}

function weekStart(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** Volume per week (4w, 3m) of per maand (1j, Alles), inclusief lege weken/maanden. */
export function volumeBuckets(ws, exById, range, now = Date.now()) {
  const weekly = range === "4w" || range === "3m";
  if (!ws.length) return { weekly, labels: [], values: [] };
  const firstAt = range === "Alles" ? Math.min(...ws.map((w) => w.start)) : now - RANGES[range];
  const keys = [];
  if (weekly) {
    for (let t = weekStart(firstAt); t <= now; t += 7 * DAY) keys.push(weekStart(t + DAY));
  } else {
    const d = new Date(firstAt);
    let y = d.getFullYear(), m = d.getMonth();
    const end = new Date(now);
    while (y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth())) {
      keys.push(new Date(y, m, 1).getTime());
      m++;
      if (m > 11) { m = 0; y++; }
    }
  }
  const sums = new Map(keys.map((k) => [k, 0]));
  for (const w of ws) {
    const k = weekly ? weekStart(w.start) : new Date(new Date(w.start).getFullYear(), new Date(w.start).getMonth(), 1).getTime();
    if (sums.has(k)) sums.set(k, sums.get(k) + volume(w, exById));
  }
  const labels = keys.map((k) => (weekly ? dateNum(k) : `${MONTHS[new Date(k).getMonth()]} ${String(new Date(k).getFullYear()).slice(2)}`));
  return { weekly, labels, values: keys.map((k) => Math.round(sums.get(k))) };
}

export function countPrs(ws, all, exById) {
  return ws.reduce((n, w) => n + workoutPrs(w, all, exById).length, 0);
}

// ---------- maandoverzicht ----------

export function monthOf(ms) {
  const d = new Date(ms);
  return { y: d.getFullYear(), m: d.getMonth() };
}

export function shiftMonth({ y, m }, delta) {
  const d = new Date(y, m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

export function monthWorkouts(workouts, { y, m }) {
  const from = new Date(y, m, 1).getTime();
  const to = new Date(y, m + 1, 1).getTime();
  return doneWorkouts(workouts).filter((w) => w.start >= from && w.start < to);
}

export function groupSets(ws, exById) {
  const counts = Object.fromEntries(RADAR_GROUPS.map((g) => [g, 0]));
  for (const w of ws) for (const it of w.items || []) {
    const g = exById[it.exercise]?.group;
    if (g in counts) counts[g] += (it.sets || []).filter((s) => s.type !== "warmup").length;
  }
  return counts;
}

export function weekdayPattern(ws) {
  if (ws.length < 3) return null;
  const c = new Array(7).fill(0);
  ws.forEach((w) => c[new Date(w.start).getDay()]++);
  const top = c.map((n, d) => [n, d]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, d]) => d);
  top.sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return "Meestal " + top.map((d) => DAY_SHORT[d]).join(" / ");
}

export function monthRecap(workouts, exById, month) {
  const ws = monthWorkouts(workouts, month);
  const prev = monthWorkouts(workouts, shiftMonth(month, -1));
  const prs = ws.flatMap((w) => workoutPrs(w, workouts, exById).map((p) => ({ ...p, at: w.start })));
  const prevPrs = countPrs(prev, workouts, exById);
  // Per oefening alleen het beste record van de maand (het laatste).
  const bestPr = new Map();
  for (const p of prs) bestPr.set(p.exercise, p);
  const sessionsPerEx = new Map();
  for (const w of ws) for (const id of new Set((w.items || []).map((i) => i.exercise))) sessionsPerEx.set(id, (sessionsPerEx.get(id) || 0) + 1);
  const vol = ws.reduce((n, w) => n + volume(w, exById), 0);
  const prevVol = prev.reduce((n, w) => n + volume(w, exById), 0);
  return {
    ws, prev,
    sessions: ws.length, prevSessions: prev.length,
    prs: prs.length, prevPrs,
    volume: vol, prevVolume: prevVol,
    trained: [...new Set(ws.map((w) => new Date(w.start).getDate()))],
    pattern: weekdayPattern(ws),
    groups: groupSets(ws, exById),
    prevGroups: groupSets(prev, exById),
    records: [...bestPr.values()],
    top: [...sessionsPerEx.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
  };
}

