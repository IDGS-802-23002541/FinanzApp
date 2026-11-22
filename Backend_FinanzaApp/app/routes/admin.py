from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import admin_service
from app.utils.respuestas import error

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.get("/metricas")
@jwt_required()
def metricas():
    payload, status = admin_service.metricas()
    return jsonify(payload), status


@admin_bp.get("/trabajadores")
@jwt_required()
def listar_trabajadores():
    payload, status = admin_service.listar_trabajadores()
    return jsonify(payload), status


@admin_bp.post("/trabajadores")
@jwt_required()
def crear_trabajador():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = admin_service.crear_trabajador(datos)
    return jsonify(payload), status
