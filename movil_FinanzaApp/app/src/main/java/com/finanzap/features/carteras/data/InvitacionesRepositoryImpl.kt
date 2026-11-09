package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.InvitacionesCartera
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class InvitacionesRepositoryImpl @Inject constructor(
    private val invitacionesApi: InvitacionesApi
) : InvitacionesRepository {

    override suspend fun consultar(idCartera: Int): Result<InvitacionesCartera> =
        try {
            val respuesta = invitacionesApi.consultar(idCartera)
            Result.success(
                InvitacionesCartera(
                    invitacion = respuesta.data.invitacion?.aInvitacion(),
                    ingresos = respuesta.data.ingresos.map { it.aIngreso() }
                )
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun generar(idCartera: Int): Result<Invitacion> =
        try {
            Result.success(invitacionesApi.generar(idCartera).data.aInvitacion())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun unirse(codigo: String): Result<Unit> =
        try {
            invitacionesApi.unirse(UnirseRequest(codigo.trim().uppercase()))
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
