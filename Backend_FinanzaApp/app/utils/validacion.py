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


def fecha_iso(valor):
    if valor is None:
        return None
    if not isinstance(valor, str) or len(valor) != 10:
        raise ValueError
    return date.fromisoformat(valor)
