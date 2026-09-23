// Eten: per dag een blok per maaltijd, met notitie, receptlink en (optioneel) macro's.
// Record "food" met id "f-JJJJ-MM-DD-<maaltijd>":
//   { date, meal: "ontbijt", note, recipe, kcal, protein, fat, carbs }
import * as store from "./store.js";
import { toISO, fromISO } from "./measure.js";

export const MEALS = [
  { key: "ontbijt", label: "Ontbijt", accent: "var(--fill-peach)" },
  { key: "lunch", label: "Lunch", accent: "var(--accent-mint)" },
  { key: "snack", label: "Snack", accent: "var(--accent-lavender)" },
  { key: "diner", label: "Diner", accent: "var(--accent-blue-light)" },
  { key: "extra", label: "Extra", accent: "var(--accent-pink)" },
];
export const MACROS = [
  { key: "kcal", label: "Kcal", unit: "kcal" },
  { key: "protein", label: "Eiwit", unit: "g" },
  { key: "fat", label: "Vet", unit: "g" },
  { key: "carbs", label: "Koolhydraten", unit: "g" },
];
export const DEFAULT_GOALS = { kcal: 1800, protein: 130, fat: 60, carbs: 185 };
// Vaste context die met "Schat macro's" meegaat naar Claude (aan te passen in Instellingen).
export const DEFAULT_CONTEXT = "Ik eet vegetarisch.";

const DAY = 86400000;
const DAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

export const goals = () => ({ ...DEFAULT_GOALS, ...((store.get("settings") || {}).foodGoals || {}) });
export const shiftDay = (iso, n) => toISO(new Date(fromISO(iso).getTime() + n * DAY + 12 * 3600000));

export function dayLabel(iso, today = toISO(new Date())) {
  const d = fromISO(iso);
  const rel = iso === today ? "Vandaag" : iso === shiftDay(today, -1) ? "Gisteren" : iso === shiftDay(today, 1) ? "Morgen" : DAYS[d.getDay()][0].toUpperCase() + DAYS[d.getDay()].slice(1);
  return { rel, date: `${d.getDate()} ${MONTHS[d.getMonth()]}` };
}

export const entryId = (date, meal) => `f-${date}-${meal}`;
export const entry = (date, meal) => store.get(entryId(date, meal)) || { date, meal, note: "", recipe: "", kcal: null, protein: null, fat: null, carbs: null };

export function saveEntry(date, meal, data) {
  const clean = { date, meal, note: (data.note || "").trim(), recipe: (data.recipe || "").trim() };
  for (const m of MACROS) {
    const v = String(data[m.key] ?? "").trim().replace(",", ".");
    clean[m.key] = v === "" || Number.isNaN(Number(v)) ? null : Number(v);
  }
  const empty = !clean.note && !clean.recipe && MACROS.every((m) => clean[m.key] === null);
  if (empty) store.remove(entryId(date, meal));
  else store.put("food", entryId(date, meal), clean);
}

export function dayTotals(date) {
  const t = { kcal: 0, protein: 0, fat: 0, carbs: 0, logged: 0 };
  for (const m of MEALS) {
    const e = store.get(entryId(date, m.key));
    if (!e) continue;
    if (MACROS.some((x) => e[x.key] !== null && e[x.key] !== undefined)) t.logged++;
    for (const x of MACROS) t[x.key] += Number(e[x.key]) || 0;
  }
  return t;
}

// ---------- tekst voor je coach ----------

const n = (v) => String(Math.round(v * 10) / 10).replace(".", ",");

export function dayText(date) {
  const { rel, date: d } = dayLabel(date);
  const g = goals();
  const lines = [`Eten ${rel.toLowerCase() === "vandaag" || rel.toLowerCase() === "gisteren" ? rel.toLowerCase() + " " : ""}(${d}):`];
  let any = false;
  for (const m of MEALS) {
    const e = store.get(entryId(date, m.key));
    if (!e || (!e.note && e.kcal === null)) continue;
    any = true;
    const macros = MACROS.filter((x) => e[x.key] !== null && e[x.key] !== undefined).map((x) => `${n(e[x.key])} ${x.key === "kcal" ? "kcal" : "g " + x.label.toLowerCase()}`);
    lines.push(`- ${m.label}: ${e.note || "(geen notitie)"}${macros.length ? ` (${macros.join(", ")})` : ""}${e.recipe ? ` [recept: ${e.recipe}]` : ""}`);
  }
  if (!any) lines.push("- Niets ingevuld.");
  const t = dayTotals(date);
  if (t.logged) lines.push(`Totaal: ${n(t.kcal)} kcal, ${n(t.protein)} g eiwit, ${n(t.fat)} g vet, ${n(t.carbs)} g koolhydraten (doel ${g.kcal} kcal, ${g.protein} g eiwit, ${g.fat} g vet, ${g.carbs} g koolhydraten)`);
  return lines.join("\n");
}

export function weekText(endDate) {
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(endDate, i - 6));
  const blocks = days.map(dayText);
  const logged = days.map(dayTotals).filter((t) => t.logged);
  if (logged.length) {
    const avg = (k) => n(logged.reduce((a, t) => a + t[k], 0) / logged.length);
    blocks.push(`Gemiddeld over ${logged.length} ${logged.length === 1 ? "dag" : "dagen"} met macro's: ${avg("kcal")} kcal, ${avg("protein")} g eiwit, ${avg("fat")} g vet, ${avg("carbs")} g koolhydraten.`);
  }
  return blocks.join("\n\n");
}

/** Korte eetsamenvatting voor onder de trainingssamenvatting (laatste weken). */
export function foodSummary(weeks = 4) {
  const today = toISO(new Date());
  const days = Array.from({ length: weeks * 7 }, (_, i) => shiftDay(today, -i));
  const logged = days.map(dayTotals).filter((t) => t.logged);
  if (!logged.length) return "";
  const g = goals();
  const avg = (k) => logged.reduce((a, t) => a + t[k], 0) / logged.length;
  const hit = logged.filter((t) => t.protein >= g.protein).length;
  return `\n\nEten (${logged.length} dagen met macro's):\n- Gemiddeld ${n(avg("kcal"))} kcal, ${n(avg("protein"))} g eiwit, ${n(avg("fat"))} g vet, ${n(avg("carbs"))} g koolhydraten\n- Eiwitdoel (${g.protein} g) gehaald op ${hit} van ${logged.length} dagen`;
}
