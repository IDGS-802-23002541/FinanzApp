from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Cartera, MiembroCartera, Usuario
from app.services import cartera_detalle_service, cartera_service
from app.utils.respuestas import error
from app.utils.serializers import serializar_cartera

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
    try:
        miembro = db.session.execute(
            db.select(MiembroCartera).where(
                MiembroCartera.carteraId == idCartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).scalar_one_or_none()

        if miembro is None:
            return jsonify({"ok": False, "mensaje": "Cartera no encontrada."}), 404

        data = cartera_detalle_service.listar_periodos(idCartera)
    except SQLAlchemyError:
        return jsonify({"ok": False, "mensaje": "No se pudieron obtener los periodos."}), 503

    return jsonify({
        "ok": True,
        "data": data,
        "mensaje": "Periodos obtenidos correctamente.",
    }), 200


@carteras_bp.get("/<int:idCartera>")
@jwt_required()
def obtener(idCartera):
    try:
        fila = db.session.execute(
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.carteraId == idCartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()

        if not fila:
            return jsonify({"ok": False, "mensaje": "Cartera no encontrada."}), 404

        membresia, cartera = fila

        admin_fila = db.session.execute(
            db.select(Usuario)
            .join(MiembroCartera, MiembroCartera.usuarioId == Usuario.idUsuario)
            .where(
                MiembroCartera.carteraId == idCartera,
                MiembroCartera.rol == "ADMIN",
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()

        admin = admin_fila[0] if admin_fila else None

        try:
            detalle = cartera_detalle_service.resumen_y_series(
                cartera,
                request.args.get("periodoId"),
            )
        except ValueError as exc:
            return jsonify({"ok": False, "mensaje": str(exc)}), 400

        data = serializar_cartera(cartera, membresia.rol, admin)
        data["colaboradores"] = cartera_detalle_service.colaboradores(idCartera)
        data.update(detalle)

        return jsonify({
            "ok": True,
            "data": data,
            "mensaje": "Cartera obtenida correctamente.",
        }), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"ok": False, "mensaje": "No se pudo obtener la cartera."}), 503
