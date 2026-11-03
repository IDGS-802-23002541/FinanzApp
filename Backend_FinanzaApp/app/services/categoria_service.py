import re

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.extensions import db
from app.models import Cartera, Categoria, MiembroCartera

TIPOS = {"INGRESO", "GASTO", "AMBOS"}
NOMBRE_VALIDO = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]+")


def crear(id_cartera, datos):
    try:
        fila = db.session.execute(
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503

    if not fila:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    _, cartera = fila

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "No se pueden crear categorías en una cartera inactiva o finalizada.",
        }, 409

    nombre, error = _validar_nombre(datos.get("nombre"))
    if error:
        return {"ok": False, "mensaje": error}, 400

    tipo = datos.get("tipo", "AMBOS")
    if not isinstance(tipo, str):
        return {"ok": False, "mensaje": "El tipo no es válido."}, 400
    tipo = tipo.strip().upper()
    if tipo not in TIPOS:
        return {"ok": False, "mensaje": "El tipo debe ser INGRESO, GASTO o AMBOS."}, 400

    try:
        existe = db.session.execute(
            db.select(Categoria.idCategoria).where(
                Categoria.carteraId == id_cartera,
                Categoria.nombre == nombre,
            )
        ).first()
        if existe:
            return {
                "ok": False,
                "mensaje": "Ya existe una categoría con ese nombre en la cartera.",
            }, 409
        orden = (
            db.session.execute(
                db.select(func.coalesce(func.max(Categoria.orden), 0)).where(
                    Categoria.carteraId == id_cartera
                )
            ).scalar_one()
            + 1
        )
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la categoría."}, 503

    categoria = Categoria(
        carteraId=id_cartera,
        nombre=nombre,
        tipo=tipo,
        orden=orden,
        estado="ACTIVA",
    )
    db.session.add(categoria)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "Ya existe una categoría con ese nombre en la cartera.",
        }, 409
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo crear la categoría."}, 503

    return {
        "ok": True,
        "data": _serializar(categoria),
        "mensaje": "Categoría creada correctamente.",
    }, 201


def _validar_nombre(valor):
    if not isinstance(valor, str):
        return None, "El nombre es obligatorio."
    nombre = " ".join(valor.split())
    if not nombre or len(nombre) > 80:
        return None, "El nombre debe tener entre 1 y 80 caracteres."
    if not NOMBRE_VALIDO.fullmatch(nombre):
        return None, "El nombre solo admite letras, números y espacios."
    return nombre, None


def _serializar(categoria):
    return {
        "idCategoria": categoria.idCategoria,
        "carteraId": categoria.carteraId,
        "nombre": categoria.nombre,
        "tipo": categoria.tipo,
        "orden": categoria.orden,
        "estado": categoria.estado,
    }
