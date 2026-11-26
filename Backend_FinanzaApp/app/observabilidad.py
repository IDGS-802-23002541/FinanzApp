"""Logs de acceso en JSON para medir los SLI del SLA."""

import json
import logging
import os
import sys
import time
import uuid
from datetime import datetime, timezone

from flask import g, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

log = logging.getLogger("finanzapp.acceso")
log.setLevel(logging.INFO)
log.propagate = False


def _configurar_handlers():
    # Evita duplicar handlers cuando Flask recarga o se crea otra app.
    if log.handlers:
        return

    # stdout para que Azure lo capture en el Log Stream sin costo de ingesta.
    manejador = logging.StreamHandler(sys.stdout)
    manejador.setFormatter(logging.Formatter("%(message)s"))
    log.addHandler(manejador)

    # Opcional para pruebas locales; en contenedor no se usa.
    archivo = os.getenv("LOG_ARCHIVO")
    if archivo:
        manejador_archivo = logging.FileHandler(archivo, encoding="utf-8")
        manejador_archivo.setFormatter(logging.Formatter("%(message)s"))
        log.addHandler(manejador_archivo)


def configurar_logs(app):
    _configurar_handlers()

    if not app.config.get("LOG_ACCESO_ACTIVO", True):
        return

    @app.before_request
    def iniciar_peticion():
        g.request_id = uuid.uuid4().hex[:12]
        g.inicio = time.perf_counter()
        g.usuario_id = None
        # optional=True para no exigir token; solo lee la identidad si viene.
        try:
            verify_jwt_in_request(optional=True)
            g.usuario_id = get_jwt_identity()
        except Exception:
            # Token invalido o expirado: el endpoint protegido responde su 401.
            g.usuario_id = None

    @app.after_request
    def registrar_peticion(respuesta):
        inicio = g.get("inicio")
        duracion = 0.0
        if inicio is not None:
            duracion = round((time.perf_counter() - inicio) * 1000, 2)

        evento = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "request_id": g.get("request_id"),
            "metodo": request.method,
            "ruta": request.path,
            "status": respuesta.status_code,
            "duracion_ms": duracion,
            "es_5xx": respuesta.status_code >= 500,
            "usuario_id": g.get("usuario_id"),
        }
        log.info(json.dumps(evento, ensure_ascii=False))
        return respuesta
