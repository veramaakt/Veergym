#!/bin/bash
# Dubbelklik in Finder: kopieert de nieuwste code naar "Veergym - app" en zet hem op GitHub.
cd "$(dirname "$0")"
CONDA="$HOME/anaconda3/bin/conda"
[ -x "$CONDA" ] || CONDA="$(command -v conda)"
PY="$("$CONDA" run -n veergym which python 2>/dev/null)"
[ -n "$PY" ] || PY="$HOME/anaconda3/bin/python"

echo "Veergym: kopiëren en naar GitHub zetten"
read -p "Korte omschrijving van de wijziging (Enter = datum): " MSG
if [ -n "$MSG" ]; then
  "$PY" tools/deploy.py -m "$MSG"
else
  "$PY" tools/deploy.py
fi
echo ""
read -p "Druk op Enter om te sluiten."
