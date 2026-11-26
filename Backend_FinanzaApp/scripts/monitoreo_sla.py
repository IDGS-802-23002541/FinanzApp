"""Pinguea el portal y guarda cada prueba en JSONL para calcular los SLI."""

import argparse
import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL_POR_DEFECTO = "https://finanzapp.vellumdigitall.online/"


def medir(url, timeout):
    inicio = time.perf_counter()
    estado = None
    error = None

    try:
        with urllib.request.urlopen(url, timeout=timeout) as respuesta:
            estado = respuesta.status
    except urllib.error.HTTPError as exc:
        estado = exc.code
    except Exception as exc:
        # Fallo de red: se registra el tipo, nunca el detalle con datos.
        error = type(exc).__name__

    duracion = round((time.perf_counter() - inicio) * 1000, 2)
    return {
        "ts": datetime.now(timezone.utc).isoformat(),
        "url": url,
        "status": estado,
        "ok": estado is not None and 200 <= estado < 400,
        "duracion_ms": duracion,
        "error": error,
    }


def main():
    parser = argparse.ArgumentParser(description="Monitor de disponibilidad para el SLA.")
    parser.add_argument("--url", default=URL_POR_DEFECTO)
    parser.add_argument("--repeticiones", type=int, default=1)
    parser.add_argument("--intervalo", type=float, default=60)
    parser.add_argument("--timeout", type=float, default=10)
    parser.add_argument("--salida", default="metricas/monitoreo.jsonl")
    args = parser.parse_args()

    salida = Path(args.salida)
    salida.parent.mkdir(parents=True, exist_ok=True)

    for indice in range(args.repeticiones):
        registro = medir(args.url, args.timeout)
        with salida.open("a", encoding="utf-8") as archivo:
            archivo.write(json.dumps(registro, ensure_ascii=False) + "\n")
        print(json.dumps(registro, ensure_ascii=False), flush=True)

        if indice < args.repeticiones - 1:
            time.sleep(args.intervalo)


if __name__ == "__main__":
    main()
