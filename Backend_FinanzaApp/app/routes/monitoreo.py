from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import monitoreo_service

monitoreo_bp = Blueprint("monitoreo", __name__, url_prefix="/monitoreo")


@monitoreo_bp.get("/sli")
@jwt_required()
def consultar_sli():
    payload, status = monitoreo_service.obtener_sli(
        forzar=request.args.get("forzar") == "1"
    )
    return jsonify(payload), status


@monitoreo_bp.post("/sli/actualizar")
@jwt_required()
def actualizar_sli():
    payload, status = monitoreo_service.obtener_sli(forzar=True)
    return jsonify(payload), status
