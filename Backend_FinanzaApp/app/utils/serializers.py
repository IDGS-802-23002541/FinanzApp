from app.extensions import db
from app.models import PreferenciaUsuario

MAPA_TIPO_API = {"HOGAR": "HOGAR", "VIAJE": "VIAJE", "EVENTO": "EVENTO", "OTRA": "OTRO"}
MAPA_TIPO_BD = {
    "HOGAR": "HOGAR",
    "VIAJE": "VIAJE",
    "EVENTO": "EVENTO",
    "OTRO": "OTRA",
    "OTRA": "OTRA",
}
MAPA_ROL_API = {"ADMIN": "PROPIETARIO", "CONTRIBUYENTE": "COLABORADOR"}


def serializar_usuario(usuario):
    pref = db.session.get(PreferenciaUsuario, usuario.idUsuario)
    return {
        "idUsuario": usuario.idUsuario,
        "nombreUsuario": usuario.nombreUsuario,
        "apaterno": usuario.apaterno,
        "amaterno": usuario.amaterno,
        "correo": usuario.correo,
        "rolGlobal": usuario.rolGlobal,
        "estado": usuario.estado,
        "fechaRegistro": usuario.fechaRegistro,
        "tema": pref.tema if pref is not None else "CLARO",
    }


def tipo_api(valor_bd):
    return MAPA_TIPO_API.get(valor_bd, valor_bd)


def tipo_bd(valor_api):
    return MAPA_TIPO_BD.get(valor_api, valor_api)


def rol_api(rol_bd):
    return MAPA_ROL_API.get(rol_bd, rol_bd)


def iniciales(usuario):
    return f"{(usuario.nombreUsuario or ' ')[0]}{(usuario.apaterno or ' ')[0]}".upper()


def serializar_cartera(cartera, rol_bd, admin):
    return {
        "id": cartera.idCartera,
        "nombre": cartera.nombre,
        "tipo": tipo_api(cartera.tipo),
        "rol": rol_api(rol_bd),
        "descripcion": cartera.descripcion,
        "estado": cartera.estado,
        "administrador": f"{admin.nombreUsuario} {admin.apaterno}" if admin else None,
        "inicialesAdministrador": iniciales(admin) if admin else None,
        "presupuestoInicial": float(cartera.presupuestoInicial or 0),
        "miPagado": 0.0,
        "miCuota": 0.0,
        "miSaldo": 0.0,
        "avancePresupuesto": 0,
        "fechaInicio": cartera.fechaInicio.isoformat() if cartera.fechaInicio else None,
        "fechaFin": cartera.fechaFin.isoformat() if cartera.fechaFin else None,
        "fechaCierre": (
            cartera.fechaCierre.isoformat() if cartera.fechaCierre else None
        ),
    }

def serializar_comentario(comentario):
    return {
        "idComentario": comentario.idComentario,
        "nombre": comentario.nombre,
        "correo": comentario.correo,
        "comentario": comentario.comentario,
        "estado": comentario.estado,
        "fechaCreacion": comentario.fechaCreacion.isoformat()
        if comentario.fechaCreacion else None,
        # "ip": NO se expone
    }