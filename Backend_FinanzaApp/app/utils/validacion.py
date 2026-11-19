import re
from datetime import date

CORREO_RE = r"[^@\s]+@[^@\s]+\.[^@\s]+"


def correo_valido(correo):
    return bool(re.fullmatch(CORREO_RE, correo or ""))


def requisitos_contrasenia(contrasenia):
    requisitos = []
    if len(contrasenia) < 8:
        requisitos.append("mínimo 8 caracteres")
    if not re.search(r"[A-Z]", contrasenia):
        requisitos.append("una mayúscula")
    if not re.search(r"\d", contrasenia):
        requisitos.append("un número")
    return requisitos


def datos_usuario(datos):
    nombre = (datos.get("nombreUsuario") or "").strip()
    apaterno = (datos.get("apaterno") or "").strip()
    amaterno = (datos.get("amaterno") or "").strip() or None
    correo = (datos.get("correo") or "").strip().lower()

    faltantes = [
        campo
        for campo, valor in (
            ("nombreUsuario", nombre),
            ("apaterno", apaterno),
            ("correo", correo),
        )
        if not valor
    ]
    if faltantes:
        return None, f"Faltan campos: {', '.join(faltantes)}."
    if len(nombre) > 80 or len(apaterno) > 80 or (amaterno and len(amaterno) > 80):
        return None, "El nombre o los apellidos superan 80 caracteres."
    if len(correo) > 254:
        return None, "El correo supera 254 caracteres."
    if not correo_valido(correo):
        return None, "El correo no tiene un formato válido."
    return {
        "nombreUsuario": nombre,
        "apaterno": apaterno,
        "amaterno": amaterno,
        "correo": correo,
    }, None


def fecha_iso(valor):
    if valor is None:
        return None
    if not isinstance(valor, str) or len(valor) != 10:
        raise ValueError
    return date.fromisoformat(valor)
