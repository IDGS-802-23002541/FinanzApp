from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import comentario_service
from app.utils.respuestas import error

comentarios_bp = Blueprint("comentarios", __name__, url_prefix="/comentarios")


@comentarios_bp.get("")
@jwt_required()
def listar():
    payload, status = comentario_service.listar_comentarios()
    return jsonify(payload), status


@comentarios_bp.post("")
def crear():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = comentario_service.crear_comentario(
        datos.get("nombre"),
        datos.get("correo"),
        datos.get("comentario"),
        _ip_origen(),
    )
    return jsonify(payload), status


def _ip_origen():
    # En Azure el cliente llega detrás del proxy: la IP real viene en la cabecera.
    reenviada = request.headers.get("X-Forwarded-For", "")
    return reenviada.split(",")[0].strip() or request.remote_addr
