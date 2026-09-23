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

// ---------- eettips en weekoverzicht (Claude) ----------
// Claude "leert" niet echt: bij elke vraag gaat je eigen profiel mee (geschiedenis, lijst, duimpjes).

const clean = (s) => String(s || "").trim().replace(/\s+/g, " ");

/** Wat je de laatste weken at, met hoe vaak: "Ontbijt: havermout met skyr (5x)". */
export function historyLines(days = 28, today = toISO(new Date())) {
  const count = new Map();
  for (let i = 0; i < days; i++) {
    const date = shiftDay(today, -i);
    for (const m of MEALS) {
      const e = store.get(entryId(date, m.key));
      const note = clean(e && e.note);
      if (!note) continue;
      const key = `${m.label}: ${note.slice(0, 200)}`;
      count.set(key, (count.get(key) || 0) + 1);
    }
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([k, c]) => (c > 1 ? `${k} (${c}x)` : k));
}

export function todayLines(date) {
  return MEALS.map((m) => {
    const e = store.get(entryId(date, m.key));
    return e && clean(e.note) ? `${m.label}: ${clean(e.note)}` : null;
  }).filter(Boolean);
}

export function profile() {
  const s = store.get("settings") || {};
  return {
    history: historyLines(),
    pantry: s.foodPantry || "",
    likes: s.foodLikes || [],
    dislikes: s.foodDislikes || [],
    context: s.foodContext ?? DEFAULT_CONTEXT,
  };
}

/** Duimpje op een tip: onthouden als "lekker" of "liever niet" (max. 30 per lijst). */
export function rateTip(name, like) {
  const s = store.get("settings") || {};
  const n = clean(name);
  const drop = (l) => (l || []).filter((x) => x.toLowerCase() !== n.toLowerCase());
  const likes = drop(s.foodLikes), dislikes = drop(s.foodDislikes);
  (like ? likes : dislikes).unshift(n);
  store.put("settings", "settings", { ...s, foodLikes: likes.slice(0, 30), foodDislikes: dislikes.slice(0, 30) });
}

export function tipRating(name) {
  const s = store.get("settings") || {};
  const n = clean(name).toLowerCase();
  if ((s.foodLikes || []).some((x) => x.toLowerCase() === n)) return "like";
  if ((s.foodDislikes || []).some((x) => x.toLowerCase() === n)) return "dislike";
  return null;
}

/** Een tip toevoegen aan een maaltijd: notitie erbij, macro's opgeteld. */
export function addToMeal(date, meal, tip) {
  const e = entry(date, meal);
  const text = `${tip.name} (${tip.portion})`;
  const data = { ...e, note: e.note ? `${e.note}, ${text}` : text };
  for (const m of MACROS) data[m.key] = (Number(e[m.key]) || 0) + (Number(tip[m.key]) || 0);
  saveEntry(date, meal, data);
}

/** De zondag die bij deze datum hoort (zelf, of de laatste ervoor). */
export const lastSunday = (iso) => shiftDay(iso, -fromISO(iso).getDay());
export const weekId = (sunday) => `fw-${sunday}`;

/** Cijfers van de week (ma t/m zo), in de app zelf berekend. */
export function weekStats(sunday) {
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(sunday, i - 6));
  const logged = days.map(dayTotals).filter((t) => t.logged);
  const g = goals();
  const avg = (k) => (logged.length ? logged.reduce((a, t) => a + t[k], 0) / logged.length : 0);
  return {
    from: days[0], to: sunday, days: logged.length,
    kcal: avg("kcal"), protein: avg("protein"), fat: avg("fat"), carbs: avg("carbs"),
    proteinHit: logged.filter((t) => t.protein >= g.protein).length,
    noted: days.filter((d) => todayLines(d).length).length,
  };
}

export function weekInput(sunday) {
  const st = weekStats(sunday);
  return weekText(sunday) + (st.days ? `\nEiwitdoel gehaald op ${st.proteinHit} van ${st.days} dagen met macro's.` : "");
}

export function weekPlanText(sunday, review) {
  const { date: from } = dayLabel(shiftDay(sunday, -6));
  const { date: to } = dayLabel(sunday);
  return [`Weekoverzicht eten (${from} t/m ${to})`, "", review.summary, "",
    "Tips voor volgende week:", ...review.tips.map((t) => `- ${t.title}: ${t.detail}`), "",
    "Ideeën voor het maaltijdplan:", ...review.meal_ideas.map((m) => `- ${m}`)].join("\n");
}
