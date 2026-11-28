#!/usr/bin/env python3
"""Ejecuta las pruebas de backend y web desde la raíz del repositorio."""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
BACKEND = RAIZ / "Backend_FinanzaApp"
WEB = RAIZ / "web_FinanzaApp"


def python_del_backend():
    venv = BACKEND / ".venv" / "bin" / "python"
    return str(venv) if venv.exists() else sys.executable


def ejecutar_backend():
    print("\n=== Pruebas de backend (pytest) ===")
    return subprocess.call([python_del_backend(), "-m", "pytest", "-q"], cwd=BACKEND)


def ejecutar_web():
    print("\n=== Pruebas de web (vitest) ===")
    if shutil.which("npm") is None:
        print("npm no está instalado; no se pueden correr las pruebas de web.")
        return 1
    return subprocess.call(["npm", "run", "test"], cwd=WEB)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "objetivo",
        nargs="?",
        choices=["backend", "web", "todas"],
        default="todas",
        help="qué pruebas ejecutar (por defecto todas)",
    )
    args = parser.parse_args()

    ejecuciones = {
        "backend": [ejecutar_backend],
        "web": [ejecutar_web],
        "todas": [ejecutar_backend, ejecutar_web],
    }[args.objetivo]

    resultados = [ejecutar() for ejecutar in ejecuciones]
    return 0 if all(codigo == 0 for codigo in resultados) else 1


if __name__ == "__main__":
    sys.exit(main())
