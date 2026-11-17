package com.finanzap.core.ui

import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

/** Genera la imagen del QR a partir del contenido que devuelve el backend. */
fun generarQr(texto: String, tamano: Int = 512): ImageBitmap? =
    try {
        val matriz = QRCodeWriter().encode(texto, BarcodeFormat.QR_CODE, tamano, tamano)
        val bitmap = Bitmap.createBitmap(tamano, tamano, Bitmap.Config.RGB_565)
        for (x in 0 until tamano) {
            for (y in 0 until tamano) {
                bitmap.setPixel(x, y, if (matriz[x, y]) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        bitmap.asImageBitmap()
    } catch (_: Exception) {
        null
    }
