#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
importar_taiga.py — Crea en Taiga las historias de `historias_taiga.csv`.

Taiga clásico no trae importación nativa de historias por CSV, así que este
script usa su API REST y solo la biblioteca estándar de Python 3.8+.

Uso típico:
    python3 importar_taiga.py --url https://taiga.mi-servidor.mx \
        --slug finanzapp --user mi_usuario --password mi_contrasena

Opciones:
    --csv ARCHIVO   CSV de entrada (por defecto: historias_taiga.csv)
    --dry-run       Muestra lo que haría, sin crear nada
    --insecure      No verifica el certificado TLS (servidores self-hosted)

Notas:
* "Assigned to" se busca entre los miembros del proyecto por usuario, correo o
  nombre completo (parcial). Sin coincidencia, la historia se crea sin asignar.
* "Status" se busca por nombre ("New"); si no existe, se usa el estado por defecto.
* "Points" se mapea a la escala del proyecto eligiendo un rol computable; si el
  proyecto no tiene roles computables, se omite (se ajustan luego en la interfaz).
* El script es re-ejecutable: omite historias cuyo Subject ya exista.
"""
import argparse
import csv
import json
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "/api/v1"


def api(base, token, metodo, ruta, payload=None, contexto=None):
    url = base.rstrip("/") + API + ruta
    datos = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=datos, method=metodo)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, context=contexto) as resp:
            cuerpo = resp.read().decode("utf-8")
            return json.loads(cuerpo) if cuerpo else None
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", errors="replace")[:600]
        raise SystemExit(f"Error HTTP {e.code} en {metodo} {ruta}:\n{detalle}")
    except urllib.error.URLError as e:
        raise SystemExit(f"No se pudo conectar con {url}: {e.reason}")


def autenticar(base, contexto, usuario, contrasena):
    respuesta = api(base, None, "POST", "/auth", {
        "type": "normal", "username": usuario, "password": contrasena,
    }, contexto)
    token = (respuesta or {}).get("auth_token")
    if not token:
        raise SystemExit("La autenticación no devolvió token; revisa usuario y contraseña.")
    return token


def buscar_usuario(usuarios, texto):
    if not texto:
        return None
    t = texto.strip().casefold()
    for u in usuarios:
        if (u.get("username") or "").casefold() == t or (u.get("email") or "").casefold() == t:
            return u
    for u in usuarios:
        nombre = (u.get("full_name_display") or "").casefold()
        if nombre == t or t in nombre.split():
            return u
    for u in usuarios:
        if t in (u.get("full_name_display") or "").casefold():
            return u
    return None


def historias_existentes(base, token, pid, contexto):
    sujetos, pagina = set(), 1
    while pagina <= 100:
        lote = api(base, token, "GET", f"/userstories?project={pid}&page={pagina}", None, contexto) or []
        if not lote:
            break
        for us in lote:
            sujetos.add((us.get("subject") or "").strip().casefold())
        pagina += 1
    return sujetos


def main():
    parser = argparse.ArgumentParser(description="Importa historias_taiga.csv a un proyecto Taiga.")
    parser.add_argument("--url", required=True, help="URL base de Taiga, p. ej. https://taiga.mi-servidor.mx")
    parser.add_argument("--slug", required=True, help="Slug del proyecto (Projects > nombre > Settings)")
    parser.add_argument("--user", required=True, help="Usuario o correo")
    parser.add_argument("--password", required=True, help="Contraseña")
    parser.add_argument("--csv", default="historias_taiga.csv", help="CSV de entrada")
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra lo que haría")
    parser.add_argument("--insecure", action="store_true", help="No verificar TLS (self-hosted)")
    args = parser.parse_args()

    contexto = ssl._create_unverified_context() if args.insecure else None

    print(f"Autenticando en {args.url} ...")
    token = autenticar(args.url, contexto, args.user, args.password)

    proyecto = api(args.url, token, "GET",
                   "/projects/by_slug?" + urllib.parse.urlencode({"slug": args.slug}), None, contexto)
    if not proyecto:
        raise SystemExit(f"No se encontró el proyecto con slug '{args.slug}'.")
    pid = proyecto["id"]
    print(f"Proyecto: {proyecto.get('name')} (id {pid})")

    estados = api(args.url, token, "GET", f"/userstory-statuses?project={pid}", None, contexto) or []
    estado_nuevo = next((e["id"] for e in estados if (e.get("name") or "").casefold() == "new"), None)
    if estado_nuevo is None and estados:
        estado_nuevo = estados[0]["id"]
    if estado_nuevo is None:
        print("Aviso: sin estados de historia disponibles; se usará el estado por defecto.")

    usuarios = api(args.url, token, "GET", f"/users?project={pid}", None, contexto) or []
    puntos = {str(p.get("value")): p["id"] for p in (proyecto.get("points") or [])}
    roles_computables = [r["id"] for r in (proyecto.get("roles") or []) if r.get("computable")]
    if not roles_computables:
        print("Aviso: el proyecto no tiene roles computables; los puntos se ajustan en la interfaz.")

    existentes = historias_existentes(args.url, token, pid, contexto)

    with open(args.csv, newline="", encoding="utf-8-sig") as f:
        filas = list(csv.DictReader(f))

    creadas = omitidas = sin_asignar = 0
    for fila in filas:
        asunto = (fila.get("Subject") or "").strip()
        if not asunto:
            continue
        if asunto.casefold() in existentes:
            omitidas += 1
            print(f"  = ya existe: {asunto}")
            continue

        payload = {
            "project": pid,
            "subject": asunto,
            "description": fila.get("Description") or "",
            "tags": [t.strip() for t in (fila.get("Tags") or "").split(",") if t.strip()],
        }
        if estado_nuevo:
            payload["status"] = estado_nuevo

        asignado = buscar_usuario(usuarios, fila.get("Assigned to") or "")
        if asignado:
            payload["assigned_to"] = asignado["id"]
        else:
            sin_asignar += 1

        valor = (fila.get("Points") or "").strip()
        if valor and roles_computables and valor in puntos:
            payload["points"] = {str(rol): puntos[valor] for rol in roles_computables}

        if args.dry_run:
            print(f"  + [dry-run] {asunto} ({valor} pts, asignada a: {asignado.get('username') if asignado else '—'})")
        else:
            creada = api(args.url, token, "POST", "/userstories", payload, contexto)
            print(f"  + creada #{creada.get('ref')}: {asunto}")
        creadas += 1

    print(f"\nResumen: {creadas} creadas, {omitidas} omitidas (ya existían), "
          f"{sin_asignar} sin asignar de {len(filas)} filas.")
    if args.dry_run:
        print("Modo dry-run: no se creó nada.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nCancelado.")
