"""Kopieer de broncode naar je app-map en zet de code op GitHub.

Gebruik (met de Python uit Anaconda):

    python tools/deploy.py                 # kopiëren + commit + push
    python tools/deploy.py -m "Rusttimer"  # met eigen omschrijving
    python tools/deploy.py --dry-run       # alleen laten zien wat er zou gebeuren
    python tools/deploy.py --no-push       # alleen kopiëren en committen

Wat het doet:
1. Kopieert alle bronbestanden (alles wat git bijhoudt) naar de app-map,
   standaard "../Veergym - app". Bestanden die eerder door dit script zijn
   gekopieerd maar niet meer bestaan, worden daar opgeruimd.
2. Je geheimen en data in de app-map worden NOOIT gelezen, overschreven of
   verwijderd (.env, data/, *.db, secrets/ ...). Bestaat .env nog niet, dan
   wordt die aangemaakt vanuit .env.example.
3. Controleert of er per ongeluk een sleutel in de broncode staat.
4. Commit en push vanuit de bronmap (die nooit sleutels bevat) naar GitHub.

Het script toont alleen aantallen, nooit de inhoud van bestanden in de app-map.
"""

import argparse
import fnmatch
import hashlib
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SOURCE = Path(__file__).resolve().parent.parent
DEFAULT_TARGET = SOURCE.parent / "Veergym - app"
REMOTE = "https://github.com/veramaakt/Veergym.git"
BRANCH = "main"
MANIFEST = ".veergym-manifest"

# In de app-map: nooit lezen, overschrijven of verwijderen.
PROTECTED_DIRS = {"data", "secrets", ".git"}
PROTECTED_NAMES = [".env", "*.env", "*.db", "*.sqlite", "*.pem", "*.key", "deploy.local.json", MANIFEST, ".DS_Store"]

# Nooit committen (naam van het bestand).
FORBIDDEN_NAMES = [".env", "*.pem", "*.key", "id_rsa*", "*.p12", "secret_key"]
# Nooit committen (inhoud die op een sleutel lijkt).
SECRET_PATTERNS = [
    re.compile(r"sk-ant-[A-Za-z0-9_\-]{20,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{40,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"AIza[0-9A-Za-z_\-]{35}"),
    re.compile(r"^\s*[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*\s*=\s*['\"]?[^\s'\"#]{12,}", re.M),
]


def say(msg: str) -> None:
    print(msg, flush=True)


def fail(msg: str) -> None:
    print(f"\nGESTOPT: {msg}", file=sys.stderr)
    sys.exit(1)


def git(*args: str, check: bool = True, capture: bool = True) -> subprocess.CompletedProcess:
    res = subprocess.run(["git", *args], cwd=SOURCE, text=True, capture_output=capture)
    if check and res.returncode != 0:
        fail(f"git {' '.join(args)} mislukte:\n{(res.stderr or res.stdout).strip()}")
    return res


def is_protected(rel: str) -> bool:
    parts = rel.split("/")
    if parts[-1] == ".env.example":
        return False
    if parts[0] in PROTECTED_DIRS or "__pycache__" in parts:
        return True
    return any(fnmatch.fnmatch(parts[-1], p) for p in PROTECTED_NAMES)


# ---------- git voorbereiden ----------

def ensure_repo() -> None:
    if (SOURCE / ".git").exists():
        return
    say("Git-repository aanmaken in de bronmap...")
    git("init", "-b", BRANCH)
    git("remote", "add", "origin", REMOTE)


def ensure_identity() -> None:
    for key, question in (("user.name", "Je naam voor git-commits: "), ("user.email", "Je e-mailadres voor git-commits (zoals bij GitHub): ")):
        if git("config", key, check=False).stdout.strip():
            continue
        if not sys.stdin.isatty():
            fail(f"git {key} is niet ingesteld. Voer uit: git config --global {key} \"...\"")
        value = input(question).strip()
        if not value:
            fail(f"geen {key} opgegeven.")
        git("config", key, value)


def source_files() -> list[str]:
    """Alles wat git bijhoudt of zou bijhouden (respecteert .gitignore)."""
    out = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").stdout
    return sorted(f for f in out.split("\0") if f and (SOURCE / f).is_file())


# ---------- controle op sleutels ----------

def scan_for_secrets(files: list[str]) -> list[str]:
    problems = []
    for rel in files:
        name = rel.split("/")[-1]
        if name != ".env.example" and any(fnmatch.fnmatch(name, p) for p in FORBIDDEN_NAMES):
            problems.append(f"{rel}: bestandsnaam hoort niet in git")
            continue
        path = SOURCE / rel
        if path.stat().st_size > 2_000_000:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for pat in SECRET_PATTERNS:
            for m in pat.finditer(text):
                line = text.count("\n", 0, m.start()) + 1
                problems.append(f"{rel}, regel {line}: lijkt op een sleutel")
    return problems


# ---------- kopiëren ----------

def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy_to_target(files: list[str], target: Path, dry_run: bool) -> None:
    say(f"\nKopiëren naar: {target}")
    if not target.exists():
        say("  (map bestaat nog niet, wordt aangemaakt)")
        if not dry_run:
            target.mkdir(parents=True)

    new, changed, same, skipped = 0, 0, 0, 0
    for rel in files:
        if is_protected(rel):
            skipped += 1
            continue
        src, dst = SOURCE / rel, target / rel
        if dst.exists():
            if dst.is_file() and digest(src) == digest(dst):
                same += 1
                continue
            changed += 1
        else:
            new += 1
        if not dry_run:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)

    # Opruimen: alleen bestanden die dit script eerder zelf heeft neergezet.
    manifest = target / MANIFEST
    previous = manifest.read_text().splitlines() if manifest.exists() else []
    current = set(files)
    removed = 0
    for rel in previous:
        if rel and rel not in current and not is_protected(rel) and (target / rel).is_file():
            removed += 1
            if not dry_run:
                (target / rel).unlink()
    if not dry_run and target.exists():
        manifest.write_text("\n".join(f for f in files if not is_protected(f)) + "\n")

    env_created = False
    if not (target / ".env").exists() and (SOURCE / ".env.example").exists():
        env_created = True
        if not dry_run:
            shutil.copy2(SOURCE / ".env.example", target / ".env")
            (target / ".env").chmod(0o600)

    say(f"  nieuw: {new}, gewijzigd: {changed}, ongewijzigd: {same}, opgeruimd: {removed}")
    if skipped:
        say(f"  {skipped} beschermd(e) bestand(en) overgeslagen")
    if env_created:
        say("  .env aangemaakt vanuit .env.example: vul daar je wachtwoord en sleutels in.")
    else:
        say("  je .env en data zijn niet aangeraakt.")


