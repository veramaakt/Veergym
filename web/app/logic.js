// Rekenwerk zonder schermen: opmaak, vorige sessie, volume en records (PR's).
// Losse functies, zodat ze makkelijk te testen zijn.

export const TYPES = {
  kg: { label: "Gewicht × reps", fields: [{ k: "w", label: "Kg", step: 2.5 }, { k: "r", label: "Reps", step: 1 }] },
  assist: { label: "Assisted", fields: [{ k: "w", label: "Assist", step: 2.5 }, { k: "r", label: "Reps", step: 1 }] },
  reps: { label: "Alleen reps", fields: [{ k: "r", label: "Reps", step: 1 }] },
  duur: { label: "Duur", fields: [{ k: "dur", label: "Tijd", step: 5, time: true }] },
  afstand: { label: "Afstand + tijd", fields: [{ k: "dist", label: "Km", step: 0.5 }, { k: "dur", label: "Tijd", step: 30, time: true }] },
};

export const SET_TYPES = [
  { id: "normal", label: "Normaal" },
  { id: "warmup", label: "Warming-up" },
  { id: "dropset", label: "Dropset" },
  { id: "failure", label: "Tot falen" },
];

export const GROUPS = ["Benen", "Billen", "Borst", "Rug", "Schouders", "Armen", "Core", "Cardio"];
export const WEEKDAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const DAY_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const DAY_LONG = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MONTHS_LONG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

// ---------- opmaak ----------

const nf = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 });
export const num = (n) => (n === null || n === undefined || n === "" || Number.isNaN(Number(n)) ? "" : nf.format(Number(n)));
export const kg = (n) => num(Math.round(n)) + " kg";

