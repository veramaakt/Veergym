import { html, DS, DEMO, useState, useEffect, Icon } from "../ui.js";
import { ask, ensureWeekReview } from "../foodai.js";
import * as store from "../store.js";
import { num } from "../logic.js";
import { todayISO } from "../measure.js";
import { MEALS, MACROS, goals, shiftDay, dayLabel, entry, saveEntry, dayTotals, dayText, weekText, DEFAULT_CONTEXT,
  profile, todayLines, rateTip, tipRating, addToMeal, lastSunday, weekId, weekStats } from "../food.js";
import { fromISO } from "../measure.js";
import { copyText } from "../clipboard.js";

const cap = { fontSize: "var(--caption-size)", lineHeight: "var(--caption-line)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" };
const inputStyle = { width: "100%", height: 44, border: "none", borderRadius: "var(--radius-sm)", background: "var(--surface-tint)", fontFamily: "inherit", fontSize: "var(--body-md-size)", fontWeight: 800, textAlign: "center", outline: "none", color: "var(--ink)" };
const fmt = (v) => (v === null || v === undefined ? null : num(v));
const show = (v) => (v === null || v === undefined ? "" : num(v));

function MealSheet({ ctx, date, meal }) {
  const m = MEALS.find((x) => x.key === meal);
  const e = entry(date, meal);
  const [d, setD] = useState({ note: e.note || "", recipe: e.recipe || "", ...Object.fromEntries(MACROS.map((x) => [x.key, show(e[x.key])])) });
  const save = () => { saveEntry(date, meal, d); ctx.closeSheet(); };
  const [est, setEst] = useState({ busy: false, err: "", note: "" });
  const estimate = async () => {
    if (!d.note.trim() || est.busy) return;
    if (DEMO) return setEst({ busy: false, err: "In de demo kan Claude niet schatten; in je echte app wel.", note: "" });
    setEst({ busy: true, err: "", note: "" });
    try {
      const r = await fetch("api/food/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + store.getMeta("token") },
        body: JSON.stringify({ note: d.note, context: (store.get("settings") || {}).foodContext ?? DEFAULT_CONTEXT }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.detail || "Schatten lukte niet (" + r.status + ")");
      setD((x) => ({ ...x, kcal: num(body.kcal), protein: num(body.protein), fat: num(body.fat), carbs: num(body.carbs) }));
      setEst({ busy: false, err: "", note: body.assumptions || "" });
    } catch (x) {
      setEst({ busy: false, err: navigator.onLine ? x.message : "Schatten kan alleen online. Je notitie wordt wel bewaard.", note: "" });
    }
  };
  return html`<div>
    <div class="title">${m.label}</div>
    <textarea class="field" style=${{ marginTop: 12 }} value=${d.note} onInput=${(ev) => setD({ ...d, note: ev.target.value })} placeholder="Wat at je? In gewone taal." autoFocus></textarea>
    <input class="field" style=${{ marginTop: 8, height: 44 }} value=${d.recipe} onInput=${(ev) => setD({ ...d, recipe: ev.target.value })} placeholder="Receptlink (optioneel)" />
    <div style=${{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginTop: 12 }}>
      ${MACROS.map((x) => html`<div key=${x.key}>
        <div class="caption" style=${{ marginBottom: 4 }}>${x.key === "carbs" ? "Koolh." : x.label}</div>
        <input inputMode="decimal" placeholder="–" value=${d[x.key]} onInput=${(ev) => setD({ ...d, [x.key]: ev.target.value })} style=${inputStyle} />
      </div>`)}
    </div>
    <div class="row" style=${{ gap: 10, marginTop: 12 }}>
      <div class="flex1 sub">${est.busy ? "Claude schat je maaltijd…" : d.note.trim() ? "Laat Claude de macro's schatten; jij controleert en past aan." : "Schrijf eerst wat je at, dan kan Claude schatten."}</div>
      <${DS.Chip} onClick=${estimate} disabled=${est.busy || !d.note.trim()} style=${{ opacity: est.busy || !d.note.trim() ? 0.4 : 1 }}>${est.busy ? "Bezig…" : "Schat macro's"}<//>
    </div>
    ${est.err && html`<div class="error">${est.err}</div>`}
    ${est.note && html`<div class="sub" style=${{ marginTop: 8, fontStyle: "italic" }}>Schatting van Claude: ${est.note}</div>`}
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><${DS.Button} onClick=${save}>Opslaan<//></div>
  </div>`;
}

function CoachSheet({ date }) {
  const [kind, setKind] = useState("dag");
  const [copied, setCopied] = useState(false);
  const text = kind === "dag" ? dayText(date) : weekText(date);
  return html`<div>
    <div class="title">Kopieer voor coach</div>
    <div class="sub">Plak dit in je Claude-chat. Zet de geschatte macro's daarna terug in de maaltijden.</div>
    <div class="chips" style=${{ marginTop: 10 }}>
      <${DS.Chip} selected=${kind === "dag"} onClick=${() => { setKind("dag"); setCopied(false); }}>Deze dag<//>
      <${DS.Chip} selected=${kind === "week"} onClick=${() => { setKind("week"); setCopied(false); }}>Laatste 7 dagen<//>
    </div>
    <div class="coachbox">${text}</div>
    <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
      <${DS.Button} onClick=${async () => setCopied(await copyText(text))}>${copied ? "Gekopieerd" : "Kopiëren"}<//>
    </div>
  </div>`;
}

/** Dunne, neutrale balk: hoeveel van het doel al gegeten is. Zelfde kleur boven of onder het doel (geen oordeel). */
function Bar({ eaten, goal, height = 6 }) {
  const pct = goal > 0 ? Math.min(100, Math.max(0, (eaten / goal) * 100)) : 0;
  return html`<div role="img" aria-label=${`${Math.round(pct)}% van je doel`}
    style=${{ height, borderRadius: "var(--radius-pill)", background: "color-mix(in srgb, currentColor 16%, transparent)", overflow: "hidden", marginTop: 6 }}>
    <div style=${{ width: pct + "%", height: "100%", borderRadius: "var(--radius-pill)", background: "currentColor", transition: "width .2s ease" }}></div>
  </div>`;
}

// Elke macro een eigen pastelblokje. Kleur is alleen herkenning, nooit een oordeel (boven doel = zelfde kleur).
const MACRO_TILES = [
  { key: "protein", label: "Eiwit", fill: "var(--stat-pr-fill)", ink: "var(--stat-pr-ink)" },
  { key: "fat", label: "Vet", fill: "var(--stat-sessions-fill)", ink: "var(--stat-sessions-ink)" },
  { key: "carbs", label: "Koolhydraten", fill: "var(--stat-volume-fill)", ink: "var(--stat-volume-ink)" },
];

function MacroTile({ label, fill, ink, goal, eaten }) {
  const left = goal - eaten;
  return html`<div style=${{ background: fill, color: ink, borderRadius: "var(--radius-md)", padding: "12px 12px 14px", minWidth: 0 }}>
    <div style=${{ ...cap, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>${label}</div>
    <div style=${{ fontSize: "var(--title-size)", lineHeight: "var(--title-line)", fontWeight: 800, marginTop: 4 }}>${num(Math.abs(Math.round(left)))} g</div>
    <div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 700 }}>${left < 0 ? "boven doel" : "over"}</div>
    <${Bar} eaten=${eaten} goal=${goal} height=${4} />
    <div style=${{ fontSize: "var(--delta-size)", lineHeight: "var(--delta-line)", fontWeight: 600, marginTop: 6, opacity: 0.75 }}>${num(Math.round(eaten))} van ${num(goal)} g</div>
  </div>`;
}

// ---------- eettips en weekoverzicht ----------

const macroLine = (x) => `${num(x.kcal)} kcal · ${num(x.protein)} g eiwit · ${num(x.fat)} g vet · ${num(x.carbs)} g koolh.`;

function TipCard({ tip, onAdd, added }) {
  const [rating, setRating] = useState(() => tipRating(tip.name));
  const rate = (like) => { rateTip(tip.name, like); setRating(like ? "like" : "dislike"); };
  return html`<div style=${{ background: "var(--surface-tint)", borderRadius: "var(--radius-md)", padding: 12, marginTop: 8 }}>
    <div class="body">${tip.name}</div>
    <div class="sub">${tip.portion}</div>
    <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 700, marginTop: 4 }}>${macroLine(tip)}</div>
    <div class="sub" style=${{ marginTop: 4, fontStyle: "italic" }}>${tip.why}</div>
    <div class="chips" style=${{ marginTop: 10 }}>
      <${DS.Chip} selected=${added} onClick=${() => !added && onAdd(tip)}>${added ? "Toegevoegd" : "Toevoegen"}<//>
      <${DS.Chip} selected=${rating === "like"} onClick=${() => rate(true)}>Lekker<//>
      <${DS.Chip} selected=${rating === "dislike"} onClick=${() => rate(false)}>Liever niet<//>
    </div>
  </div>`;
}

function SuggestSheet({ date, left }) {
  const [state, setState] = useState({ busy: true, err: "", data: null });
  const [meal, setMeal] = useState(() => (["snack", "diner", "extra"].find((k) => !entry(date, k).note) || "extra"));
  const [added, setAdded] = useState([]);
  const load = () => {
    setState({ busy: true, err: "", data: null });
    ask("api/food/suggest", { ...profile(), left, today: todayLines(date) })
      .then((data) => setState({ busy: false, err: "", data }))
      .catch((e) => setState({ busy: false, err: e.message, data: null }));
  };
  useEffect(load, []);
  return html`<div>
    <div class="title">Wat kan ik nog eten?</div>
    <div class="sub">Op basis van wat je nog over hebt en wat je vaak eet. Met Lekker en Liever niet leert Claude je smaak.</div>
    ${state.busy && html`<div class="sub" style=${{ marginTop: 14 }}>Claude zoekt iets dat bij je past…</div>`}
    ${state.err && html`<div class="error">${state.err}</div>`}
    ${state.data && html`<div>
      ${state.data.note && html`<div class="sub" style=${{ marginTop: 10 }}>${state.data.note}</div>`}
      <div class="caption" style=${{ margin: "12px 0 6px" }}>Toevoegen aan</div>
      <div class="chips">${MEALS.map((m) => html`<${DS.Chip} key=${m.key} selected=${meal === m.key} onClick=${() => setMeal(m.key)}>${m.label}<//>`)}</div>
      ${state.data.suggestions.map((t, i) => html`<${TipCard} key=${i} tip=${t} added=${added.includes(i)}
        onAdd=${(tip) => { addToMeal(date, meal, tip); setAdded([...added, i]); }} />`)}
      <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><${DS.Chip} onClick=${load}>Andere ideeën<//></div>
    </div>`}
  </div>`;
}

/** Zondag: het weekoverzicht wordt vanzelf klaargezet (één Claude-aanroep per week). */
function SundayCard({ ctx, sunday }) {
  useEffect(() => { ensureWeekReview(sunday).catch(() => {}); }, [sunday]);
  const st = weekStats(sunday);
  return html`<button type="button" class="plainbtn" onClick=${() => ctx.go("foodweek", { sunday })}
    style=${{ width: "100%", marginTop: 16, background: "var(--food-hero-fill)", color: "var(--food-hero-ink)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
    <div class="row" style=${{ gap: 12 }}>
      <div class="flex1">
        <div style=${cap}>Zondag · weekoverzicht</div>
        <div style=${{ fontSize: "var(--title-size)", lineHeight: "var(--title-line)", fontWeight: 800, marginTop: 4 }}>Je week in beeld</div>
        <div style=${{ fontSize: "var(--body-sm-size)", fontWeight: 700, marginTop: 2 }}>${st.days ? `Gemiddeld ${num(Math.round(st.kcal))} kcal · tips voor je maaltijdplan` : "Met tips voor je maaltijdplan"}</div>
      </div>
      <span style=${{ display: "grid", transform: "rotate(-90deg)" }}>${Icon("chevron-down", 20)}</span>
    </div>
  </button>`;
}

export function Food({ ctx }) {
  const today = todayISO();
  const [date, setDate] = useState(() => store.getMeta("foodDate") && store.getMeta("foodDateSetOn") === today ? store.getMeta("foodDate") : today);
  const go = (n) => { const d = shiftDay(date, n); setDate(d); store.setMeta("foodDate", d); store.setMeta("foodDateSetOn", today); };
  const g = goals();
  const t = dayTotals(date);
  const left = { kcal: g.kcal - t.kcal, protein: g.protein - t.protein, fat: g.fat - t.fat, carbs: g.carbs - t.carbs };
  const { rel, date: dl } = dayLabel(date, today);

  return html`<div class="page">
    <div class="title">Eten</div>
    <div class="row" style=${{ gap: 4, marginTop: 16 }}>
      <button type="button" class="iconbtn" aria-label="Vorige dag" onClick=${() => go(-1)}><span style=${{ display: "grid", transform: "rotate(90deg)" }}>${Icon("chevron-down", 20)}</span></button>
      <button type="button" class="plainbtn flex1" style=${{ textAlign: "center", minHeight: 44 }} onClick=${() => { setDate(today); store.setMeta("foodDate", null); }}>
        <span style=${{ fontSize: "var(--body-sm-size)", fontWeight: 800 }}>${rel}</span><span class="sub"> · ${dl}</span>
      </button>
      <button type="button" class="iconbtn" aria-label="Volgende dag" onClick=${() => go(1)}><span style=${{ display: "grid", transform: "rotate(-90deg)" }}>${Icon("chevron-down", 20)}</span></button>
    </div>

    <div style=${{ marginTop: 8, background: "var(--food-hero-fill)", borderRadius: "var(--radius-lg)", padding: "18px 16px", color: "var(--food-hero-ink)" }}>
      <div style=${cap}>${left.kcal < 0 ? "Boven je dagdoel" : "Nog over vandaag"}</div>
      <div style=${{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        <span style=${{ fontSize: "var(--display-lg-size)", lineHeight: "var(--display-lg-line)", fontWeight: 800 }}>${num(Math.abs(Math.round(left.kcal)))}<span style=${{ fontSize: "var(--title-size)", fontWeight: 800 }}> kcal</span></span>
        <span style=${{ fontSize: "var(--body-sm-size)", fontWeight: 700 }}>${num(Math.round(t.kcal))} van ${num(g.kcal)} kcal gegeten</span>
      </div>
      <${Bar} eaten=${t.kcal} goal=${g.kcal} height=${8} />
    </div>
    <div style=${{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 8 }}>
      ${MACRO_TILES.map((m) => html`<${MacroTile} key=${m.key} label=${m.label} fill=${m.fill} ink=${m.ink} goal=${g[m.key]} eaten=${t[m.key]} />`)}
    </div>
    <div class="sub" style=${{ marginTop: 8 }}>Telt vanzelf mee zodra je bij een maaltijd macro's invult. Tik op een maaltijd om te beginnen.</div>
    ${date === today && (left.protein > 5 || left.kcal > 100) && html`<div class="row" style=${{ gap: 10, marginTop: 14 }}>
      <div class="flex1 sub">${left.protein > 5 ? `Nog ${num(Math.round(left.protein))} g eiwit over.` : `Nog ${num(Math.round(left.kcal))} kcal over.`} Vraag Claude wat past bij wat jij graag eet.</div>
      <${DS.Chip} onClick=${() => ctx.sheet(html`<${SuggestSheet} date=${date} left=${left} />`)}>Wat kan ik nog eten?<//>
    </div>`}
    ${date === today && fromISO(today).getDay() === 0 && html`<${SundayCard} ctx=${ctx} sunday=${today} />`}

    <div style=${{ marginTop: 24 }}>
      ${MEALS.map((m) => {
        const e = entry(date, m.key);
        const open = () => ctx.sheet(html`<${MealSheet} ctx=${ctx} date=${date} meal=${m.key} />`);
        // Het hele blok is aantikbaar (niet alleen het +-knopje); een tik op de receptlink opent de link.
        return html`<div key=${m.key} class="meal-tap on-pastel-meal" role="button" tabIndex="0" aria-label=${"Bewerk " + m.label}
          onClick=${(ev) => { if (!ev.target.closest("a")) open(); }} onKeyDown=${(ev) => { if (ev.key === "Enter") open(); }}>
          <${DS.MealBlock} meal=${m.label} accent=${m.accent} note=${e.note || ""} recipe=${e.recipe || undefined}
            kcal=${fmt(e.kcal)} protein=${fmt(e.protein)} fat=${fmt(e.fat)} carbs=${fmt(e.carbs)} />
        </div>`;
      })}
    </div>

    <div class="row" style=${{ borderTop: "1px solid var(--border)", paddingTop: 14, gap: 10 }}>
      <div class="flex1 sub">Zet je notities als tekst klaar voor je coach.</div>
      <${DS.Button} size="sm" onClick=${() => ctx.sheet(html`<${CoachSheet} date=${date} />`)}>Kopieer voor coach<//>
    </div>
    <div class="row" style=${{ gap: 10, marginTop: 14 }}>
      <div class="flex1 sub">Elke zondag staat hier je weekoverzicht met tips voor je maaltijdplan.</div>
      <${DS.Chip} onClick=${() => ctx.go("foodweek", { sunday: lastSunday(today) })}>Weekoverzicht<//>
    </div>
    <div class="sub" style=${{ marginTop: 16 }}>Dagdoel ${num(g.kcal)} kcal · ${g.protein} g eiwit · ${g.fat} g vet · ${g.carbs} g koolhydraten. Aanpassen in Instellingen.</div>
  </div>`;
}
