from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import admin_service
from app.utils.respuestas import error

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.get("/metricas")
@jwt_required()
def metricas():
    payload, status = admin_service.metricas(forzar=request.args.get("forzar") == "1")
    return jsonify(payload), status


@admin_bp.get("/trabajadores")
@jwt_required()
def listar_trabajadores():
    payload, status = admin_service.listar_trabajadores(
        pagina=request.args.get("pagina", "1"),
        por_pagina=request.args.get("porPagina", "20"),
    )
    return jsonify(payload), status


@admin_bp.post("/trabajadores")
@jwt_required()
def crear_trabajador():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = admin_service.crear_trabajador(datos)
    return jsonify(payload), status


@admin_bp.put("/trabajadores/<int:idTrabajador>")
@jwt_required()
def editar_trabajador(idTrabajador):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("El cuerpo debe ser un objeto JSON.")
    payload, status = admin_service.editar_trabajador(idTrabajador, datos)
    return jsonify(payload), status


@admin_bp.delete("/trabajadores/<int:idTrabajador>")
@jwt_required()
def eliminar_trabajador(idTrabajador):
    payload, status = admin_service.eliminar_trabajador(idTrabajador)
    return jsonify(payload), status
