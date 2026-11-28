"""Indicadores de monitoreo: sonda de BD, historial y muestreo periódico."""

import logging
import threading
import time
from datetime import datetime, timedelta, timezone

from flask_jwt_extended import current_user
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.extensions import db
from app.models import MonitoreoSonda
from app.services import admin_service

TTL_SLI = 60
DIAS_RETENCION = 7
_CACHE_SLI = {"monotonico": 0.0, "respuesta": None}
log = logging.getLogger("finanzapp.monitoreo")


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
            "data": {"sonda": sonda, "base": base, "historial": historial()},
            "mensaje": "La base de datos no responde.",
        }, 503

    payload_metricas, status = admin_service.metricas()
    if status != 200:
        return payload_metricas, status

    registrar_sonda(sonda, base)

    respuesta = (
        {
            "ok": True,
            "data": {
                "sonda": sonda,
                "base": base,
                "metricas": payload_metricas["data"],
                "historial": historial(),
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


def historial(minutos=60):
    desde = _ahora() - timedelta(minutes=minutos)
    try:
        filas = (
            db.session.execute(
                db.select(MonitoreoSonda)
                .where(MonitoreoSonda.minuto >= desde)
                .order_by(MonitoreoSonda.minuto)
            )
            .scalars()
            .all()
        )
    except SQLAlchemyError:
        # La tabla aún no existe (migración pendiente): sin historial.
        db.session.rollback()
        return []
    return [_serializar(fila) for fila in filas]


def registrar_sonda(sonda, base):
    minuto = _ahora().replace(second=0, microsecond=0)
    db.session.add(
        MonitoreoSonda(
            minuto=minuto,
            fechaHora=_ahora(),
            ok=sonda["ok"],
            duracionMs=sonda["duracion_ms"],
            base=base,
        )
    )
    try:
        db.session.commit()
    except IntegrityError:
        # Otro worker ya guardó la muestra de este minuto.
        db.session.rollback()
    except SQLAlchemyError:
        db.session.rollback()
        log.warning("No se pudo guardar la muestra de monitoreo")


def iniciar_muestreo(app, intervalo=60):
    def bucle():
        # Un thread por worker; el índice único por minuto evita duplicados.
        while True:
            with app.app_context():
                try:
                    sonda, base = _sondear_bd()
                    registrar_sonda(sonda, base)
                    _purgar_antiguos()
                except SQLAlchemyError:
                    log.warning("Muestreo de monitoreo falló")
            time.sleep(intervalo)

    threading.Thread(target=bucle, name="monitoreo-sonda", daemon=True).start()


def _purgar_antiguos():
    limite = _ahora() - timedelta(days=DIAS_RETENCION)
    db.session.execute(db.delete(MonitoreoSonda).where(MonitoreoSonda.minuto < limite))
    db.session.commit()


def _sondear_bd():
    inicio = time.perf_counter()
    try:
        base = db.session.execute(text("SELECT DB_NAME()")).scalar_one()
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db.session.rollback()
        duracion = round((time.perf_counter() - inicio) * 1000, 2)
        return {"ok": False, "duracion_ms": duracion}, None
    duracion = round((time.perf_counter() - inicio) * 1000, 2)
    return {"ok": True, "duracion_ms": duracion}, base


def _serializar(fila):
    return {
        "minuto": fila.minuto.isoformat(),
        "ok": bool(fila.ok),
        "duracion_ms": fila.duracionMs,
        "base": fila.base,
    }


def _ahora():
    return datetime.now(timezone.utc).replace(tzinfo=None)
