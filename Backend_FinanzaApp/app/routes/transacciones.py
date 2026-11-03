from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import transaccion_service

transacciones_bp = Blueprint("transacciones", __name__)


@transacciones_bp.get("/carteras/<int:idCartera>/transacciones")
@jwt_required()
def listar(idCartera):
    payload, status = transaccion_service.listar(
        idCartera,
        pagina=request.args.get("pagina", "1"),
        por_pagina=request.args.get("porPagina", "20"),
        periodo_id=request.args.get("periodoId"),
    )
    return jsonify(payload), status


@transacciones_bp.post("/carteras/<int:idCartera>/transacciones")
@jwt_required()
def crear(idCartera):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return (
            jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON"}),
            400,
        )
    payload, status = transaccion_service.crear(idCartera, datos)
    return jsonify(payload), status


@transacciones_bp.put("/transacciones/<int:idTransaccion>")
@jwt_required()
def actualizar(idTransaccion):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return (
            jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON"}),
            400,
        )
    payload, status = transaccion_service.actualizar(idTransaccion, datos)
    return jsonify(payload), status


@transacciones_bp.delete("/transacciones/<int:idTransaccion>")
@jwt_required()
def eliminar(idTransaccion):
    payload, status = transaccion_service.eliminar(idTransaccion)
    return jsonify(payload), status
