package com.finanzap.core.notificaciones

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.finanzap.R

/** Canal único de avisos de la app (recordatorios y movimientos). */
const val CANAL_RECORDATORIOS = "recordatorios_finanzapp"

/** Crea el canal de notificaciones; en Android 8 o superior es obligatorio. */
fun crearCanalNotificaciones(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val canal = NotificationChannel(
        CANAL_RECORDATORIOS,
        context.getString(R.string.notificaciones_canal_nombre),
        NotificationManager.IMPORTANCE_DEFAULT
    ).apply {
        description = context.getString(R.string.notificaciones_canal_descripcion)
    }
    context.getSystemService(NotificationManager::class.java)
        .createNotificationChannel(canal)
}

/**
 * Indica si el teléfono permite mostrar notificaciones de la app. Desde
 * Android 13 también hace falta el permiso explícito del usuario.
 */
fun notificacionesPermitidas(context: Context): Boolean {
    val permisoConcedido = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED

    return permisoConcedido && NotificationManagerCompat.from(context).areNotificationsEnabled()
}

/** Publica una notificación local inmediata. */
fun mostrarNotificacion(
    context: Context,
    id: Int,
    titulo: String,
    texto: String
) {
    if (!notificacionesPermitidas(context)) return

    crearCanalNotificaciones(context)
    val notificacion = NotificationCompat.Builder(context, CANAL_RECORDATORIOS)
        .setSmallIcon(R.drawable.ic_notificacion)
        .setContentTitle(titulo)
        .setContentText(texto)
        .setStyle(NotificationCompat.BigTextStyle().bigText(texto))
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true)
        .build()

    NotificationManagerCompat.from(context).notify(id, notificacion)
}