# ---------- GitHub ----------

def commit_and_push(message: str, push: bool, dry_run: bool) -> None:
    say("\nGitHub:")
    if dry_run:
        say(f"  (dry-run) zou committen met bericht: {message!r}" + (" en pushen" if push else ""))
        return
    git("add", "-A")
    staged = [f for f in git("diff", "--cached", "--name-only", "-z").stdout.split("\0") if f]
    problems = scan_for_secrets([f for f in staged if (SOURCE / f).is_file()])
    if problems:
        git("reset", "-q")
        fail("mogelijk geheime gegevens gevonden, er is niets gecommit:\n  " + "\n  ".join(problems))

    if staged:
        git("commit", "-q", "-m", message)
        say(f"  commit gemaakt ({len(staged)} bestand(en)): {message}")
    else:
        say("  geen wijzigingen om te committen")

    if not push:
        say("  push overgeslagen (--no-push)")
        return

    remote_head = git("ls-remote", "--heads", "origin", BRANCH, check=False).stdout.strip()
    if remote_head:
        remote_sha = remote_head.split()[0]
        if git("cat-file", "-e", remote_sha, check=False).returncode != 0 or \
                git("merge-base", "--is-ancestor", remote_sha, "HEAD", check=False).returncode != 0:
            say("  GitHub heeft wijzigingen die hier nog niet zijn; eerst ophalen...")
            res = git("pull", "--rebase", "origin", BRANCH, check=False)
            if res.returncode != 0:
                git("rebase", "--abort", check=False)
                fail("ophalen van GitHub gaf een conflict. Los dit op (of vraag Claude om hulp) en probeer opnieuw.")
    res = git("push", "-u", "origin", BRANCH, check=False, capture=False)
    if res.returncode != 0:
        fail("pushen naar GitHub lukte niet. Controleer je inlog (zie README, 'GitHub-toegang').")
    say(f"  gepusht naar {REMOTE}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Kopieer Veergym naar je app-map en zet de code op GitHub.")
    ap.add_argument("--target", type=Path, default=DEFAULT_TARGET, help="app-map (standaard: ../Veergym - app)")
    ap.add_argument("-m", "--message", help="omschrijving van de wijziging")
    ap.add_argument("--dry-run", action="store_true", help="niets wijzigen, alleen tonen")
    ap.add_argument("--no-push", action="store_true", help="niet naar GitHub pushen")
    args = ap.parse_args()

    target = args.target.resolve()
    if target == SOURCE or SOURCE in target.parents:
        fail("de app-map mag niet gelijk zijn aan (of binnen) de bronmap.")

    say(f"Bronmap: {SOURCE}")
    ensure_repo()
    if not args.dry_run:
        ensure_identity()
    files = source_files()

    problems = scan_for_secrets(files)
    if problems:
        fail("mogelijk geheime gegevens in de bronmap, er is niets gekopieerd of gecommit:\n  " + "\n  ".join(problems))

    copy_to_target(files, target, args.dry_run)
    message = args.message or f"Update {datetime.now():%Y-%m-%d %H:%M}"
    commit_and_push(message, push=not args.no_push, dry_run=args.dry_run)
    say("\nKlaar.")


if __name__ == "__main__":
    main()
