package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.InvitacionesCartera

interface InvitacionesRepository {

    suspend fun consultar(idCartera: Int): Result<InvitacionesCartera>

    suspend fun generar(idCartera: Int): Result<Invitacion>

    suspend fun unirse(codigo: String): Result<Unit>
}
