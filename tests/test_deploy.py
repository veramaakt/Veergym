"""Het kopieerscript: beschermt geheimen en data in de app-map."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import deploy  # noqa: E402


def test_protected_paths():
    for rel in [".env", "prod.env", "data/veergym.db", "data/secret_key", "secrets/watch.json", "x.pem", ".git/config",
                "veergym/__pycache__/a.pyc", ".veergym-manifest"]:
        assert deploy.is_protected(rel), rel
    for rel in [".env.example", "veergym/main.py", "web/app/store.js", "README.md"]:
        assert not deploy.is_protected(rel), rel


def test_copy_never_touches_secrets(tmp_path):
    target = tmp_path / "app"
    (target / "data").mkdir(parents=True)
    (target / ".env").write_text("APP_PASSWORD=geheim")
    (target / "data" / "veergym.db").write_text("mijn data")
    (target / "eigen-notitie.txt").write_text("van mij")
    (target / "oud.py").write_text("verouderd")
    (target / deploy.MANIFEST).write_text("oud.py\n")

    files = ["README.md", "veergym/main.py", ".env.example"]
    deploy.copy_to_target(files, target, dry_run=False)

    assert (target / ".env").read_text() == "APP_PASSWORD=geheim"
    assert (target / "data" / "veergym.db").read_text() == "mijn data"
    assert (target / "eigen-notitie.txt").exists()  # niet door het script neergezet: blijft
    assert not (target / "oud.py").exists()  # wel door het script neergezet en verouderd: weg
    assert (target / "veergym" / "main.py").read_bytes() == (deploy.SOURCE / "veergym" / "main.py").read_bytes()


def test_env_created_when_missing(tmp_path):
    target = tmp_path / "app"
    deploy.copy_to_target([".env.example"], target, dry_run=False)
    assert (target / ".env").read_text() == (deploy.SOURCE / ".env.example").read_text()


def test_dry_run_changes_nothing(tmp_path):
    target = tmp_path / "app"
    deploy.copy_to_target(["README.md"], target, dry_run=True)
    assert not target.exists()


def test_secret_scan(tmp_path, monkeypatch):
    monkeypatch.setattr(deploy, "SOURCE", tmp_path)
    (tmp_path / "ok.py").write_text('key = os.getenv("ANTHROPIC_API_KEY")\nAPP_PASSWORD=\n')
    fake = "sk-" + "ant-api03-" + "abcdefghijklmnopqrstuvwxyz"  # opgebouwd, zodat dit bestand zelf schoon blijft
    (tmp_path / "bad.py").write_text("x = 1\nANTHROPIC_API_KEY=" + fake + "\n")
    (tmp_path / ".env").write_text("")
    problems = deploy.scan_for_secrets(["ok.py", "bad.py", ".env"])
    assert any(p.startswith("bad.py, regel 2") for p in problems)
    assert any(p.startswith(".env:") for p in problems)
    assert not any(p.startswith("ok.py") for p in problems)
    assert "sk-ant" not in " ".join(problems)  # nooit de sleutel zelf tonen


def test_source_tree_is_clean():
    files = [str(p.relative_to(deploy.SOURCE)) for p in deploy.SOURCE.rglob("*")
             if p.is_file() and ".git" not in p.parts and "data" not in p.parts and "__pycache__" not in p.parts
             and ".pytest_cache" not in p.parts and p.name != ".DS_Store"]
    assert deploy.scan_for_secrets(files) == []
