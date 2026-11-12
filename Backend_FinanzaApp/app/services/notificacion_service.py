from app.extensions import db
from app.models import MiembroCartera, Notificacion, PreferenciaUsuario

COLUMNA_POR_TIPO = {
    "MOVIMIENTO": "notificacionesMovimientos",
    "SISTEMA": "notificacionesSistema",
    "PAGOS": "notificacionesPagos",
}
TIPOS = tuple(COLUMNA_POR_TIPO)

def puede_notificar(usuario_id, tipo):
    columna = COLUMNA_POR_TIPO.get(tipo)
    if columna is None:
        return False

    preferencia = db.session.get(PreferenciaUsuario, usuario_id)
    if preferencia is None:
        # Sin fila de preferencias se aplican los defaults: todas activadas.
        return True
    return getattr(preferencia, columna)

def notificar(usuario_id, tipo, titulo, mensaje):
    if not puede_notificar(usuario_id, tipo):
        return False

    db.session.add(
        Notificacion(
            usuarioId=usuario_id,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
        )
    )
    return True

def notificar_a_cartera(cartera_id, excluir_usuario_id, tipo, titulo, mensaje):
    miembros = db.session.execute(
        db.select(MiembroCartera.usuarioId).where(
            MiembroCartera.carteraId == cartera_id,
            MiembroCartera.estado == "ACTIVO",
            MiembroCartera.usuarioId != excluir_usuario_id,
        )
    ).scalars().all()

    enviadas = 0
    for usuario_id in miembros:
        if notificar(usuario_id, tipo, titulo, mensaje):
            enviadas += 1
    return enviadas
