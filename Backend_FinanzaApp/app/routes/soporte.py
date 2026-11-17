from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import soporte_service
from app.utils.respuestas import error

soporte_bp = Blueprint("soporte", __name__, url_prefix="/soporte")


@soporte_bp.post("/tickets")
@jwt_required()
def crear_ticket():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = soporte_service.crear_ticket(datos)
    return jsonify(payload), status


@soporte_bp.get("/tickets")
@jwt_required()
def listar_tickets():
    payload, status = soporte_service.listar_tickets(
        estado=request.args.get("estado"),
        pagina=request.args.get("pagina", "1"),
        por_pagina=request.args.get("porPagina", "20"),
    )
    return jsonify(payload), status


@soporte_bp.post("/tickets/<int:idTicket>/respuestas")
@jwt_required()
def crear_respuesta(idTicket):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = soporte_service.crear_respuesta(idTicket, datos)
    return jsonify(payload), status


@soporte_bp.post("/tickets/<int:idTicket>/asignar")
@jwt_required()
def asignar_ticket(idTicket):
    datos = request.get_json(silent=True) or {}
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = soporte_service.asignar_ticket(idTicket, datos)
    return jsonify(payload), status


@soporte_bp.post("/tickets/<int:idTicket>/cerrar")
@jwt_required()
def cerrar_ticket(idTicket):
    datos = request.get_json(silent=True) or {}
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = soporte_service.cerrar_ticket(idTicket, datos)
    return jsonify(payload), status
