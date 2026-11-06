from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import invitacion_service

invitaciones_bp = Blueprint("invitaciones", __name__)


@invitaciones_bp.post("/carteras/<int:idCartera>/invitaciones")
@jwt_required()
def generar(idCartera):
    payload, status = invitacion_service.generar(idCartera)
    return jsonify(payload), status


@invitaciones_bp.get("/carteras/<int:idCartera>/invitaciones")
@jwt_required()
def consultar(idCartera):
    payload, status = invitacion_service.consultar(idCartera)
    return jsonify(payload), status


@invitaciones_bp.post("/invitaciones/unirse")
@jwt_required()
def unirse():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return (
            jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON"}),
            400,
        )
    payload, status = invitacion_service.unirse(datos.get("codigo"))
    return jsonify(payload), status
