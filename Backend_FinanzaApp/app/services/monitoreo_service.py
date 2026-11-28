"""Indicadores de monitoreo con caché para no golpear la BD."""

import time
from datetime import datetime, timezone

from flask_jwt_extended import current_user
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.services import admin_service

TTL_SLI = 60
_CACHE_SLI = {"monotonico": 0.0, "respuesta": None}


def limpiar_cache_monitoreo():
    _CACHE_SLI["monotonico"] = 0.0
    _CACHE_SLI["respuesta"] = None


def obtener_sli(forzar=False):
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede consultar el monitoreo.",
        }, 403

    if not forzar and _CACHE_SLI["respuesta"] is not None:
        if time.monotonic() - _CACHE_SLI["monotonico"] < TTL_SLI:
            payload, status = _CACHE_SLI["respuesta"]
            copia = {
                "ok": payload["ok"],
                "data": {**payload["data"], "cacheado": True},
                "mensaje": payload["mensaje"],
            }
            return copia, status

    sonda, base = _sondear_bd()
    if not sonda["ok"]:
        return {
            "ok": False,
            "data": {"sonda": sonda, "base": base},
            "mensaje": "La base de datos no responde.",
        }, 503

    payload_metricas, status = admin_service.metricas()
    if status != 200:
        return payload_metricas, status

    respuesta = (
        {
            "ok": True,
            "data": {
                "sonda": sonda,
                "base": base,
                "metricas": payload_metricas["data"],
                "cacheado": False,
                "actualizado_en": datetime.now(timezone.utc).isoformat(),
            },
            "mensaje": "Indicadores obtenidos correctamente.",
        },
        200,
    )
    _CACHE_SLI["monotonico"] = time.monotonic()
    _CACHE_SLI["respuesta"] = respuesta
    return respuesta


def _sondear_bd():
    inicio = time.perf_counter()
    try:
        base = db.session.execute(text("SELECT DB_NAME()")).scalar_one()
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "duracion_ms": 0.0}, None
    duracion = round((time.perf_counter() - inicio) * 1000, 2)
    return {"ok": True, "duracion_ms": duracion}, base
