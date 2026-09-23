import { html, DS, DEMO, useState, Switch } from "../ui.js";
import { fields as measureFields } from "../measure.js";
import { seedDemo } from "../demo.js";
import { MACROS, goals as foodGoals, DEFAULT_CONTEXT } from "../food.js";
import * as store from "../store.js";
import { time } from "../logic.js";

const REST_OPTIONS = [30, 60, 90, 120, 150, 180];

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("vg-theme", t); } catch (e) {}
}

async function download(path, filename) {
  const res = await fetch(path, { headers: { Authorization: "Bearer " + store.getMeta("token") } });
  if (!res.ok) throw new Error("Export mislukt (" + res.status + ")");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Row({ title, sub, children, first }) {
  return html`<div class="row" style=${{ gap: 10, padding: "10px 0", borderTop: first ? "none" : "1px solid var(--border)" }}>
    <div class="flex1"><div class="body">${title}</div>${sub && html`<div class="sub">${sub}</div>`}</div>
    ${children}
  </div>`;
}

export function Settings({ ctx }) {
  const [theme, setT] = useState(document.documentElement.dataset.theme || "light");
  const settings = store.get("settings") || {};
  const [newField, setNewField] = useState("");
  const addField = () => {
    const l = newField.trim();
    if (!l) return;
    const key = "c_" + l.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (!measureFields({ includeHidden: true }).some((f) => f.key === key)) store.put("settings", "settings", { ...settings, measureCustom: [...(settings.measureCustom || []), { key, label: l }] });
    setNewField("");
  };
  const restDefault = settings.restDefault ?? 90;
  const notInDemo = () => ctx.toast({ title: "Niet in de demo", detail: "Dit werkt alleen in je echte app.", icon: "close" });
  const exportIt = DEMO ? notInDemo : (path, name) => download(path, name).catch((e) => ctx.toast({ title: "Export lukt niet", detail: navigator.onLine ? e.message : "Exporteren kan alleen online.", icon: "close" }));
  const lastSync = ctx.sync.at ? new Date(ctx.sync.at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : null;

  return html`<div class="fill">
    <${DS.TopBar} title="Instellingen" leading="close" onLeading=${ctx.back} />
    <div class="scroll">
      <div class="section first">
        <div class="title">Training</div>
        <div class="caption" style=${{ margin: "12px 0 8px" }}>Standaard rusttijd</div>
        <div class="chips">${REST_OPTIONS.map((v) => html`<${DS.Chip} key=${v} selected=${restDefault === v} onClick=${() => store.put("settings", "settings", { ...settings, restDefault: v })}>${time(v)}<//>`)}</div>
        <div class="sub" style=${{ marginTop: 8 }}>Per oefening kun je een eigen rusttijd kiezen.</div>
        <${Row} title="Oefeningen" sub=${`${ctx.exercises.length} in je bibliotheek`}><${DS.Chip} onClick=${() => ctx.go("library", { mode: "browse" })}>Bekijken<//><//>
      </div>

      <div class="section">
        <div class="title">Dagdoelen eten</div>
        ${MACROS.map((m) => html`<div key=${m.key} class="row" style=${{ gap: 12, padding: "6px 0" }}>
          <div class="flex1" style=${{ fontSize: "var(--body-md-size)", fontWeight: 700 }}>${m.key === "kcal" ? "Energie" : m.label}</div>
          <input inputMode="numeric" defaultValue=${foodGoals()[m.key]} onChange=${(e) => {
            const v = Number(String(e.target.value).replace(",", "."));
            if (!Number.isNaN(v) && v > 0) store.put("settings", "settings", { ...settings, foodGoals: { ...foodGoals(), [m.key]: v } });
          }} style=${{ width: 88, height: 44, border: "none", borderRadius: "var(--radius-sm)", background: "var(--surface-tint)", fontFamily: "inherit", fontSize: "var(--body-md-size)", fontWeight: 800, textAlign: "center", outline: "none", color: "var(--ink)" }} />
          <div style=${{ width: 34, fontSize: "var(--body-sm-size)", fontWeight: 700, color: "var(--ink-soft)" }}>${m.unit}</div>
        </div>`)}
        <div class="caption" style=${{ margin: "14px 0 6px" }}>Wat Claude over je eten moet weten</div>
        <textarea class="field" style=${{ minHeight: 64 }} defaultValue=${settings.foodContext ?? DEFAULT_CONTEXT}
          onBlur=${(e) => store.put("settings", "settings", { ...settings, foodContext: e.target.value })} placeholder="Bijv. vegetarisch, standaardontbijt, merken die je vaak gebruikt"></textarea>
        <div class="sub" style=${{ marginTop: 6 }}>Gaat mee met "Schat macro's", samen met je maaltijdnotitie. Schatten vraagt een Claude API-sleutel in .env.</div>
      </div>

      <div class="section">
        <div class="title">Metingen</div>
        <div class="caption" style=${{ margin: "12px 0 8px" }}>Meetschema</div>
        <div class="chips">${[[7, "Elke week"], [14, "Elke 2 weken"], [28, "Elke 4 weken"]].map(([d, l]) => html`<${DS.Chip} key=${d} selected=${(settings.measureEvery ?? 14) === d} onClick=${() => store.put("settings", "settings", { ...settings, measureEvery: d })}>${l}<//>`)}</div>
        <${Row} first title="Herinnering" sub="Melding op je beginscherm als een meetmoment eraan komt of gemist is">
          <${Switch} on=${settings.measureReminder !== false} label="Herinnering meetmoment" onChange=${(on) => store.put("settings", "settings", { ...settings, measureReminder: on })} />
        <//>
        <div class="caption" style=${{ margin: "8px 0 8px" }}>Omtrekken die je bijhoudt</div>
        <div class="chips">${measureFields({ includeHidden: true }).map((f) => {
          const hidden = (settings.measureHidden || []).includes(f.key);
          return html`<${DS.Chip} key=${f.key} selected=${!hidden} onClick=${() => store.put("settings", "settings", { ...settings, measureHidden: hidden ? (settings.measureHidden || []).filter((k) => k !== f.key) : [...(settings.measureHidden || []), f.key] })}>${f.label}<//>`;
        })}</div>
        <div class="row" style=${{ gap: 8, marginTop: 10 }}>
          <input class="field" style=${{ height: 44 }} value=${newField} onInput=${(e) => setNewField(e.target.value)} placeholder="Eigen omtrek, bijv. Kuit L" />
          <${DS.Chip} onClick=${addField}>Toevoegen<//>
        </div>
      </div>

      <div class="section">
        <div class="title">Thema</div>
        <div class="chips" style=${{ marginTop: 10 }}>
          <${DS.Chip} selected=${theme === "light"} onClick=${() => { setTheme("light"); setT("light"); }}>Licht<//>
          <${DS.Chip} selected=${theme === "dark"} onClick=${() => { setTheme("dark"); setT("dark"); }}>Donker<//>
        </div>
      </div>

      <div class="section">
        <div class="title">Je data</div>
        <${Row} first title="Exporteren" sub="Alles, sinds de start">
          <${DS.Chip} onClick=${() => exportIt("api/export.csv", "veergym-workouts.csv")}>CSV<//>
          <${DS.Chip} onClick=${() => exportIt("api/export.json", "veergym.json")}>JSON<//>
        <//>
        <${Row} title="Hevy-historie" sub="CSV uit Hevy importeren"><${DS.Chip} onClick=${DEMO ? notInDemo : () => ctx.go("import")}>Importeren<//><//>
        <${Row} title="Google Sheet" sub="Metingen uit Gym dashboard (CSV)"><${DS.Chip} onClick=${() => ctx.go("measureImport")}>Importeren<//><//>
        <${Row} title="Weegschaal" sub="Wegingen uit de Feelfit-app (Excel)"><${DS.Chip} onClick=${() => ctx.go("measureImport")}>Importeren<//><//>
      </div>

      <div class="section">
        <div class="row" style=${{ gap: 10 }}><div class="flex1 title">Koppelingen</div><span class="tag">Fase 2</span></div>
        <${Row} first title="Health Connect" sub="Galaxy Watch 7: slaap, stappen, rusthartslag, trainingen. Alleen lezen." />
        <${Row} title="Feelfit-weegschaal" sub="Nu via export; automatisch koppelen kan later" />
      </div>

      <div class="section">
        <div class="title">Account</div>
        <div class="sub" style=${{ margin: "4px 0 8px" }}>Eén inlog, voor telefoon en desktop.${lastSync ? ` Laatst gesynchroniseerd om ${lastSync}.` : ""}</div>
        <${DS.SyncStatus} mode=${ctx.sync.mode} />
        ${ctx.sync.error && html`<div class="sub">${ctx.sync.error}</div>`}
        ${DEMO ? html`<div class="chips" style=${{ marginTop: 12 }}>
          <${DS.Chip} onClick=${async () => { await seedDemo(); ctx.tab("home"); }}>Demo opnieuw beginnen<//>
        </div>` : html`<div class="chips" style=${{ marginTop: 12 }}>
          <${DS.Chip} onClick=${() => ctx.syncNow()}>Nu synchroniseren<//>
          <${DS.Chip} onClick=${() => { store.setMeta("token", null); }}>Uitloggen<//>
        </div>`}
        <div class="sub" style=${{ marginTop: 8 }}>${DEMO ? "In de demo blijven wijzigingen alleen in jouw browser." : "Uitloggen laat je gegevens op dit apparaat staan."}</div>
      </div>
    </div>
  </div>`;
}
