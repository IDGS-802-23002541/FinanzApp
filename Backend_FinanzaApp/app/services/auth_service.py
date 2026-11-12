from datetime import timedelta

from flask import current_app
from flask_jwt_extended import create_access_token, current_user, get_jwt
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import check_password_hash, generate_password_hash
from app.utils import validacion

from app.extensions import db
from app.models import (
    Cartera,
    MiembroCartera,
    Notificacion,
    PreferenciaUsuario,
    SesionUsuario,
    TokenRecuperacion,
    Usuario,
)
from app.utils import seguridad, validacion
from app.utils.serializers import serializar_usuario

MENSAJE_CREDENCIALES = "Credenciales incorrectas."
MENSAJE_RECUPERACION = (
    "Si el correo esta registrado, recibiras un codigo de recuperacion"
)


def _crear_sesion(usuario_id, ip, user_agent):
    token_refresh = seguridad.nuevo_refresh()
    sesion = SesionUsuario(
        usuarioId=usuario_id,
        hashRefreshToken=seguridad.hash_token(token_refresh),
        fechaExpiracion=seguridad.ahora_utc()
        + timedelta(days=current_app.config["REFRESH_TOKEN_DIAS"]),
        ip=(ip or "")[:45] or None,
        userAgent=(user_agent or "")[:500] or None,
    )
    db.session.add(sesion)
    db.session.commit()
    return sesion, token_refresh


def _crear_access_token(usuario, sesion_id):
    return create_access_token(
        identity=str(usuario.idUsuario),
        additional_claims={"rol": usuario.rolGlobal, "sid": sesion_id},
    )


def _datos_sesion(usuario, sesion, token_refresh):
    expira_en = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    return {
        "access_token": _crear_access_token(usuario, sesion.idSesion),
        "refresh_token": token_refresh,
        "token_type": "Bearer",
        "expires_in": int(expira_en.total_seconds()),
        "usuario": serializar_usuario(usuario),
    }


def registrar(datos):
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
        return {"ok": False, "mensaje": f"Faltan campos: {', '.join(faltantes)}."}, 400
    if len(nombre) > 80 or len(apaterno) > 80 or (amaterno and len(amaterno) > 80):
        return {
            "ok": False,
            "mensaje": "El nombre o los apellidos superan 80 caracteres.",
        }, 400
    if len(correo) > 254:
        return {"ok": False, "mensaje": "El correo supera 254 caracteres."}, 400
    if not validacion.correo_valido(correo):
        return {"ok": False, "mensaje": "El correo no tiene un formato válido."}, 400
    requisitos = validacion.requisitos_contrasenia(contrasenia)
    if requisitos:
        return {
            "ok": False,
            "mensaje": "La contraseña debe incluir: " + ", ".join(requisitos) + ".",
        }, 400

    existe = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    if existe:
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409

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
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409
    return {
        "ok": True,
        "data": serializar_usuario(usuario),
        "mensaje": "Cuenta creada correctamente.",
    }, 201


def login(correo, contrasenia, ip, user_agent):
    correo = (correo or "").strip().lower()
    if not correo or not contrasenia:
        return {"ok": False, "mensaje": "Correo y contraseña son obligatorios."}, 400
    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    if usuario is None or not check_password_hash(usuario.contrasenia, contrasenia):
        return {"ok": False, "mensaje": MENSAJE_CREDENCIALES}, 401
    if usuario.estado != "ACTIVO":
        return {"ok": False, "mensaje": MENSAJE_CREDENCIALES}, 401
    sesion, token_refresh = _crear_sesion(usuario.idUsuario, ip, user_agent)
    return {
        "ok": True,
        "data": _datos_sesion(usuario, sesion, token_refresh),
        "mensaje": "Sesión iniciada correctamente.",
    }, 200


def solicitar_recuperacion(correo):
    correo = (correo or "").strip().lower()
    if not validacion.correo_valido(correo):
        return {"ok": False, "mensaje": "l correo no tiene un formato valido"}, 400
    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    codigo = None
    if usuario is not None and usuario.estado == "ACTIVO":
        ahora = seguridad.ahora_utc()
        db.session.execute(
            db.update(TokenRecuperacion)
            .where(
                TokenRecuperacion.usuarioId == usuario.idUsuario,
                TokenRecuperacion.fechaUso.is_(None),
            )
            .values(fechaUso=ahora)
        )
        codigo = seguridad.generar_codigo()
        db.session.add(
            TokenRecuperacion(
                usuarioId=usuario.idUsuario,
                hashToken=seguridad.hash_codigo(codigo),
                fechaExpiracion=ahora
                + timedelta(minutes=current_app.config["RECUPERACION_MINUTOS"]),
            )
        )
        db.session.commit()
    datos_respuesta = {"codigo": codigo} if codigo and current_app.debug else None
    return {"ok": True, "data": datos_respuesta, "mensaje": MENSAJE_RECUPERACION}, 200


