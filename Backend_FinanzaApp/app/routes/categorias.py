from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import categoria_service

categorias_bp = Blueprint("categorias", __name__)


@categorias_bp.post("/carteras/<int:idCartera>/categorias")
@jwt_required()
def crear(idCartera):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return (
            jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON"}),
            400,
        )
    payload, status = categoria_service.crear(idCartera, datos)
    return jsonify(payload), status
