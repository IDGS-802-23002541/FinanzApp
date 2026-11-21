from flask import Blueprint, jsonify

from flask_jwt_extended import jwt_required

from app.services import miembro_service

miembros_bp = Blueprint("miembros", __name__)


@miembros_bp.delete("/carteras/<int:idCartera>/miembros/<int:idUsuario>")
@jwt_required()
def eliminar(idCartera, idUsuario):
    payload, status = miembro_service.eliminar(idCartera, idUsuario)
    return jsonify(payload), status


@miembros_bp.post("/carteras/<int:idCartera>/salir")
@jwt_required()
def salir(idCartera):
    payload, status = miembro_service.salir(idCartera)
    return jsonify(payload), status