def restablecer(correo, codigo, contrasenia):
    correo = (correo or "").strip().lower()
    faltantes = [
        campo
        for campo, valor in (
            ("correo", correo),
            ("codigo", codigo),
            ("contrasenia", contrasenia),
        )
        if not valor
    ]
    if faltantes:
        return {"ok": False, "mensaje": f"Faltan campos: {','.join(faltantes)}."}, 400
    if not validacion.correo_valido(correo):
        return {"ok": False, "mensaje": "El correo no tiene un formato válido."}, 400
    requisitos = validacion.requisitos_contrasenia(contrasenia)
    if requisitos:
        return {
            "ok": False,
            "mensaje": "La contraseña debe incluir: " + ", ".join(requisitos) + ".",
        }, 400
    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    if usuario is None or usuario.estado != "ACTIVO":
        return {"ok": False, "mensaje": "El código no es válido o ya expiró."}, 400
    ahora = seguridad.ahora_utc()
    token = db.session.execute(
        db.select(TokenRecuperacion).where(
            TokenRecuperacion.usuarioId == usuario.idUsuario,
            TokenRecuperacion.hashToken == seguridad.hash_codigo(codigo),
            TokenRecuperacion.fechaUso.is_(None),
            TokenRecuperacion.fechaExpiracion > ahora,
        )
    ).scalar_one_or_none()
    if token is None:
        return {"ok": False, "mensaje": "El código no es válido o ya expiró."}, 400
    usuario.contrasenia = generate_password_hash(contrasenia)
    usuario.fechaActualizacion = ahora
    token.fechaUso = ahora
    db.session.execute(
        db.update(SesionUsuario)
        .where(
            SesionUsuario.usuarioId == usuario.idUsuario,
            SesionUsuario.fechaRevocacion.is_(None),
        )
        .values(fechaRevocacion=ahora)
    )
    db.session.commit()
    return {
        "ok": True,
        "data": None,
        "mensaje": "Contraseña actualizada correctamente.",
    }, 200


def cambiar_contrasenia(actual, nueva):
    if not isinstance(actual, str) or not actual:
        return {"ok": False, "mensaje": "La contraseña actual es obligatoria."}, 400
    if not isinstance(nueva, str) or not nueva:
        return {"ok": False, "mensaje": "La contraseña nueva es obligatoria."}, 400
    requisitos = validacion.requisitos_contrasenia(nueva)
    if requisitos:
        return {
            "ok": False,
            "mensaje": "La contraseña nueva debe incluir: "
            + ", ".join(requisitos)
            + ".",
        }, 400
    if nueva == actual:
        return {
            "ok": False,
            "mensaje": "La nueva contraseña debe ser distinta a la actual.",
        }, 400
    if not check_password_hash(current_user.contrasenia, actual):
        return {"ok": False, "mensaje": "La contraseña actual no es válida."}, 400
    ahora = seguridad.ahora_utc()
    current_user.contrasenia = generate_password_hash(nueva)
    current_user.fechaActualizacion = ahora
    sid_actual = get_jwt().get("sid")
    db.session.execute(
        db.update(SesionUsuario)
        .where(
            SesionUsuario.usuarioId == current_user.idUsuario,
            SesionUsuario.idSesion != sid_actual,
            SesionUsuario.fechaRevocacion.is_(None),
        )
        .values(fechaRevocacion=ahora)
    )
    db.session.commit()
    return {
        "ok": True,
        "data": None,
        "mensaje": "Contraseña actualizada correctamente.",
    }, 200


def _archivar_carteras_propias(usuario_id):
    mis_carteras = db.select(MiembroCartera.carteraId).where(
        MiembroCartera.usuarioId == usuario_id,
        MiembroCartera.rol == "ADMIN",
        MiembroCartera.estado == "ACTIVO",
    )
    db.session.execute(
        db.update(Cartera)
        .where(Cartera.idCartera.in_(mis_carteras), Cartera.estado == "ACTIVA")
        .values(estado="ARCHIVADA")
        .execution_options(synchronize_session=False)
    )
    db.session.execute(
        db.update(MiembroCartera)
        .where(
            MiembroCartera.usuarioId == usuario_id,
            MiembroCartera.rol == "CONTRIBUYENTE",
            MiembroCartera.estado == "ACTIVO",
        )
        .values(estado="BAJA", fechaBaja=seguridad.ahora_utc())
        .execution_options(synchronize_session=False)
    )


