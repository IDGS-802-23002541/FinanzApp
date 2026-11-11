from flask import Blueprint, Response, jsonify, request
from flask_jwt_extended import jwt_required

from app.services import reporte_service

reportes_bp = Blueprint("reportes", __name__, url_prefix="/reportes")


@reportes_bp.get("")
@jwt_required()
def vista_previa():
    payload, status = reporte_service.vista_previa(**_parametros())
    return jsonify(payload), status


@reportes_bp.get("/exportar")
@jwt_required()
def exportar():
    payload, status = reporte_service.exportar(
        formato=request.args.get("formato"), **_parametros()
    )
    if not payload["ok"]:
        return jsonify(payload), status

    datos = payload["data"]
    return Response(
        datos["contenido"].encode("utf-8-sig"),
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{datos["nombreArchivo"]}"'
            )
        },
    )


def _parametros():
    return {
        "cartera_id": request.args.get("carteraId"),
        "tipo": request.args.get("tipo"),
        "periodo_id": request.args.get("periodoId"),
        "fecha_inicio": request.args.get("fechaInicio"),
        "fecha_fin": request.args.get("fechaFin"),
        "cantidad": request.args.get("cantidad"),
    }
