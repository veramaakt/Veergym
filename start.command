#!/bin/bash
# Veergym starten. Dubbelklik dit bestand in Finder (in je app-map "Veergym - app").
# De app is daarna bereikbaar op http://localhost:8321 en op je telefoon via je Mac.
cd "$(dirname "$0")"
PORT=8321

CONDA="$HOME/anaconda3/bin/conda"
[ -x "$CONDA" ] || CONDA="$(command -v conda)"
if [ -z "$CONDA" ]; then
  echo "Anaconda niet gevonden. Installeer Anaconda of pas het pad in start.command aan."
  read -p "Druk op Enter om te sluiten." ; exit 1
fi

if ! "$CONDA" env list | grep -q "^veergym "; then
  echo "Eerste keer: conda-omgeving 'veergym' aanmaken (duurt een paar minuten)..."
  "$CONDA" env create -f environment.yml || { read -p "Mislukt. Enter om te sluiten."; exit 1; }
fi

if [ ! -f .env ] || ! grep -q "^APP_PASSWORD=." .env; then
  echo "Let op: vul eerst APP_PASSWORD in het bestand .env in (in deze map)."
  read -p "Druk op Enter om te sluiten." ; exit 1
fi

if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Poort $PORT is al in gebruik door een ander programma:"
  lsof -nP -iTCP:$PORT -sTCP:LISTEN | tail -n +2 | awk '{print "  " $1 " (pid " $2 ")"}'
  echo "Draait Veergym al in een ander venster? Gebruik dan dat. Anders: sluit dat programma en probeer opnieuw."
  read -p "Druk op Enter om te sluiten." ; exit 1
fi

IP=$(ipconfig getifaddr en0 2>/dev/null)
echo ""
echo "Veergym draait. Open:"
echo "  op deze Mac:      http://localhost:$PORT"
[ -n "$IP" ] && echo "  op je telefoon:   http://$IP:$PORT   (zelfde wifi)"
echo "Sluit dit venster (of Ctrl+C) om te stoppen."
echo ""
exec "$CONDA" run --no-capture-output -n veergym uvicorn veergym.main:app --host 0.0.0.0 --port $PORT