def desactivar(contrasenia):
    if not isinstance(contrasenia, str) or not contrasenia:
        return {"ok": False, "mensaje": "La contraseña es obligatoria."}, 400
    if not check_password_hash(current_user.contrasenia, contrasenia):
        return {"ok": False, "mensaje": "La contraseña no es válida."}, 400
    ahora = seguridad.ahora_utc()
    _archivar_carteras_propias(current_user.idUsuario)
    current_user.estado = "INACTIVO"
    current_user.fechaActualizacion = ahora
    db.session.execute(
        db.update(SesionUsuario)
        .where(
            SesionUsuario.usuarioId == current_user.idUsuario,
            SesionUsuario.fechaRevocacion.is_(None),
        )
        .values(fechaRevocacion=ahora)
    )
    db.session.commit()
    return {
        "ok": True,
        "data": None,
        "mensaje": "Cuenta desactivada correctamente.",
    }, 200


def eliminar(contrasenia):
    if not isinstance(contrasenia, str) or not contrasenia:
        return {"ok": False, "mensaje": "La contraseña es obligatoria."}, 400
    if current_user.rolGlobal in ("ADMIN", "TRABAJADOR"):
        return {
            "ok": False,
            "mensaje": "Esta cuenta no puede eliminarse desde la app.",
        }, 403
    if not check_password_hash(current_user.contrasenia, contrasenia):
        return {"ok": False, "mensaje": "La contraseña no es válida."}, 400
    ahora = seguridad.ahora_utc()
    _archivar_carteras_propias(current_user.idUsuario)
    current_user.nombreUsuario = "Eliminado"
    current_user.apaterno = "Eliminado"
    current_user.amaterno = None
    current_user.correo = f"elim+{current_user.idUsuario}@local.invalid"
    current_user.contrasenia = generate_password_hash(seguridad.nuevo_refresh())
    current_user.estado = "ELIMINADO"
    current_user.fechaBaja = ahora
    current_user.fechaActualizacion = ahora
    db.session.execute(
        db.delete(PreferenciaUsuario).where(
            PreferenciaUsuario.usuarioId == current_user.idUsuario
        )
    )
    db.session.execute(
        db.delete(Notificacion).where(Notificacion.usuarioId == current_user.idUsuario)
    )
    db.session.execute(
        db.update(TokenRecuperacion)
        .where(
            TokenRecuperacion.usuarioId == current_user.idUsuario,
            TokenRecuperacion.fechaUso.is_(None),
        )
        .values(fechaUso=ahora)
    )
    db.session.execute(
        db.update(SesionUsuario)
        .where(
            SesionUsuario.usuarioId == current_user.idUsuario,
            SesionUsuario.fechaRevocacion.is_(None),
        )
        .values(fechaRevocacion=ahora)
    )
    db.session.commit()
    return {"ok": True, "data": None, "mensaje": "Cuenta eliminada correctamente."}, 200


def refresh(token_refresh):
    if not isinstance(token_refresh, str) or not token_refresh:
        return {"ok": False, "mensaje": "El refresh token es obligatorio."}, 400
    sesion = db.session.execute(
        db.select(SesionUsuario).where(
            SesionUsuario.hashRefreshToken == seguridad.hash_token(token_refresh)
        )
    ).scalar_one_or_none()
    if (
        sesion is None
        or sesion.fechaRevocacion is not None
        or sesion.fechaExpiracion <= seguridad.ahora_utc()
    ):
        return {"ok": False, "mensaje": "Sesión inválida o expirada."}, 401
    usuario = db.session.get(Usuario, sesion.usuarioId)
    if usuario is None or usuario.estado != "ACTIVO":
        return {"ok": False, "mensaje": "Sesión inválida o expirada."}, 401
    expira_en = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    return {
        "ok": True,
        "data": {
            "access_token": _crear_access_token(usuario, sesion.idSesion),
            "token_type": "Bearer",
            "expires_in": int(expira_en.total_seconds()),
        },
        "mensaje": "Token renovado correctamente.",
    }, 200


