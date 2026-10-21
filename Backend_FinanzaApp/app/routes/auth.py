import re 

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError 
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models import Usuario 

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.post("/registro")
def registro():
    datos = request.get_json(silent=True)

    if not isinstance(datos, dict):
        return jsonify({"ok": False, "mensaje":"El cuerpo debe ser un objeto JSON."}), 400

    nombre = (datos.get("nombreUsuario") or "").strip()
    apaterno = (datos.get("apaterno") or "").strip()
    amaterno = (datos.get("amaterno") or "").strip() or None
    correo = (datos.get("correo") or "").strip().lower()
    contrasenia = datos.get("contrasenia") or ""

    faltantes = [ 
        campo for campo, valor in (
            ("nombreUsuario", nombre),
            ("apaterno", apaterno),
            ("correo",correo),
            ("contrasenia",contrasenia),
        ) if not valor
    ]
    if faltantes: 
        return jsonify({"ok": False, "mensaje": f"Faltan campos: {','.join(faltantes)}."}),400

    if len(nombre) > 80 or len(apaterno) > 80 or (amaterno and len(amaterno) > 80):
        return jsonify({"ok": False, "mensaje": "El nombre o los apellidos superan 80 caracteres."}), 400
    if len(correo) > 254:
        return jsonify({"ok": False, "mensaje": "El correo supera 254 caracteres."}), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", correo):
        return jsonify({"ok": False, "mensaje": "El correo no tiene un formato válido."}), 400

    requisitos = []
    if len(contrasenia) < 8: 
        requisitos.append("minimo 8 caracteres")
    if not re.search(r"[A-Z]", contrasenia):
        requisitos.append("una mayuscula")
    if not re.search(r"\d", contrasenia):
        requisitos.append("un numero")
    if requisitos:
        return jsonify({
            "ok": False,
            "mensaje": "La contraseña debe incluir: "+", ".join(requisitos) + "."
        }), 400

    existe = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()

    if existe:
        return jsonify({"ok": False, "mensaje": "El correo ya esta registrado."}), 409
    
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
        return jsonify({"ok": False, "mensaje":"El correo ya esta registrado"}), 409

    return jsonify({
        "ok": True,
        "data":{
            "idUsuario": usuario.idUsuario,
            "nombreUsuario":usuario.nombreUsuario,
            "apaterno":usuario.apaterno,
            "amaterno":usuario.amaterno,
            "correo": usuario.correo,
            "rolGlobal": usuario.rolGlobal,
            "estado": usuario.estado,
            "fechaRegistro": usuario.fechaRegistro,
        },
        "mensaje": "Cuenta creada correctamente",
    }), 201



