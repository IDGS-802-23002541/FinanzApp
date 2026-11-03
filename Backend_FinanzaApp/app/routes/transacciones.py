from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import transaccion_service

transacciones_bp = Blueprint("transacciones", __name__)


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
