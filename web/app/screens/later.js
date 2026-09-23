import { html, DS } from "../ui.js";

const TEXT = {
  progress: ["trend", "Voortgang", "Grafieken van kracht, volume en je maandoverzicht komen in de volgende bouwstap. Je workouts worden nu al bewaard, dus niets gaat verloren."],
  measure: ["scale", "Metingen", "Gewicht en omtrekken invullen komt in een volgende bouwstap."],
  food: ["fork", "Eten", "Het dagscherm met maaltijden en resterende macro's komt in een volgende bouwstap."],
};

export function Later({ screen }) {
  const [icon, title, body] = TEXT[screen] || TEXT.progress;
  return html`<div class="page">
    <div class="title" style=${{ fontSize: "var(--display-md-size)", lineHeight: "var(--display-md-line)" }}>${title}</div>
    <div style=${{ marginTop: 40 }}><${DS.EmptyState} icon=${icon} title="Komt eraan" body=${body} /></div>
  </div>`;
}
