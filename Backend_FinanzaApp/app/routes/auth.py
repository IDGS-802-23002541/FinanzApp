import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone


from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, jwt_required
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models import SesionUsuario, TokenRecuperacion, Usuario

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

MENSAJE_CREDENCIALES = "Credenciales incorrectas."
MENSAJE_RECUPERACION = "Si el correo esta registrado, recibiras un codigo de recuperacion"

def _ahora_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).digest()


def _generar_codigo():
    # entero entre 0 y 999999
    numero = secrets.randbelow(1_000_000)
    # agrega ceros a la izquierda (hasta 6 digitos)
    return f"{numero:06d}"


def _hash_codigo(codigo):
    clave = current_app.config["SECRET_KEY"].encode("utf-8")
    mensaje = codigo.encode("utf-8")
    # hmac.new crea una mac 
    # digest devuelve los 32 bytes 
    return hmac.new(clave, mensaje, hashlib.sha256).digest()


def _serializar_usuario(usuario):
    return {
        "idUsuario": usuario.idUsuario,
        "nombreUsuario": usuario.nombreUsuario,
        "apaterno": usuario.apaterno,
        "amaterno": usuario.amaterno,
        "correo": usuario.correo,
        "rolGlobal": usuario.rolGlobal,
        "estado": usuario.estado,
        "fechaRegistro": usuario.fechaRegistro,
    }


def _crear_sesion(usuario_id):
    token_refresh = secrets.token_urlsafe(48)
    sesion = SesionUsuario(
        usuarioId=usuario_id,
        hashRefreshToken=_hash_token(token_refresh),
        fechaExpiracion=_ahora_utc()
        + timedelta(days=current_app.config["REFRESH_TOKEN_DIAS"]),
        ip=(request.remote_addr or "")[:45] or None,
        userAgent=(request.headers.get("User-Agent") or "")[:500] or None,
    )
    db.session.add(sesion)
    db.session.commit()
    return sesion, token_refresh


def _crear_access_token(usuario, sesion_id):
    return create_access_token(
        identity=str(usuario.idUsuario),
        additional_claims={"rol": usuario.rolGlobal, "sid": sesion_id},
    )


def _respuesta_sesion(usuario, sesion, token_refresh):
    access_token = _crear_access_token(usuario, sesion.idSesion)
    expira_en = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    return jsonify(
        {
            "ok": True,
            "data": {
                "access_token": access_token,
                "refresh_token": token_refresh,
                "token_type": "Bearer",
                "expires_in": int(expira_en.total_seconds()),
                "usuario": _serializar_usuario(usuario),
            },
            "mensaje": "Sesión iniciada correctamente.",
        }
    )


@auth_bp.post("/registro")
def registro():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON."}), 400

    nombre = (datos.get("nombreUsuario") or "").strip()
    apaterno = (datos.get("apaterno") or "").strip()
    amaterno = (datos.get("amaterno") or "").strip() or None
    correo = (datos.get("correo") or "").strip().lower()
    contrasenia = datos.get("contrasenia") or ""

    faltantes = [
        campo
        for campo, valor in (
            ("nombreUsuario", nombre),
            ("apaterno", apaterno),
            ("correo", correo),
            ("contrasenia", contrasenia),
        )
        if not valor
    ]
    if faltantes:
        return jsonify({"ok": False, "mensaje": f"Faltan campos: {', '.join(faltantes)}."}), 400

    if len(nombre) > 80 or len(apaterno) > 80 or (amaterno and len(amaterno) > 80):
        return jsonify({"ok": False, "mensaje": "El nombre o los apellidos superan 80 caracteres."}), 400
    if len(correo) > 254:
        return jsonify({"ok": False, "mensaje": "El correo supera 254 caracteres."}), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", correo):
        return jsonify({"ok": False, "mensaje": "El correo no tiene un formato válido."}), 400

    requisitos = []
    if len(contrasenia) < 8:
        requisitos.append("mínimo 8 caracteres")
    if not re.search(r"[A-Z]", contrasenia):
        requisitos.append("una mayúscula")
    if not re.search(r"\d", contrasenia):
        requisitos.append("un número")
    if requisitos:
        return jsonify(
            {
                "ok": False,
                "mensaje": "La contraseña debe incluir: "
                + ", ".join(requisitos)
                + ".",
            }
        ), 400

    existe = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    if existe:
        return jsonify({"ok": False, "mensaje": "El correo ya está registrado."}), 409

    usuario = Usuario(
        nombreUsuario=nombre,
        apaterno=apaterno,
        amaterno=amaterno,
        correo=correo,
        contrasenia=generate_password_hash(contrasenia),
        rolGlobal="CLIENTE",
        estado="ACTIVO",
    )
    db.session.add(usuario)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"ok": False, "mensaje": "El correo ya está registrado."}), 409

    return jsonify(
        {
            "ok": True,
            "data": _serializar_usuario(usuario),
            "mensaje": "Cuenta creada correctamente.",
        }
    ), 201


