from datetime import date 
from decimal import Decimal

from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required 
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Cartera, MiembroCartera, Usuario

carteras_bp = Blueprint("carteras", __name__, url_prefix="/carteras")


# definir constantes y mapas de catálogo. traduce los valores de la api a los de la bd y viceversa.
TIPOS_ENTRADA = {"HOGAR", "VIAJE", "EVENTO", "OTRO", "OTRA"}


MAPA_A_BD = {
    "HOGAR": "HOGAR",
    "VIAJE": "VIAJE",
    "EVENTO": "EVENTO",
    "OTRO": "OTRA",
    "OTRA": "OTRA",
}


MAPA_A_API = {
    "HOGAR": "HOGAR",
    "VIAJE": "VIAJE",
    "EVENTO": "EVENTO",
    "OTRA": "OTRO",
}


ROLES_VISIBLES = {
    "ADMIN": "PROPIETARIO",
    "CONTRIBUYENTE": "COLABORADOR",
}


ESTADOS_CARTERA = {"ACTIVA","ARCHIVADA", "FINALIZADA"}


MAPA_ROL_BD = {"PROPIETARIO":"ADMIN","COLABORADOR":"CONTRIBUYENTE"}


# 3. Escribir helpers de mapeo, fechas, iniciales y serialización.

# recibe el valor tal cual como esta guardado en la bd 
def _tipo_api(valor_bd):
    # busca la clave y si no existe edvuelve el segundo argumento del diccionario de arriba
    return MAPA_A_API.get(valor_bd, valor_bd)


# recibe el valor del api 
def _tipo_bd(valor_api):
    # recibe otro y devuelve otra 
    return MAPA_A_BD.get(valor_api, valor_api)


def _rol_api(rol_bd):
    # traduce el rol de la membresia admin - propietario contribuyente - colaborador 
    return ROLES_VISIBLES.get(rol_bd, rol_bd)


# convierte un string de fecha aun objeto date de python 
def _fecha(valor):
    # si no hay fecha devuelve none
    if valor is None: 
        return None
    # si no es texto o no mide exactamente 10 caracters, lanza valuerror 
    if not isinstance(valor, str) or len(valor) != 10:
        raise ValueError
    # convierte el texto a date 
    return date.fromisoformat(valor)


# arma las iniciales del usuario 
def _iniciales(usuario):
    return f"{(usuario.nombreUsuario or ' ')[0]}{(usuario.apaterno or ' ')[0]}".upper()


# convierte una fila de carteras en el json del contrato, recibe cartera, rol bd y admin
def _serializar_cartera(cartera, rol_bd, admin):
    return {
        "id": cartera.idCartera,
        "nombre": cartera.nombre,
        "tipo": _tipo_api(cartera.tipo),
        "rol": _rol_api(rol_bd),
        "descripcion": cartera.descripcion,
        "estado": cartera.estado,
        "administrador":f"{admin.nombreUsuario} {admin.apaterno}" if admin else None,
        "inicialesAdministrador":_iniciales(admin) if admin else None,
        "presupuestoInicial": float(cartera.presupuestoInicial or 0),
        "miPagado": 0.0,
        "miCuota": 0.0,
        "miSaldo": 0.0,
        "avancePresupuesto": 0,
        "fechaInicio": cartera.fechaInicio.isoformat() if cartera.fechaInicio else None,
        "fechaFin": cartera.fechaFin.isoformat() if cartera.fechaFin else None,
    }

