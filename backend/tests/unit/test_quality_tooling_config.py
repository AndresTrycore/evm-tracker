import tomllib
from pathlib import Path


def test_backend_pyproject_contains_ruff_and_mypy_config() -> None:
    pyproject_path = Path(__file__).resolve().parents[2] / "pyproject.toml"
    config = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))

    assert config["tool"]["ruff"]["line-length"] == 88
    assert config["tool"]["mypy"]["python_version"] == "3.13"


def test_backend_uses_a_single_quality_tooling_config_file() -> None:
    backend_root = Path(__file__).resolve().parents[2]

    assert (backend_root / "pyproject.toml").exists()
    assert not (backend_root / "ruff.toml").exists()
    assert not (backend_root / "mypy.ini").exists()


def test_backend_dockerfile_installs_tooling_from_pyproject() -> None:
    backend_root = Path(__file__).resolve().parents[2]
    dockerfile_text = (backend_root / "Dockerfile").read_text(encoding="utf-8")

    assert "pyproject.toml" in dockerfile_text
    assert "COPY app ./app" in dockerfile_text
    assert "app.main:app" in dockerfile_text
    assert "ruff" in dockerfile_text
    assert "mypy" in dockerfile_text


def test_readme_documents_backend_quality_commands() -> None:
    readme_text = (
        Path(__file__).resolve().parents[3] / "README.md"
    ).read_text(encoding="utf-8")

    assert "ruff check app tests" in readme_text
    assert "mypy app" in readme_text