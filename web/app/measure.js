// Lichaamsmetingen: gewicht en omtrekken, meetschema en de import uit een spreadsheet (CSV).
// Een meting is een record van soort "measurement" met id "m-JJJJ-MM-DD":
//   { date: "2026-08-12", weight: 74.4, fields: { borst: 97, ... }, note: "" }
import * as store from "./store.js";

export const DEFAULT_FIELDS = [
  { key: "borst", label: "Borst" },
  { key: "onderborst", label: "Onderborst" },
  { key: "taille", label: "Taille" },
  { key: "buik", label: "Buik / navel" },
  { key: "heupen", label: "Heupen" },
  { key: "billen", label: "Billen" },
  { key: "bovenbeen_l", label: "Bovenbeen L" },
  { key: "bovenbeen_r", label: "Bovenbeen R" },
  { key: "bovenarm_l", label: "Bovenarm L" },
  { key: "bovenarm_r", label: "Bovenarm R" },
];

const DAY = 86400000;
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const DAYS = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export const settings = () => store.get("settings") || {};
export const measureEvery = () => settings().measureEvery ?? 14;

/** Alle velden (standaard + eigen), zonder de verborgen. */
export function fields({ includeHidden = false } = {}) {
  const s = settings();
  const all = [...DEFAULT_FIELDS, ...(s.measureCustom || [])];
  return includeHidden ? all : all.filter((f) => !(s.measureHidden || []).includes(f.key));
}

// ---------- datums ----------

export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayISO = () => toISO(new Date());
export const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const fmtDate = (iso) => {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtDay = (iso) => {
  const d = fromISO(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// ---------- lezen ----------

/** Metingen, oudste eerst. */
export function measurements() {
  return store.list("measurement").filter((m) => m.date).sort((a, b) => a.date.localeCompare(b.date));
}

/** Waarden van één veld ("weight" of een omtrek), oudste eerst: [{date, v}] */
export function series(list, key) {
  const out = [];
  for (const m of list) {
    const v = key === "weight" ? m.weight : m.fields?.[key];
    if (v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v))) out.push({ date: m.date, v: Number(v) });
  }
  return out;
}

/** Verschil tussen eerste en laatste meting: { value, delta, direction, startDate } */
export function sinceStart(points) {
  if (!points.length) return { value: null, delta: null, direction: null };
  const first = points[0];
  const last = points[points.length - 1];
  const delta = Math.round((last.v - first.v) * 10) / 10;
  return { value: last.v, delta, direction: delta > 0 ? "up" : delta < 0 ? "down" : null, startDate: first.date, lastDate: last.date };
}

/** Hoeveel metingen samen "een week" zijn, voor het voortschrijdend gemiddelde van je gewicht. */
export function weekWindow(points) {
  if (points.length < 3) return 1;
  const gaps = points.slice(1).map((p, i) => (fromISO(p.date) - fromISO(points[i].date)) / DAY).sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)] || 7;
  return Math.max(1, Math.min(7, Math.round(7 / median)));
}

/** Meetschema: wanneer is het volgende meetmoment? */
export function nextMeasure(list = measurements(), today = todayISO()) {
  const withFields = list.filter((m) => m.fields && Object.keys(m.fields).length);
  if (!withFields.length) return { due: true, next: today, last: null, missed: false };
  const last = withFields[withFields.length - 1].date;
  const next = toISO(new Date(fromISO(last).getTime() + measureEvery() * DAY));
  return { due: next <= today, next, last, missed: next < today };
}

// ---------- schrijven ----------

export function saveMeasurement(date, { weight, fields: f, note }) {
  const id = "m-" + date;
  const prev = store.get(id) || {};
  const clean = {};
  for (const [k, v] of Object.entries({ ...(prev.fields || {}), ...(f || {}) })) {
    if (v !== "" && v !== null && v !== undefined && !Number.isNaN(Number(v))) clean[k] = Number(v);
  }
  const w = weight === "" || weight === undefined ? prev.weight ?? null : weight === null ? null : Number(weight);
  store.put("measurement", id, { date, weight: w, fields: clean, note: note ?? prev.note ?? "" });
  return id;
}

// ---------- import uit een spreadsheet (CSV) ----------

function parseCSV(text) {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) || "";
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function parseDate(s) {
  s = String(s || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return toISO(new Date(+m[1], +m[2] - 1, +m[3]));
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return toISO(new Date(y, +m[2] - 1, +m[1]));
  }
  return null;
}

