"""Calcula los SLI del SLA a partir del monitor y del log de accesos."""

import argparse
import csv
import glob
import json
import re
from pathlib import Path

RUTA_CONSULTA = re.compile(r"^/carteras(/\d+)?$")
RUTA_ALTA = re.compile(r"^/carteras/\d+/transacciones$")
RUTA_TRANSACCION = re.compile(r"^(/carteras/\d+/transacciones|/transacciones/\d+)$")


def cargar(patrones):
    registros = []
    for patron in patrones:
        for nombre in glob.glob(patron, recursive=True):
            with open(nombre, encoding="utf-8") as archivo:
                for linea in archivo:
                    linea = linea.strip()
                    if linea:
                        registros.append(json.loads(linea))
    return registros


def p95(valores):
    if not valores:
        return 0.0
    ordenados = sorted(valores)
    indice = int(round(0.95 * (len(ordenados) - 1)))
    return round(ordenados[indice], 2)


def calcular_disponibilidad(pruebas):
    if not pruebas:
        return None

    total = len(pruebas)
    fallos_confirmados = 0
    consecutivos = 0

    # Regla del SLA: la falla existe desde la primera de 3 pruebas fallidas
    # consecutivas (1 por minuto) hasta la primera prueba exitosa.
    for prueba in pruebas:
        if prueba.get("ok"):
            consecutivos = 0
            continue
        consecutivos += 1
        if consecutivos == 3:
            fallos_confirmados += 3
        elif consecutivos > 3:
            fallos_confirmados += 1

    disponibles = total - fallos_confirmados
    return {
        "pruebas": total,
        "exitosas": sum(1 for p in pruebas if p.get("ok")),
        "fallos_confirmados": fallos_confirmados,
        "disponibilidad": round(disponibles / total * 100, 2),
        "p95_ms": p95([p.get("duracion_ms", 0) for p in pruebas]),
    }


def porcentaje_menor(valores, limite):
    if not valores:
        return None
    return round(sum(1 for valor in valores if valor < limite) / len(valores) * 100, 2)


def calcular_accesos(eventos):
    consultas = [
        e for e in eventos
        if e.get("metodo") == "GET"
        and RUTA_CONSULTA.match(e.get("ruta", ""))
        and e.get("status", 0) < 500
    ]
    altas = [
        e for e in eventos
        if e.get("metodo") == "POST"
        and RUTA_ALTA.match(e.get("ruta", ""))
        and e.get("status", 0) < 500
    ]
    transacciones = [e for e in eventos if RUTA_TRANSACCION.match(e.get("ruta", ""))]
    carteras = [e for e in eventos if e.get("ruta", "").startswith("/carteras")]

    n5_transacciones = sum(1 for e in transacciones if e.get("es_5xx"))
    n5_carteras = sum(1 for e in carteras if e.get("es_5xx"))

    return {
        "sli04": porcentaje_menor([e.get("duracion_ms", 0) for e in altas], 1500),
        "sli05": round(n5_transacciones / len(transacciones) * 100, 2) if transacciones else None,
        "sli06": porcentaje_menor([e.get("duracion_ms", 0) for e in consultas], 2000),
        "sli08": round((len(carteras) - n5_carteras) / len(carteras) * 100, 2) if carteras else None,
    }


def escribir_csv(ruta, filas):
    salida = Path(ruta)
    salida.parent.mkdir(parents=True, exist_ok=True)
    with salida.open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(["SLI", "Descripcion", "Valor", "Meta", "Cumple", "Fuente"])
        escritor.writerows(filas)


def main():
    parser = argparse.ArgumentParser(description="Calculo mensual de SLI.")
    parser.add_argument("--monitoreo", nargs="+", default=["metricas/*.jsonl"])
    parser.add_argument("--accesos", nargs="*", default=[])
    parser.add_argument("--csv", default="reportes/sli.csv")
    args = parser.parse_args()

    filas = []

    disponibilidad = calcular_disponibilidad(cargar(args.monitoreo) if args.monitoreo else [])
    if disponibilidad:
        filas.append([
            "SLI-02",
            "Disponibilidad del portal",
            disponibilidad["disponibilidad"],
            99,
            "Si" if disponibilidad["disponibilidad"] >= 99 else "No",
            f"monitor ({disponibilidad['pruebas']} pruebas, p95 {disponibilidad['p95_ms']} ms)",
        ])

    if args.accesos:
        accesos = calcular_accesos(cargar(args.accesos))
        if accesos["sli04"] is not None:
            filas.append(["SLI-04", "Alta de transacciones < 1500 ms", accesos["sli04"], 95,
                          "Si" if accesos["sli04"] >= 95 else "No", "log de accesos"])
        if accesos["sli05"] is not None:
            filas.append(["SLI-05", "Errores 5xx en transacciones", accesos["sli05"], 0.2,
                          "Si" if accesos["sli05"] <= 0.2 else "No", "log de accesos"])
        if accesos["sli06"] is not None:
            filas.append(["SLI-06", "Consulta de carteras < 2000 ms", accesos["sli06"], 95,
                          "Si" if accesos["sli06"] >= 95 else "No", "log de accesos"])
        if accesos["sli08"] is not None:
            filas.append(["SLI-08", "Exito en gestion de carteras", accesos["sli08"], 99,
                          "Si" if accesos["sli08"] >= 99 else "No", "log de accesos"])

    escribir_csv(args.csv, filas)

    if not filas:
        print("Sin datos: revisa que existan los JSONL de entrada.")
        return

    for fila in filas:
        print(fila)
    print(f"CSV escrito en {args.csv}")


if __name__ == "__main__":
    main()