def logout():
    sesion_id = get_jwt().get("sid")
    sesion = db.session.get(SesionUsuario, sesion_id) if sesion_id else None
    if sesion is not None and sesion.fechaRevocacion is None:
        sesion.fechaRevocacion = seguridad.ahora_utc()
        db.session.commit()
    return {"ok": True, "data": None, "mensaje": "Sesión cerrada correctamente."}, 200


CAMPOS_NOTIFICACION = (
    "notificacionesMovimientos",
    "notificacionesSistema",
    "notificacionesPagos",
)


def obtener_preferencia():
    preferencia = db.session.get(PreferenciaUsuario, current_user.idUsuario)
    return {
        "ok": True,
        "data": _datos_preferencia(preferencia),
        "mensaje": "Preferencia obtenida.",
    }, 200


def guardar_preferencia(datos):
    cambios, error = _validar_preferencia(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    preferencia = db.session.get(PreferenciaUsuario, current_user.idUsuario)
    if preferencia is None:
        preferencia = PreferenciaUsuario(usuarioId=current_user.idUsuario)
        db.session.add(preferencia)

    for campo, valor in cambios.items():
        setattr(preferencia, campo, valor)
    preferencia.fechaActualizacion = seguridad.ahora_utc()
    db.session.commit()

    return {
        "ok": True,
        "data": _datos_preferencia(preferencia),
        "mensaje": "Preferencia guardada.",
    }, 200


def _datos_preferencia(preferencia):
    datos = {"tema": preferencia.tema if preferencia is not None else "CLARO"}
    for campo in CAMPOS_NOTIFICACION:
        datos[campo] = (
            getattr(preferencia, campo) if preferencia is not None else True
        )
    return datos


def _validar_preferencia(datos):
    cambios = {}

    if "tema" in datos:
        tema = datos.get("tema")
        if not isinstance(tema, str) or tema.strip().upper() not in (
            "CLARO",
            "OSCURO",
        ):
            return None, "El tema debe ser CLARO u OSCURO."
        cambios["tema"] = tema.strip().upper()

    for campo in CAMPOS_NOTIFICACION:
        if campo in datos:
            valor = datos[campo]
            if not isinstance(valor, bool):
                return None, "Las preferencias de notificación deben ser booleanas."
            cambios[campo] = valor

    if not cambios:
        return None, "No se envió ninguna preferencia."
    return cambios, None

def editar_cuenta(datos):
    nombre_usuario = (datos.get("nombreUsuario") or "").strip()
    apaterno = (datos.get("apaterno") or "").strip()
    amaterno = (datos.get("amaterno") or "").strip()
    correo = (datos.get("correo") or "").strip().lower()

    # El nombre siempre se toma; los demás campos vacíos conservan su valor.
    if not nombre_usuario:
        return {"ok": False, "mensaje": "El nombre de usuario es obligatorio."}, 400

    if len(nombre_usuario) > 80:
        return {
            "ok": False,
            "mensaje": "El nombre de usuario supera 80 caracteres.",
        }, 400

    apaterno = apaterno or current_user.apaterno
    amaterno = amaterno or current_user.amaterno
    correo_cambio = bool(correo) and correo != current_user.correo
    correo = correo or current_user.correo

    if len(apaterno) > 80 or len(amaterno or "") > 80:
        return {
            "ok": False,
            "mensaje": "Los apellidos superan 80 caracteres.",
        }, 400

    if len(correo) > 254:
        return {"ok": False, "mensaje": "El correo supera 254 caracteres."}, 400

    if not validacion.correo_valido(correo):
        return {
            "ok": False,
            "mensaje": "El correo no tiene un formato válido.",
        }, 400

    if correo_cambio:
        try:
            repetido = db.session.execute(
                db.select(Usuario.idUsuario).where(
                    Usuario.correo == correo,
                    Usuario.idUsuario != current_user.idUsuario,
                )
            ).scalar_one_or_none()
        except SQLAlchemyError:
            return {
                "ok": False,
                "mensaje": "No se pudo verificar el correo.",
            }, 503

        if repetido is not None:
            return {"ok": False, "mensaje": "El correo ya está registrado."}, 409

    current_user.nombreUsuario = nombre_usuario
    current_user.apaterno = apaterno
    current_user.amaterno = amaterno
    current_user.correo = correo
    current_user.fechaActualizacion = seguridad.ahora_utc()

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo actualizar la cuenta.",
        }, 503

    return {
        "ok": True,
        "data": serializar_usuario(current_user),
        "mensaje": "Cuenta actualizada correctamente.",
    }, 200
    
    
    
