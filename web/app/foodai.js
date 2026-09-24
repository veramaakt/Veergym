// Claude-aanroepen voor eten (tips en weekoverzicht). In de demo komen vaste voorbeeldantwoorden.
import * as store from "./store.js";
import { DEMO } from "./ui.js";
import { profile, weekId, weekInput, weekStats } from "./food.js";

const DEMO_TIPS = {
  note: "Voorbeeld uit de demo: je echte app baseert dit op wat jij eet.",
  suggestions: [
    { name: "Skyr met pindakaas", portion: "200 g skyr + 15 g pindakaas", kcal: 220, protein: 26, fat: 8, carbs: 10, why: "Je eet skyr vaak bij je ontbijt." },
    { name: "Eiwitshake", portion: "1 schep in 300 ml melk", kcal: 230, protein: 34, fat: 5, carbs: 14, why: "Die had je eerder vandaag al als snack." },
    { name: "Hüttenkäse op knäckebröd", portion: "2 knäckebröd + 100 g hüttenkäse", kcal: 170, protein: 14, fat: 4, carbs: 18, why: "Staat in je lijst Graag & in huis." },
  ],
};
const DEMO_WEEK = {
  summary: "Je ontbijt was elke dag vergelijkbaar en eiwitrijk. Op de dagen zonder avondsnack bleef er vaker eiwit over.",
  tips: [
    { title: "Snack klaarzetten", detail: "Zet voor drie avonden een bakje skyr of hüttenkäse klaar, dan hoef je er niet over na te denken." },
    { title: "Vooruit koken", detail: "Een grote pan linzencurry op zondag geeft twee lunches met flink wat eiwit." },
  ],
  meal_ideas: ["Ontbijt: havermout met skyr en blauwe bessen", "Lunch: linzencurry met rijst (restje van zondag)", "Snack: eiwitshake na het trainen", "Diner: tofu-roerbak met noedels en broccoli", "Diner: omelet met spinazie en volkorenbrood"],
};

export async function ask(path, body) {
  if (DEMO) { await new Promise((r) => setTimeout(r, 600)); return path.endsWith("week") ? DEMO_WEEK : DEMO_TIPS; }
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + store.getMeta("token") },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!r) throw new Error(navigator.onLine ? "Geen verbinding met je server." : "Dit kan alleen online.");
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(out.detail || "Dat lukte niet (" + r.status + ")");
  return out;
}

const pending = new Map();

/** Maakt het Claude-deel van het weekoverzicht en bewaart het (record "foodweek"). force = opnieuw maken. */
export function makeWeekReview(sunday) {
  if (pending.has(sunday)) return pending.get(sunday);
  const p = ask("api/food/week", { ...profile(), week: weekInput(sunday) })
    .then((r) => store.put("foodweek", weekId(sunday), { week: sunday, created: new Date().toISOString(), summary: r.summary, tips: r.tips, meal_ideas: r.meal_ideas }))
    .finally(() => pending.delete(sunday));
  pending.set(sunday, p);
  return p;
}

/** Alleen maken als het er nog niet is en er iets ingevuld is. */
export async function ensureWeekReview(sunday) {
  if (store.get(weekId(sunday)) || !weekStats(sunday).noted) return;
  await makeWeekReview(sunday);
}
