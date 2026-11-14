from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import pago_service
from app.utils.respuestas import error

pagos_bp = Blueprint("pagos", __name__, url_prefix="/pagos-recurrentes")


@pagos_bp.post("")
@jwt_required()
def crear():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = pago_service.crear(datos)
    return jsonify(payload), status


@pagos_bp.get("")
@jwt_required()
def listar():
    payload, status = pago_service.listar(
        cartera_id=request.args.get("carteraId"),
        estado=request.args.get("estado"),
        pagina=request.args.get("pagina", "1"),
        por_pagina=request.args.get("porPagina", "20"),
    )
    return jsonify(payload), status


@pagos_bp.put("/<int:idPago>")
@jwt_required()
def editar(idPago):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = pago_service.editar(idPago, datos)
    return jsonify(payload), status


@pagos_bp.delete("/<int:idPago>")
@jwt_required()
def cancelar(idPago):
    payload, status = pago_service.eliminar(idPago)
    return jsonify(payload), status


@pagos_bp.post("/<int:idPago>/hecho")
@jwt_required()
def marcar_hecho(idPago):
    datos = request.get_json(silent=True) or {}
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = pago_service.marcar_hecho(idPago, datos)
    return jsonify(payload), status