@auth_bp.post("/login")
def login():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON."}), 400

    correo = (datos.get("correo") or "").strip().lower()
    contrasenia = datos.get("contrasenia") or ""
    if not correo or not contrasenia:
        return jsonify({"ok": False, "mensaje": "Correo y contraseña son obligatorios."}), 400

    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()

    if usuario is None or not check_password_hash(usuario.contrasenia, contrasenia):
        return jsonify({"ok": False, "mensaje": MENSAJE_CREDENCIALES}), 401

    if usuario.estado != "ACTIVO":
        return jsonify({"ok": False, "mensaje": MENSAJE_CREDENCIALES}), 401

    sesion, token_refresh = _crear_sesion(usuario.idUsuario)
    return _respuesta_sesion(usuario, sesion, token_refresh), 200


@auth_bp.post("/recuperar")
def recuperar():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok":False, "mensaje": "El cuerpo debe ser un objeto JSON."}), 400

    # normalizar correo 
    correo = (datos.get("correo") or "").strip().lower()
    if not correo or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", correo):
        return jsonify({"ok": False, "mensaje":"l correo no tiene un formato valido"}), 400
    
    # buscar usuario por correo 
    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()

    # si no existe o no esta activo no crea token
    codigo = None

    if usuario is not None and usuario.estado == "ACTIVO": 
        # si si, se actualiza el ahora
        ahora = _ahora_utc()

        db.session.execute(
            db.update(TokenRecuperacion)
            .where(
                TokenRecuperacion.usuarioId == usuario.idUsuario,
                TokenRecuperacion.fechaUso.is_(None),
            )
            .values(fechaUso=ahora)
        )

        codigo = _generar_codigo()
        db.session.add(
            TokenRecuperacion(
                usuarioId=usuario.idUsuario,
                hashToken=_hash_codigo(codigo),
                fechaExpiracion=ahora + timedelta(minutes=current_app.config["RECUPERACION_MINUTOS"]),
            )
        )
        db.session.commit()
    datos_respuesta = {"codigo":codigo} if codigo and current_app.debug else None 

    return jsonify(
        {"ok": True, "data": datos_respuesta,"mensaje": MENSAJE_RECUPERACION}
    )



@auth_bp.post("/refresh")
def refresh():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON."}), 400

    token_refresh = datos.get("refresh_token")
    if not isinstance(token_refresh, str) or not token_refresh:
        return jsonify({"ok": False, "mensaje": "El refresh token es obligatorio."}), 400

    sesion = db.session.execute(
        db.select(SesionUsuario).where(
            SesionUsuario.hashRefreshToken == _hash_token(token_refresh)
        )
    ).scalar_one_or_none()

    if (
        sesion is None
        or sesion.fechaRevocacion is not None
        or sesion.fechaExpiracion <= _ahora_utc()
    ):
        return jsonify({"ok": False, "mensaje": "Sesión inválida o expirada."}), 401

    usuario = db.session.get(Usuario, sesion.usuarioId)
    if usuario is None or usuario.estado != "ACTIVO":
        return jsonify({"ok": False, "mensaje": "Sesión inválida o expirada."}), 401

    access_token = _crear_access_token(usuario, sesion.idSesion)
    expira_en = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    return jsonify(
        {
            "ok": True,
            "data": {
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": int(expira_en.total_seconds()),
            },
            "mensaje": "Token renovado correctamente.",
        }
    ), 200


@auth_bp.post("/logout")
@jwt_required()
def logout():
    sesion_id = get_jwt().get("sid")
    sesion = db.session.get(SesionUsuario, sesion_id) if sesion_id else None

    if sesion is not None and sesion.fechaRevocacion is None:
        sesion.fechaRevocacion = _ahora_utc()
        db.session.commit()

    return jsonify(
        {"ok": True, "data": None, "mensaje": "Sesión cerrada correctamente."}
    ), 200
