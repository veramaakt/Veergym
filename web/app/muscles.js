// Welke spieren een oefening traint, en het spierfiguur dat ze laat oplichten.
// De koppeling gaat op trefwoorden in de naam (eerste treffer wint), zodat hij
// ook werkt voor eigen en geïmporteerde oefeningen. Figuur: vendor/muscle-female.js.
import { html } from "./ui.js";
import { VIEWBOX, OUTLINE, PARTS } from "../vendor/muscle-female.js";

export const MUSCLE_NAMES = {
  abs: "Buikspieren", adductors: "Adductoren", biceps: "Biceps", calves: "Kuiten", chest: "Borst",
  deltoids: "Schouders", forearm: "Onderarmen", gluteal: "Billen", hamstring: "Hamstrings",
  "lower-back": "Onderrug", neck: "Nek", obliques: "Schuine buikspieren", quadriceps: "Quadriceps",
  tibialis: "Scheenbeen", trapezius: "Trapezius", triceps: "Triceps", "upper-back": "Bovenrug",
};

// [trefwoorden, primair, secundair]
const RULES = [
  [["roeien", "rowing machine"], ["upper-back", "quadriceps"], ["biceps", "hamstring", "gluteal"]],
  [["hardlopen", "running", "wandelen", "walking (", "fietsen", "cycling", "crosstrainer", "traplopen", "stair", "treadmill"], ["quadriceps", "calves"], ["hamstring", "gluteal"]],
  [["hip thrust", "glute bridge", "frog pump", "kickback"], ["gluteal"], ["hamstring"]],
  [["abduction"], ["gluteal"], []],
  [["adduction"], ["adductors"], []],
  [["single leg romanian", "romanian deadlift", "rdl", "stiff leg", "good morning"], ["hamstring", "gluteal"], ["lower-back"]],
  [["deadlift"], ["gluteal", "hamstring", "lower-back"], ["quadriceps", "trapezius", "forearm"]],
  [["bulgarian", "split squat", "lunge", "step up"], ["quadriceps", "gluteal"], ["adductors", "hamstring"]],
  [["leg extension"], ["quadriceps"], []],
  [["leg curl"], ["hamstring"], ["calves"]],
  [["calf"], ["calves"], []],
  [["wall sit"], ["quadriceps"], ["gluteal"]],
  [["leg press", "hack squat", "squat"], ["quadriceps", "gluteal"], ["adductors", "hamstring"]],
  [["face pull", "rear delt", "reverse fly"], ["deltoids"], ["upper-back", "trapezius"]],
  [["straight arm"], ["upper-back"], ["triceps"]],
  [["pulldown", "pull up", "pull-up", "chin up"], ["upper-back"], ["biceps", "forearm"]],
  [["row"], ["upper-back"], ["biceps", "deltoids", "trapezius"]],
  [["back extension", "hyperextension"], ["lower-back"], ["gluteal", "hamstring"]],
  [["shrug"], ["trapezius"], []],
  [["chest fly", "butterfly", "pec deck", "cable fly", "crossover"], ["chest"], ["deltoids"]],
  [["incline"], ["chest", "deltoids"], ["triceps"]],
  [["bench press", "chest press", "push up", "push-up", "chest dip"], ["chest"], ["triceps", "deltoids"]],
  [["lateral raise", "front raise"], ["deltoids"], ["trapezius"]],
  [["shoulder press", "overhead press", "arnold", "military press"], ["deltoids"], ["triceps", "trapezius"]],
  [["hammer curl"], ["biceps", "forearm"], []],
  [["curl"], ["biceps"], ["forearm"]],
  [["skullcrusher", "pushdown", "tricep", "dip"], ["triceps"], ["chest"]],
  [["side plank", "russian twist", "torso", "pallof", "oblique"], ["obliques"], ["abs"]],
  [["plank"], ["abs"], ["obliques", "deltoids"]],
  [["crunch", "sit up", "sit-up", "knee raise", "leg raise", "dead bug"], ["abs"], ["obliques"]],
];

const BY_GROUP = {
  Benen: [["quadriceps", "hamstring"], ["gluteal"]], Billen: [["gluteal"], ["hamstring"]], Borst: [["chest"], ["triceps"]],
  Rug: [["upper-back"], ["biceps"]], Schouders: [["deltoids"], ["trapezius"]], Armen: [["biceps", "triceps"], ["forearm"]],
  Core: [["abs"], ["obliques"]], Cardio: [["quadriceps", "calves"], ["hamstring"]],
};

export function musclesFor(ex) {
  if (!ex) return { primary: [], secondary: [] };
  const n = " " + String(ex.name || "").toLowerCase().replace(/squad/g, "squat").replace(/smit /g, "smith ") + " ";
  for (const [words, primary, secondary] of RULES) {
    if (words.some((w) => n.includes(w))) return { primary, secondary };
  }
  const g = BY_GROUP[ex.group];
  return g ? { primary: g[0], secondary: g[1] } : { primary: [], secondary: [] };
}

const SKIP = new Set(["hair", "head", "hands", "feet", "ankles", "knees"]);

function Figure({ side, primary, secondary, height }) {
  const fill = (slug) =>
    primary.includes(slug) ? "var(--accent-lavender)"
      : secondary.includes(slug) ? "var(--muscle-secondary)"
      : SKIP.has(slug) ? "var(--muscle-body)" : "var(--muscle-off)";
  return html`<svg viewBox=${VIEWBOX[side]} height=${height} role="img" aria-label=${side === "front" ? "Voorkant" : "Achterkant"} style=${{ display: "block", maxWidth: "100%" }}>
    <path d=${OUTLINE[side]} fill="var(--muscle-body)" stroke="var(--muscle-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    ${PARTS[side].map((p) => p.d.map((d, i) => html`<path key=${p.slug + i} d=${d} fill=${fill(p.slug)} stroke="var(--muscle-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />`))}
  </svg>`;
}

/** Voor- en achterkant naast elkaar, met een legenda eronder. */
export function MuscleFigure({ ex }) {
  const { primary, secondary } = musclesFor(ex);
  const names = (list) => list.map((s) => MUSCLE_NAMES[s] || s).join(", ");
  return html`<div>
    <div style=${{ display: "flex", justifyContent: "center", gap: 12 }}>
      ${["front", "back"].map((side) => html`<div key=${side} style=${{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <${Figure} side=${side} primary=${primary} secondary=${secondary} height=${300} />
        <span class="caption">${side === "front" ? "Voor" : "Achter"}</span>
      </div>`)}
    </div>
    <div style=${{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, fontSize: "var(--body-sm-size)", lineHeight: "var(--body-sm-line)" }}>
      <div class="row" style=${{ gap: 8, alignItems: "baseline" }}>
        <span style=${{ flex: "none", width: 12, height: 12, borderRadius: 4, background: "var(--accent-lavender)", alignSelf: "center" }}></span>
        <span style=${{ fontWeight: 700, color: "var(--ink-soft)", width: 72, flex: "none" }}>Primair</span>
        <span style=${{ fontWeight: 700 }}>${names(primary) || "–"}</span>
      </div>
      ${secondary.length > 0 && html`<div class="row" style=${{ gap: 8, alignItems: "baseline" }}>
        <span style=${{ flex: "none", width: 12, height: 12, borderRadius: 4, background: "var(--muscle-secondary)", alignSelf: "center" }}></span>
        <span style=${{ fontWeight: 700, color: "var(--ink-soft)", width: 72, flex: "none" }}>Secundair</span>
        <span style=${{ fontWeight: 700 }}>${names(secondary)}</span>
      </div>`}
    </div>
  </div>`;
}