# 4. Escribir el endpoint POST /carteras.
@carteras_bp.post("")
@jwt_required()
def crear():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok": False, "mensaje": "El cuerpo debe ser un objeto JSON"}), 400
    
    nombre = datos.get("nombre")

    if not isinstance(nombre, str):
        return jsonify({"ok": False, "mensaje": "El nombre es obligatorio."}), 400

    nombre = nombre.strip()
    if not nombre or len(nombre) > 100:
        return jsonify({"ok": False, "mensaje": "El nombre debe tener entre 1 y 100 caracteres."}), 400

    #  validar tipo
    tipo = datos.get("tipo")
    if not isinstance(tipo, str):
        return jsonify({"ok": False, "mensaje": "El tipo es obligatorio."}), 400

    tipo = tipo.strip().upper()
    if tipo not in TIPOS_ENTRADA:
        return jsonify({"ok": False, "mensaje": "El tipo no es valido."}), 400


    # validar descripción
    descripcion = datos.get("descripcion")
    if descripcion is not None and not isinstance(descripcion, str):
        return jsonify({"ok": False, "mensaje": "La descripción debe ser texto."}), 400

    if isinstance(descripcion, str):
        descripcion = descripcion.strip() or None 

    if descripcion and len(descripcion) > 500:
        return jsonify({"ok": False, "mensaje": "La descripción admite hasta 500 caracteres."}), 400

    # 5. validar presupuesto
    bruto = datos.get("presupuestoInicial", 0)
    if isinstance(bruto, bool) or not isinstance(bruto,(int, float)) or bruto < 0:
        return jsonify({"ok": False, "mensaje": "El presupuesto debe ser un número mayor o igual a 0."}), 400

    presupuestoInicial = Decimal(str(bruto))

    # 6. validar fechas con _fecha()
    try:
        inicio = _fecha(datos.get("fechaInicio"))
        fin = _fecha(datos.get("fechaFin"))
    except ValueError:
        return jsonify({"ok": False, "mensaje": "Las fechas deben tener formato YYYY-MM-DD."}), 400

    if inicio and fin and fin < inicio:
        return jsonify({"ok": False, "mensaje": "La fecha fin no puede ser anterior a la fecha inicio."}), 400


    # 7. crear Cartera
    cartera = Cartera(
        nombre=nombre,
        descripcion=descripcion,
        presupuestoInicial=presupuestoInicial,
        tipo=_tipo_bd(tipo),
        fechaInicio=inicio,
        fechaFin=fin,
        estado="ACTIVA",
    )

    db.session.add(cartera)

    # 8. flush()
    try:
        # manda el insert y ya tenemos el id 
        db.session.flush()

        # dueno queda como admin 
        db.session.add(
            MiembroCartera(
                carteraId=cartera.idCartera,
                usuarioId=current_user.idUsuario,
                rol="ADMIN",
                estado="ACTIVO",
            )
        )
        # se guardan las dos filas juntas 
        db.session.commit()
    except SQLAlchemyError:
        # evitar que una cartera quede huerfana 
        db.session.rollback()
        return jsonify({"ok": False, "mensaje": "No se pudo crear la cartera."}), 503

    return jsonify(
        {
            "ok": True,
            "data": _serializar_cartera(cartera,"ADMIN", current_user),
            "mensaje": "Cartera creada correctamente.",
        }
    ), 201


# listar todas las carteras del usuario
@carteras_bp.get("")
@jwt_required()
def listar():
    # POR DEFECTOS SALEN LAS ACTIVAS 
    estado = (request.args.get("estado") or "ACTIVA").strip().upper()

    if estado not in ESTADOS_CARTERA:
        return jsonify({"ok": False, "mensaje": "El filtro estado no es válido."}), 400

    # tipo: opcional, acepta OTRO y OTRA
    tipo = (request.args.get("tipo") or "").strip().upper()
    if tipo and tipo not in TIPOS_ENTRADA:
        return jsonify({"ok": False, "mensaje": "El filtro tipo no es válido."}), 400

    # rol: opcional, llega como PROPIETARIO o COLABORADOR
    rol = (request.args.get("rol") or "").strip().upper()
    if rol and rol not in MAPA_ROL_BD:
        return jsonify({"ok": False, "mensaje": "El filtro rol no es válido."}), 400

    # texto libre, busca sobre nombre y si esta vacio no filtra 
    busqueda = (request.args.get("busqueda") or"").strip()
    
        # trae membresias activas + cartera activa de cada una 
    try:
        # membresia activa + cartera con el estado ya filtrado 
        consulta = (
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
                Cartera.estado == estado,
            )
        )

        # los filtros opcionales se van sumando con AND 
        if tipo:
            consulta = consulta.where(Cartera.tipo == _tipo_bd(tipo))
        if rol:
            consulta = consulta.where(MiembroCartera.rol == MAPA_ROL_BD[rol])
        if busqueda:
            consulta = consulta.where(Cartera.nombre.contains(busqueda))
        filas = db.session.execute(
            consulta.order_by(Cartera.fechaCreacion.desc(), Cartera.idCartera.desc())
        ).all()

    except SQLAlchemyError:
        # si la bd truena respondemos json, no la pagina 500
        return jsonify({"ok": False, "mensaje": "No se pudieron obtener las carteras."}), 503
    
    # se guardan los ids para buscar a los admins en un solo paso 
    ids = [cartera.idCartera for _, cartera in filas]

    # una sola solicitud para todos los admins 
    admins = {}
    if ids: 
        admin_filas = db.session.execute(
            db.select(MiembroCartera.carteraId, Usuario)
            .join(Usuario, Usuario.idUsuario == MiembroCartera.usuarioId)
            .where(
                MiembroCartera.carteraId.in_(ids),
                MiembroCartera.rol == "ADMIN",
                MiembroCartera.estado == "ACTIVO",
            )
        ).all()

        # se arma el mapa id de cartera a usuario admin 
        admins = {cartera_id: usuario for cartera_id, usuario in admin_filas}

    # le pasamos el rol de la membresia de este usuario y su admin 
    data = [
        _serializar_cartera(cartera, membresia.rol, admins.get(cartera.idCartera))
        for membresia, cartera in filas 
    ]

    # respuesta 
    return jsonify(
        {
            "ok": True,
            "data": data,
            "mensaje": "Carteras obtenidas correctamente.",
        }
    ), 200


    



