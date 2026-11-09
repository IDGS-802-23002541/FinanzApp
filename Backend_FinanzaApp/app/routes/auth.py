from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import auth_service
from app.utils.respuestas import error

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


def _cuerpo():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return None
    return datos


@auth_bp.post("/registro")
def registro():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.registrar(datos)
    return jsonify(payload), status


@auth_bp.post("/login")
def login():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.login(
        datos.get("correo"),
        datos.get("contrasenia"),
        request.remote_addr,
        request.headers.get("User-Agent"),
    )
    return jsonify(payload), status


@auth_bp.post("/recuperar")
def recuperar():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.solicitar_recuperacion(datos.get("correo"))
    return jsonify(payload), status


@auth_bp.post("/restablecer")
def restablecer():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.restablecer(
        datos.get("correo"),
        datos.get("codigo"),
        datos.get("contrasenia"),
    )
    return jsonify(payload), status


@auth_bp.post("/cambiar")
@jwt_required()
def cambiar_contrasenia():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.cambiar_contrasenia(
        datos.get("actual"), datos.get("nueva")
    )
    return jsonify(payload), status


@auth_bp.post("/desactivar")
@jwt_required()
def desactivar_cuenta():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.desactivar(datos.get("contrasenia"))
    return jsonify(payload), status


@auth_bp.delete("/cuenta")
@jwt_required()
def eliminar_cuenta():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.eliminar(datos.get("contrasenia"))
    return jsonify(payload), status


@auth_bp.post("/refresh")
def refresh():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.refresh(datos.get("refresh_token"))
    return jsonify(payload), status


@auth_bp.post("/logout")
@jwt_required()
def logout():
    payload, status = auth_service.logout()
    return jsonify(payload), status


@auth_bp.get("/preferencias")
@jwt_required()
def obtener_preferencias():
    payload, status = auth_service.obtener_preferencia()
    return jsonify(payload), status


@auth_bp.put("/preferencias")
@jwt_required()
def guardar_preferencias():
    datos = _cuerpo()
    if datos is None:
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = auth_service.guardar_preferencia(datos.get("tema"))
    return jsonify(payload), status
