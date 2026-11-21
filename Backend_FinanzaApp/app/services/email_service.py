"""
Envío de correo transaccional con Azure Communication Services Email.

Sin EMAIL_CONNECTION_STRING configurada el envío se omite y solo se registra
en el log, para que desarrollo y pruebas no dependan de la red.
"""

import logging

from flask import current_app

log = logging.getLogger(__name__)


def enviar(destinatario, asunto, texto, html=None):
    conexion = current_app.config.get("EMAIL_CONNECTION_STRING")
    remitente = current_app.config.get("EMAIL_REMITENTE")
    if not conexion or not remitente:
        log.warning("Correo omitido para %s: falta configuración.", destinatario)
        return False

    from azure.communication.email import EmailClient

    contenido = {"subject": asunto, "plainText": texto}
    if html:
        contenido["html"] = html
    mensaje = {
        "senderAddress": remitente,
        "content": contenido,
        "recipients": {"to": [{"address": destinatario}]},
    }

    # Un fallo del proveedor no debe tumbar el flujo que originó el correo.
    try:
        EmailClient.from_connection_string(conexion).begin_send(mensaje).result()
    except Exception:
        log.exception("No se pudo enviar el correo a %s.", destinatario)
        return False
    return True


def enviar_codigo_recuperacion(destinatario, codigo, minutos):
    return enviar(
        destinatario,
        "Recupera tu contraseña de FinanzApp",
        (
            f"Tu código de recuperación es {codigo}. "
            f"Vence en {minutos} minutos. Si no lo solicitaste, ignora este correo."
        ),
    )


def enviar_invitacion(destinatario, nombre_cartera, codigo):
    return enviar(
        destinatario,
        f"Invitación a la cartera {nombre_cartera}",
        (
            f"Te invitaron a la cartera {nombre_cartera} en FinanzApp. "
            f"Tu código es {codigo}. También puedes abrir finanzapp://invitacion/{codigo}"
        ),
    )


def enviar_confirmacion_ticket(destinatario, asunto, id_ticket):
    return enviar(
        destinatario,
        f"Recibimos tu reporte #{id_ticket}",
        (
            f'Tu reporte "{asunto}" quedó registrado. '
            "Te avisaremos aquí cuando haya una respuesta."
        ),
    )
