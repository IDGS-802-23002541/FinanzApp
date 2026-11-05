package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Invitacion
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class InvitacionesRepositoryImpl @Inject constructor(
    private val invitacionesApi: InvitacionesApi
) : InvitacionesRepository {

    override suspend fun consultar(idCartera: Int): Result<Invitacion?> =
        try {
            val respuesta = invitacionesApi.consultar(idCartera)
            Result.success(respuesta.data.invitacion?.aInvitacion())
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
