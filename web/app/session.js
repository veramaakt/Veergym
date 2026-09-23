// De workout die nu bezig is. Staat lokaal (niet op de server) tot je op
// "Voltooien" tikt; zo blijft hij bewaard als je van scherm wisselt of de app sluit.
import * as store from "./store.js";
import { hasValue, previousSets } from "./logic.js";

export const getActive = () => store.getMeta("active");
export const saveActive = (a) => store.setMeta("active", a);

export function settings() {
  return store.get("settings") || {};
}
export function restDefault() {
  return settings().restDefault ?? 90;
}

function blankSet(s = {}) {
  return { w: s.w ?? "", r: s.r ?? "", dur: s.dur ?? "", dist: s.dist ?? "", type: s.type || "normal", rpe: null, done: false };
}

export function newItem(exerciseId, workouts, rest = null) {
  const prev = previousSets(workouts, exerciseId);
  const n = Math.max(prev.filter((s) => s.type !== "warmup").length, 3);
  return { exercise: exerciseId, rest, sets: Array.from({ length: n }, () => blankSet()) };
}

export function startWorkout(template, workouts) {
  const items = template
    ? (template.items || []).map((it) =>
        it.sets && it.sets.length
          ? { exercise: it.exercise, rest: it.rest ?? null, sets: it.sets.map(blankSet) }
          : newItem(it.exercise, workouts, it.rest ?? null)
      )
    : [];
  const a = { id: store.uid(), template: template ? template.id : null, title: template ? template.name : "Vrije training", start: Date.now(), exIdx: 0, restEnd: 0, restTotal: 0, items };
  saveActive(a);
  return a;
}

/** Bij afvinken van een lege set: vul de waarden van de vorige keer in. */
export function fillFromPrevious(set, prev) {
  if (!prev) return set;
  const out = { ...set };
  for (const k of ["w", "r", "dur", "dist"]) if (!hasValue(out[k]) && hasValue(prev[k])) out[k] = prev[k];
  return out;
}

export function finishWorkout(a) {
  const items = a.items
    .map((it) => ({
      exercise: it.exercise,
      sets: it.sets
        .filter((s) => s.done)
        .map(({ done, ...s }) => {
          const clean = { type: s.type || "normal" };
          for (const k of ["w", "r", "dur", "dist", "rpe"]) if (hasValue(s[k])) clean[k] = Number(s[k]);
          return clean;
        }),
    }))
    .filter((it) => it.sets.length);
  if (!items.length) return null;
  store.put("workout", a.id, { title: a.title, template: a.template, start: a.start, end: Date.now(), rpe: null, note: "", items });
  saveActive(null);
  return a.id;
}
