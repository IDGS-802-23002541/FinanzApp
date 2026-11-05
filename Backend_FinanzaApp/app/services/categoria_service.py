import re

from flask_jwt_extended import current_user
from sqlalchemy import and_, func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.extensions import db
from app.models import Cartera, Categoria, MiembroCartera

TIPOS = {"INGRESO", "GASTO", "AMBOS"}
NOMBRE_VALIDO = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]+")


def listar(id_cartera, tipo=None):
    cartera, error = _cartera_del_miembro(id_cartera)
    if error:
        return error

    if tipo not in (None, ""):
        if not isinstance(tipo, str):
            return {"ok": False, "mensaje": "El tipo no es válido."}, 400
        tipo = tipo.strip().upper()
        if tipo not in {"INGRESO", "GASTO"}:
            return {"ok": False, "mensaje": "El tipo debe ser INGRESO o GASTO."}, 400

    filtros = [
        Categoria.estado == "ACTIVA",
        or_(
            Categoria.carteraId == id_cartera,
            and_(
                Categoria.carteraId.is_(None),
                or_(
                    Categoria.tipoCartera.is_(None),
                    Categoria.tipoCartera == cartera.tipo,
                ),
            ),
        ),
    ]
    if tipo:
        filtros.append(Categoria.tipo.in_((tipo, "AMBOS")))

    try:
        filas = db.session.execute(
            db.select(Categoria)
            .where(*filtros)
            .order_by(Categoria.orden, Categoria.nombre)
        ).scalars().all()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudieron obtener las categorías."}, 503

    return {
        "ok": True,
        "data": [_serializar(categoria) for categoria in filas],
        "mensaje": "Categorías obtenidas correctamente.",
    }, 200


def crear(id_cartera, datos):
    cartera, error = _cartera_del_miembro(id_cartera)
    if error:
        return error

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


def _cartera_del_miembro(id_cartera):
    try:
        fila = db.session.execute(
            db.select(Cartera)
            .join(MiembroCartera, MiembroCartera.carteraId == Cartera.idCartera)
            .where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).scalar_one_or_none()
    except SQLAlchemyError:
        return None, (
            {"ok": False, "mensaje": "No se pudo validar la cartera."},
            503,
        )

    if fila is None:
        return None, ({"ok": False, "mensaje": "Cartera no encontrada."}, 404)
    return fila, None


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