function parseNum(s) {
  const t = String(s || "").trim().replace(/\s|kg|cm/gi, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

/**
 * Leest een CSV-export (bijv. van Google Sheets). Zoekt zelf de kopregel met "Datum";
 * lege rijen en rijen zonder getallen worden overgeslagen.
 * Geeft { rows: [{date, weight, fields, note}], skipped, unknown: [kolomnamen die niet herkend zijn] }.
 */
export function parseMeasurementsCSV(text) {
  const rows = parseCSV(text.replace(/^\ufeff/, ""));
  const hi = rows.findIndex((r) => r.some((c) => norm(c) === "datum" || norm(c) === "date"));
  if (hi < 0) throw new Error('Geen kolom "Datum" gevonden. Staat de kopregel met Datum, Gewicht, Borst, ... in het bestand?');
  const header = rows[hi];
  const known = Object.fromEntries(fields({ includeHidden: true }).map((f) => [norm(f.label), f.key]));
  known[norm("Buik / Navel")] = "buik";
  known["buik"] = "buik";
  const cols = header.map((h) => {
    const n = norm(h);
    if (n === "datum" || n === "date") return { kind: "date" };
    if (n === "gewicht" || n === "weight") return { kind: "weight" };
    if (n.startsWith("opmerking") || n === "notitie" || n === "note") return { kind: "note" };
    if (known[n]) return { kind: "field", key: known[n] };
    return h.trim() && n !== "week" ? { kind: "unknown", label: h.trim() } : { kind: "skip" };
  });
  const out = [];
  let skipped = 0;
  for (const r of rows.slice(hi + 1)) {
    const date = parseDate(r[cols.findIndex((c) => c.kind === "date")]);
    const rec = { date, weight: null, fields: {}, note: "" };
    cols.forEach((c, i) => {
      if (c.kind === "weight") rec.weight = parseNum(r[i]);
      else if (c.kind === "field") { const v = parseNum(r[i]); if (v !== null) rec.fields[c.key] = v; }
      else if (c.kind === "note") rec.note = String(r[i] || "").trim();
    });
    if (!date || (rec.weight === null && !Object.keys(rec.fields).length)) {
      if (r.some((c) => String(c).trim())) skipped++;
      continue;
    }
    out.push(rec);
  }
  return { rows: out, skipped, unknown: cols.filter((c) => c.kind === "unknown").map((c) => c.label) };
}

/** Metingen als tekst voor je coach (voor onder de trainingssamenvatting). */
export function measureSummary(weeks = 4) {
  const list = measurements();
  if (!list.length) return "";
  const from = toISO(new Date(Date.now() - weeks * 7 * DAY));
  const lines = ["", "Metingen:"];
  const w = series(list, "weight");
  if (w.length) {
    const recent = w.filter((p) => p.date >= from);
    const s = sinceStart(w);
    lines.push(`- Gewicht: ${String(s.value).replace(".", ",")} kg (${fmtDate(s.lastDate)})` +
      (recent.length >= 2 ? `, ${recent[0].v > s.value ? "−" : "+"}${String(Math.abs(Math.round((s.value - recent[0].v) * 10) / 10)).replace(".", ",")} kg in deze periode` : "") +
      (s.delta ? `, ${s.delta > 0 ? "+" : "−"}${String(Math.abs(s.delta)).replace(".", ",")} kg sinds ${fmtDate(s.startDate)}` : ""));
  }
  const last = [...list].reverse().find((m) => Object.keys(m.fields || {}).length);
  if (last) {
    const prev = [...list].reverse().find((m) => m.date < last.date && Object.keys(m.fields || {}).length);
    const parts = fields().filter((f) => last.fields[f.key] !== undefined).map((f) => {
      const v = last.fields[f.key];
      const p = prev?.fields?.[f.key];
      const diff = p === undefined ? null : Math.round((v - p) * 10) / 10;
      const d = diff === null ? "" : diff === 0 ? " (gelijk)" : ` (${diff > 0 ? "+" : "−"}${String(Math.abs(diff)).replace(".", ",")})`;
      return `${f.label} ${String(v).replace(".", ",")}${d}`;
    });
    lines.push(`- Omtrekken ${fmtDate(last.date)} in cm${prev ? `, verschil t.o.v. ${fmtDate(prev.date)}` : ""}: ${parts.join(", ")}`);
  }
  return "\n" + lines.join("\n");
}
