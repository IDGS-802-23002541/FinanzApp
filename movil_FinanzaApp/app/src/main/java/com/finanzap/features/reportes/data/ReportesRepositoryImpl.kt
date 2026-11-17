package com.finanzap.features.reportes.data

import android.content.Context
import android.os.Environment
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import javax.inject.Inject
import kotlinx.coroutines.CancellationException
import retrofit2.HttpException

class ReportesRepositoryImpl @Inject constructor(
    private val reportesApi: ReportesApi,
    @ApplicationContext private val context: Context
) : ReportesRepository {

    override suspend fun vistaPrevia(filtros: FiltrosReporte): Result<Reporte> =
        try {
            val respuesta = reportesApi.vistaPrevia(
                carteraId = filtros.carteraId,
                tipo = filtros.tipo,
                periodoId = filtros.periodoId,
                fechaInicio = filtros.fechaInicio,
                fechaFin = filtros.fechaFin
            )
            Result.success(respuesta.data)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun exportar(
        filtros: FiltrosReporte,
        formato: FormatoReporte
    ): Result<String> =
        try {
            val respuesta = reportesApi.exportar(
                formato = formato.valor,
                carteraId = filtros.carteraId,
                tipo = filtros.tipo,
                periodoId = filtros.periodoId,
                fechaInicio = filtros.fechaInicio,
                fechaFin = filtros.fechaFin
            )
            if (!respuesta.isSuccessful) throw HttpException(respuesta)

            val cuerpo = respuesta.body()
                ?: throw IllegalStateException("El archivo del reporte llegó vacío.")
            val nombre = nombreArchivo(
                respuesta.headers().get("Content-Disposition"),
                formato
            )
            Result.success(guardar(nombre, cuerpo.bytes()).absolutePath)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    // El archivo queda en el directorio de descargas de la app: no hace falta permiso ni SAF.
    private fun guardar(nombre: String, contenido: ByteArray): File {
        val directorio = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            ?: context.filesDir
        return File(directorio, nombre).apply { writeBytes(contenido) }
    }

    private fun nombreArchivo(disposicion: String?, formato: FormatoReporte): String {
        val nombre = Regex("filename=\"([^\"]+)\"")
            .find(disposicion.orEmpty())
            ?.groupValues
            ?.get(1)
        return nombre?.takeIf { it.isNotBlank() } ?: "reporte.${formato.valor}"
    }
}