export function time(sec) {
  if (sec === null || sec === undefined || sec === "") return "";
  sec = Math.max(0, Math.round(Number(sec)));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function minutes(ms) {
  return Math.max(1, Math.round(ms / 60000)) + " min";
}

export function dateShort(ms) {
  const d = new Date(ms);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function dateLong(ms) {
  const d = new Date(ms);
  return `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}
export function dateNum(ms) {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
/** "Ma".."Zo" voor een datum (maandag eerst, zoals in de schema-editor). */
export const weekdayLabel = (ms) => WEEKDAYS[(new Date(ms).getDay() + 6) % 7];

export function hasValue(v) {
  return v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));
}

export function fmtSet(type, s) {
  if (!s) return "";
  switch (type) {
    case "reps":
      return hasValue(s.r) ? `${num(s.r)} reps` : "";
    case "duur":
      return hasValue(s.dur) ? time(s.dur) : "";
    case "afstand":
      return [hasValue(s.dist) ? `${num(s.dist)} km` : "", hasValue(s.dur) ? time(s.dur) : ""].filter(Boolean).join(" · ");
    default:
      if (!hasValue(s.w)) return hasValue(s.r) ? `${num(s.r)} reps` : "";
      return hasValue(s.r) ? `${num(s.w)} × ${num(s.r)}` : `${num(s.w)} kg`;
  }
}

export function exMeta(ex) {
  if (!ex) return "";
  return [ex.equip, ex.group].filter(Boolean).join(" · ");
}

// ---------- geschiedenis ----------

/** Afgeronde workouts, nieuwste eerst. */
export function doneWorkouts(workouts) {
  return workouts.filter((w) => w.end).sort((a, b) => b.start - a.start);
}

/** Per workout de sets van één oefening, nieuwste eerst: [{workout, sets}] */
export function exerciseHistory(workouts, exerciseId, before = Infinity) {
  const out = [];
  for (const w of doneWorkouts(workouts)) {
    if (w.start >= before) continue;
    const sets = [];
    for (const it of w.items || []) if (it.exercise === exerciseId) sets.push(...(it.sets || []));
    if (sets.length) out.push({ workout: w, sets });
  }
  return out;
}

export function previousSets(workouts, exerciseId, before = Infinity) {
  const h = exerciseHistory(workouts, exerciseId, before);
  return h.length ? h[0].sets : [];
}

export function e1rm(w, r) {
  if (!hasValue(w) || !hasValue(r) || r < 1) return 0;
  return r === 1 ? Number(w) : Number(w) * (1 + Number(r) / 30);
}

export function volume(workout, exById) {
  let v = 0;
  for (const it of workout.items || []) {
    const type = exById[it.exercise]?.type || "kg";
    if (type !== "kg") continue;
    for (const s of it.sets || []) if (s.type !== "warmup" && hasValue(s.w) && hasValue(s.r)) v += Number(s.w) * Number(s.r);
  }
  return v;
}

export function setCount(workout) {
  return (workout.items || []).reduce((n, it) => n + (it.sets || []).length, 0);
}

// ---------- records ----------

const counts = (s) => s && s.type !== "warmup";

/** Beste prestaties uit een lijst sets. */
export function bests(type, sets) {
  const b = { maxW: null, minW: null, e1rm: 0, maxR: 0, maxDur: 0, maxDist: 0, repsAt: {} };
  for (const s of sets.filter(counts)) {
    const w = hasValue(s.w) ? Number(s.w) : null;
    const r = hasValue(s.r) ? Number(s.r) : 0;
    if (w !== null && r >= 1) {
      b.maxW = b.maxW === null ? w : Math.max(b.maxW, w);
      b.minW = b.minW === null ? w : Math.min(b.minW, w);
      b.repsAt[w] = Math.max(b.repsAt[w] || 0, r);
    }
    b.e1rm = Math.max(b.e1rm, e1rm(w, r));
    b.maxR = Math.max(b.maxR, r);
    if (hasValue(s.dur)) b.maxDur = Math.max(b.maxDur, Number(s.dur));
    if (hasValue(s.dist)) b.maxDist = Math.max(b.maxDist, Number(s.dist));
  }
  return b;
}

/**
 * Welke records verbreekt deze set? Vergelijkt met eerdere sets (geschiedenis +
 * eerder in deze sessie). Geeft een lijst labels terug, leeg als er niets is.
 * Assisted: lager assist-gewicht is beter.
 */
export function prsFor(type, set, earlierSets) {
  if (!counts(set) || !earlierSets.some(counts)) return [];
  const b = bests(type, earlierSets);
  const w = hasValue(set.w) ? Number(set.w) : null;
  const r = hasValue(set.r) ? Number(set.r) : 0;
  const out = [];
  if (type === "kg" && w !== null && r >= 1) {
    if (b.maxW === null || w > b.maxW) out.push("zwaarste gewicht");
    else if (b.repsAt[w] !== undefined && r > b.repsAt[w]) out.push(`meeste reps op ${num(w)} kg`);
    if (b.e1rm && e1rm(w, r) > b.e1rm + 0.01 && !out.includes("zwaarste gewicht")) out.push("geschat 1RM");
  } else if (type === "assist" && w !== null && r >= 1) {
    if (b.minW === null || w < b.minW) out.push("minste assist");
    else if (b.repsAt[w] !== undefined && r > b.repsAt[w]) out.push(`meeste reps op ${num(w)} kg assist`);
  } else if (type === "reps" && r > b.maxR) out.push("meeste reps");
  else if (type === "duur" && hasValue(set.dur) && Number(set.dur) > b.maxDur) out.push("langste tijd");
  else if (type === "afstand" && hasValue(set.dist) && Number(set.dist) > b.maxDist) out.push("verste afstand");
  return out;
}

/** Records per oefening in een afgeronde workout, t.o.v. alles daarvóór. */
export function workoutPrs(workout, workouts, exById) {
  const out = [];
  for (const it of workout.items || []) {
    const type = exById[it.exercise]?.type || "kg";
    const earlier = exerciseHistory(workouts, it.exercise, workout.start).flatMap((h) => h.sets);
    if (!earlier.length) continue; // eerste keer deze oefening: nog geen records
    let best = null;
    const labels = new Set();
    for (const s of it.sets || []) {
      const p = prsFor(type, s, earlier);
      if (p.length) {
        p.forEach((l) => labels.add(l));
        best = s;
      }
      earlier.push(s);
    }
    if (best) out.push({ exercise: it.exercise, set: best, labels: [...labels] });
  }
  return out;
}

// ---------- tekst voor je coach ----------

export function coachSummary(workouts, exById, weeks = 4, now = Date.now()) {
  const from = now - weeks * 7 * 86400000;
  const ws = doneWorkouts(workouts).filter((w) => w.start >= from);
  const name = (id) => exById[id]?.name || "Onbekende oefening";
  const lines = [`Training, laatste ${weeks} weken (${dateNum(from)} – ${dateNum(now)})`];
  if (!ws.length) return lines.concat("Geen trainingen gelogd in deze periode.").join("\n");
  const vol = ws.reduce((n, w) => n + volume(w, exById), 0);
  const rpes = ws.map((w) => w.rpe).filter(hasValue);
  lines.push(`Sessies: ${ws.length}`, `Totaal volume: ${kg(vol)}`);
  if (rpes.length) lines.push(`Gemiddelde sessie-RPE: ${num(rpes.reduce((a, b) => a + b, 0) / rpes.length)}`);
  const prs = ws.flatMap((w) => workoutPrs(w, workouts, exById).map((p) => ({ ...p, when: w.start })));
  if (prs.length) {
    lines.push("", "Records:");
    for (const p of prs) lines.push(`- ${name(p.exercise)}: ${fmtSet(exById[p.exercise]?.type, p.set)} (${p.labels.join(", ")}, ${dateNum(p.when)})`);
  }
  lines.push("", "Sessies:");
  for (const w of [...ws].reverse()) {
    const extra = [w.end ? minutes(w.end - w.start) : "", hasValue(w.rpe) ? `RPE ${w.rpe}` : ""].filter(Boolean).join(" · ");
    lines.push(`${dateShort(w.start)} · ${w.title}${extra ? " · " + extra : ""}`);
    for (const it of w.items || []) {
      const type = exById[it.exercise]?.type;
      lines.push(`  ${name(it.exercise)}: ${(it.sets || []).map((s) => (s.type === "warmup" ? "(w) " : "") + fmtSet(type, s)).join(", ")}`);
    }
    if (w.note) lines.push(`  Notitie: ${w.note}`);
  }
  return lines.join("\n");
}
