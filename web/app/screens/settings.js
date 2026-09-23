import { html, DS, useState } from "../ui.js";
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
  const restDefault = settings.restDefault ?? 90;
  const exportIt = (path, name) => download(path, name).catch((e) => ctx.toast({ title: "Export lukt niet", detail: navigator.onLine ? e.message : "Exporteren kan alleen online.", icon: "close" }));
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
        <${Row} title="Hevy-historie" sub="CSV uit Hevy importeren · volgende bouwstap"><span class="tag">Later</span><//>
        <${Row} title="Google Sheet" sub="Metingen uit Gym dashboard · volgende bouwstap"><span class="tag">Later</span><//>
      </div>

      <div class="section">
        <div class="row" style=${{ gap: 10 }}><div class="flex1 title">Koppelingen</div><span class="tag">Fase 2</span></div>
        <${Row} first title="Health Connect" sub="Galaxy Watch 7: slaap, stappen, rusthartslag, trainingen. Alleen lezen." />
        <${Row} title="MyFitt-weegschaal" sub="Nog uitzoeken of hij naar Health Connect schrijft" />
      </div>

      <div class="section">
        <div class="title">Account</div>
        <div class="sub" style=${{ margin: "4px 0 8px" }}>Eén inlog, voor telefoon en desktop.${lastSync ? ` Laatst gesynchroniseerd om ${lastSync}.` : ""}</div>
        <${DS.SyncStatus} mode=${ctx.sync.mode} />
        ${ctx.sync.error && html`<div class="sub">${ctx.sync.error}</div>`}
        <div class="chips" style=${{ marginTop: 12 }}>
          <${DS.Chip} onClick=${() => ctx.syncNow()}>Nu synchroniseren<//>
          <${DS.Chip} onClick=${() => { store.setMeta("token", null); }}>Uitloggen<//>
        </div>
        <div class="sub" style=${{ marginTop: 8 }}>Uitloggen laat je gegevens op dit apparaat staan.</div>
      </div>
    </div>
  </div>`;
}
