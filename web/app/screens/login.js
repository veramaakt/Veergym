import { html, DS, useState } from "../ui.js";
import * as store from "../store.js";
import { syncNow } from "../sync.js";

export function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || "Inloggen lukt niet");
      store.setMeta("token", body.token);
      syncNow();
    } catch (e) {
      setErr(navigator.onLine ? e.message : "Geen verbinding met de server. De eerste keer inloggen moet online.");
    } finally {
      setBusy(false);
    }
  }

  return html`<div class="page" style=${{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <div class="hero">
      <div class="caption" style=${{ color: "#211a12" }}>Welkom</div>
      <div style=${{ fontSize: "var(--display-lg-size)", lineHeight: "var(--display-lg-line)", fontWeight: 800, marginTop: 6 }}>Veergym</div>
    </div>
    <form onSubmit=${submit} style=${{ marginTop: 24 }}>
      <div class="label">Wachtwoord</div>
      <input class="field" type="password" autoComplete="current-password" value=${pw} onInput=${(e) => setPw(e.target.value)} autoFocus />
      ${err && html`<div class="error">${err}</div>`}
      <div style=${{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <${DS.Button} type="submit" disabled=${busy || !pw} onClick=${submit}>Inloggen<//>
      </div>
    </form>
    <div class="sub" style=${{ marginTop: 24 }}>Eén inlog voor telefoon en desktop. Het wachtwoord staat als APP_PASSWORD in het bestand .env van je app-map.</div>
  </div>`;
}
