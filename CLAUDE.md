# Veergym — notities voor Claude

**Harde regel:** kijk NOOIT in `../Veergym - app` (`/Users/jansen/Documents/Vibe coding/Veergym/Veergym - app`).
Daar staan Vera's geheime sleutels (`.env`) en haar echte data. Niet lezen, niet listen, niet greppen,
ook niet via scripts of subagents die inhoud tonen. Test het deployscript altijd met `--target` naar een tijdelijke map.

## Wat is dit
Persoonlijke fitness-app (zie `Aangeleverd/vision-brief-fitness-app.md`), design in `docs/design/Gymveer.dc.html`
(Claude Design-project `4d5b8650-1971-4f01-9da6-027af15dd538`).

- Backend: Python 3.12 in conda-env `veergym` (`environment.yml`), FastAPI + SQLModel/SQLite. Code in `veergym/`.
  Eén tabel `Record` (kind, id, data-JSON, updated_at, deleted, seq); sync = laatste wijziging wint (`veergym/sync.py`).
- Frontend: PWA zonder bouwstap in `web/`: React UMD + htm + design-system-bundle `web/ds/ds_bundle.js`
  (componenten via `window.DesignSystem_de9512`). Lokale opslag in IndexedDB (`web/app/store.js`), sync in `web/app/sync.js`.
  Nieuw bestand in `web/`? Voeg het toe aan `SHELL` in `web/sw.js` en verhoog `VERSION`.
- Workout-records bevatten hun sets: `{title, template, start, end, rpe, note, items:[{exercise, sets:[{type,w,r,dur,dist,rpe}]}]}`.
- Oefeningtypes: kg, assist (lager is beter), reps, duur, afstand.
- Voortgang/Maandoverzicht rekenen in de browser (`web/app/stats.js`); Hevy-import draait op de server
  (`veergym/hevy.py`, endpoints `/api/import/hevy/preview` en `/api/import/hevy`). Geïmporteerde workouts
  hebben een vast id (`hevy-<hash van starttijd+titel>`), dus herhaald importeren maakt geen dubbelen.
- Metingen: records `measurement` met id `m-JJJJ-MM-DD` (`web/app/measure.js`); meetschema/velden in het `settings`-record.
  Import uit Vera's Google Sheet "Gym dashboard" gaat via een CSV-export die de app zelf leest (kopregel met "Datum").
- `prive/` (gitignored) bevat Vera's persoonlijke testbestanden, zoals haar Hevy-export. Mag gelezen worden
  om te testen, maar komt nooit in git, in tests of in `web/`.
- In htm: gebruik `autoFocus`/`inputMode` (React-casing) en `<${Fragment}>` i.p.v. `<>`.

## Demo voor feedback
`python tools/build_demo.py` bouwt `build/demo/` (gitignored): de app met `window.VEERGYM_DEMO`, zonder server/inlog,
met verzonnen voorbeelddata. Gepubliceerd als privé-Artifact https://claude.ai/artifact/StRyRvkWDukTUsbgaYTK8j
waar Vera comments plaatst (lees ze met ArtifactComments). Na elke afgeronde wijziging: demo opnieuw bouwen en
republishen naar diezelfde url (file_path `build/demo/index.html`, root `build/demo`, alle bestanden als `files`).

## Commando's
- Tests: `~/anaconda3/bin/conda run -n veergym python -m pytest -q`
- Dev-server: `APP_PASSWORD=test VEERGYM_DATA_DIR=<scratch> conda run -n veergym uvicorn veergym.main:app --port 8765 --reload`
- Deploy: `python tools/deploy.py` (kopieert naar `../Veergym - app`, commit + push naar github.com/veramaakt/Veergym)

## Na elke afgeronde wijziging
Vera wil niet zelf pushen. Als een wijziging af en getest is, draai:
`GIT_TERMINAL_PROMPT=0 ~/anaconda3/envs/veergym/bin/python tools/deploy.py -m "<korte omschrijving>"`
(kopieert naar de app-map en pusht naar GitHub; de token staat in de macOS-sleutelhanger).
Alleen werkende, geteste code. Stopt de sleutelcontrole? Los de oorzaak op, nooit omzeilen.
Meld Vera daarna wat er gepusht is en dat ze `start.command` moet herstarten.

## Backlog (besloten met Vera)
- Voortgangsfoto's (idee Vera, 23-9): foto's per meetmoment (voor/zij/achter) met een doorzichtige "spookfoto" van de
  vorige keer over de camera, zodat de pose gelijk blijft; vergelijken naast elkaar. Nog niet gebouwd: wacht op Vera's keuze
  wanneer en waar de foto's bewaard worden (alleen telefoon of ook op haar Mac). Nooit in git, demo of Claude-context.
- Strength level-balk: bewust overgeslagen (23-9). Hevy gebruikt eigen gebruikersdata; strengthlevel.com-tabellen zijn niet vrij herbruikbaar; open vuistregels dekken geen machines. Mogelijk later: link per oefening naar strengthlevel.com.
- Kleuren: krachtgrafieken krijgen een kleur per spiergroep (`groupColor` in `web/app/stats.js`, tokens `--g-*` in `app.css`).
- Spierfiguur: `web/vendor/muscle-female.js` (react-muscle-highlighter, MIT), koppeling in `web/app/muscles.js`.
