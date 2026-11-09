from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import cartera_service
from app.utils.respuestas import error

carteras_bp = Blueprint("carteras", __name__, url_prefix="/carteras")


@carteras_bp.post("")
@jwt_required()
def crear():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON")
    payload, status = cartera_service.crear(datos)
    return jsonify(payload), status


@carteras_bp.get("")
@jwt_required()
def listar():
    payload, status = cartera_service.listar(
        estado=request.args.get("estado"),
        tipo=request.args.get("tipo"),
        rol=request.args.get("rol"),
        busqueda=request.args.get("busqueda"),
    )
    return jsonify(payload), status


@carteras_bp.get("/<int:idCartera>/periodos")
@jwt_required()
def listar_periodos(idCartera):
    payload, status = cartera_service.periodos(idCartera)
    return jsonify(payload), status


@carteras_bp.get("/<int:idCartera>")
@jwt_required()
def obtener(idCartera):
    payload, status = cartera_service.detalle(idCartera, request.args.get("periodoId"))
    return jsonify(payload), status
