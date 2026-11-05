package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Invitacion

interface InvitacionesRepository {

    suspend fun consultar(idCartera: Int): Result<Invitacion?>

    suspend fun unirse(codigo: String): Result<Unit>
}
