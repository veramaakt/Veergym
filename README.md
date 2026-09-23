# Veergym

Persoonlijke fitness-app: training loggen, voortgang, metingen en eten op één rustige plek.
Werkt op je telefoon (ook zonder bereik) en op je desktop, en synchroniseert tussen beide.

Stand van nu (bouwstap 1): schema's, workouts loggen met vorige sessie, rusttimer, PR-meldingen,
oefeningenbibliotheek, samenvatting voor je coach, synchronisatie en export (CSV/JSON).
Voortgang, metingen, eten en de Hevy-import komen in volgende stappen.

## Twee mappen

| Map | Wat | Wie werkt erin |
|---|---|---|
| `Veergym - Claude` | De broncode. Bevat **nooit** sleutels. Staat op GitHub. | Claude |
| `Veergym - app` | Jouw werkende app, met je `.env` (wachtwoord, sleutels) en je data. | Alleen jij |

Het kopieerscript zet de nieuwste code van de eerste naar de tweede map. Je `.env` en je data
(`data/`) worden daarbij nooit gelezen, overschreven of verwijderd.

## Eerste keer

1. **Code naar je app-map kopiëren.** Dubbelklik `deploy.command` in `Veergym - Claude`.
   De eerste keer vraagt het je naam en e-mailadres voor GitHub, en daarna (bij het pushen) je
   GitHub-inlog; zie "GitHub-toegang" hieronder.
2. **Sleutels invullen.** Open `Veergym - app/.env` in TextEdit en vul minimaal `APP_PASSWORD` in.
3. **Starten.** Dubbelklik `start.command` in `Veergym - app`. De eerste keer maakt hij de
   conda-omgeving `veergym` aan (een paar minuten). Open daarna http://localhost:8321.

Lukt dubbelklikken niet ("kan niet worden geopend")? Klik met rechts op het bestand > Open.

Zonder dubbelklik, in Terminal:

```bash
cd "/Users/jansen/Documents/Vibe coding/Veergym/Veergym - app"
```

```bash
conda env create -f environment.yml
```

```bash
conda run -n veergym uvicorn veergym.main:app --host 0.0.0.0 --port 8321
```

## Op je telefoon

- **Thuis, zelfde wifi:** `start.command` toont een adres als `http://192.168.x.x:8321`. Open dat
  in Chrome op je Android. Dit werkt, maar zonder offline-modus (browsers staan dat alleen toe via https).
- **Aanrader, ook buiten huis en offline in de sportschool:** installeer [Tailscale](https://tailscale.com)
  (gratis) op je Mac en je telefoon, en zet in Terminal op je Mac eenmalig:

  ```bash
  tailscale serve --bg 8321
  ```

  Je krijgt dan een https-adres (iets als `https://jouw-mac.tailnet-naam.ts.net`). Open dat op je
  telefoon, log in, en kies in Chrome "Toevoegen aan startscherm". Nu opent de app ook zonder bereik;
  wat je logt synchroniseert zodra je Mac weer bereikbaar is.

Je Mac moet aan staan (met `start.command` open) om te synchroniseren. Later kan de server naar de
cloud; de app is daar al op voorbereid (`DATABASE_URL`, `SECRET_KEY` in `.env`).

## Nieuwe versie van Claude binnenhalen

Dubbelklik `deploy.command` in `Veergym - Claude`, typ een korte omschrijving en druk Enter.
Dan: kopiëren naar je app-map, controle op per ongeluk meegekomen sleutels, commit en push naar
GitHub. Herstart daarna `start.command` in je app-map.

Opties via Terminal (vanuit `Veergym - Claude`):

```bash
~/anaconda3/envs/veergym/bin/python tools/deploy.py --dry-run
```

`--dry-run` laat zien wat er zou gebeuren, `--no-push` kopieert en commit zonder te pushen,
`-m "tekst"` geeft een omschrijving mee.

## GitHub-toegang

Pushen naar https://github.com/veramaakt/Veergym vraagt de eerste keer om je GitHub-gebruikersnaam
en een wachtwoord. Gebruik als wachtwoord een **personal access token** (GitHub > Settings >
Developer settings > Personal access tokens > Fine-grained, met "Contents: Read and write" op de
repository Veergym). macOS onthoudt hem daarna in de sleutelhanger.

## Macro's laten schatten door Claude (optioneel)

Op het Eten-scherm kan de knop "Schat macro's" je maaltijdnotitie naar Claude sturen en kcal,
eiwit, vet en koolhydraten voorstellen. Daarvoor heb je een eigen API-sleutel nodig (los van je
Claude-abonnement):

1. Maak een account op https://console.anthropic.com, zet er wat tegoed op (een paar euro is
   maanden genoeg) en maak onder API Keys een sleutel aan.
2. Zet hem in `Veergym - app/.env` achter `ANTHROPIC_API_KEY=` en herstart `start.command`.

Alleen je maaltijdnotitie en de tekst bij Instellingen > "Wat Claude over je eten moet weten"
worden meegestuurd. De sleutel blijft op je Mac; de app op je telefoon ziet hem nooit.

## Je data

- Alles staat in `Veergym - app/data/veergym.db` (SQLite) en op elk apparaat in de browser.
- Exporteren: Instellingen > Je data > CSV of JSON (alles sinds de start).
- Back-up: kopieer de map `data/` af en toe naar een veilige plek.

## Voor ontwikkelaars (of Claude)

Zie `CLAUDE.md`. Tests: `conda run -n veergym python -m pytest -q`.

## Licenties van meegeleverde onderdelen

React en htm (MIT), Plus Jakarta Sans (SIL Open Font License), spierfiguur uit
[react-muscle-highlighter](https://github.com/soroojshehryar/react-muscle-highlighter) (MIT).
