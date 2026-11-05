package com.finanzap.features.carteras.ui

import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.data.InvitacionesRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class UnirseCarteraViewModelTest {

    private val repositorio = RepositorioFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `codigo corto no llama a la api`() = runTest {
        val viewModel = UnirseCarteraViewModel(repositorio)

        viewModel.onCodigoChange("ABC")
        viewModel.unirse()

        assertEquals("Ingresa un código válido de 8 caracteres.", viewModel.state.value.error)
        assertNull(repositorio.codigoUsado)
    }

    @Test
    fun `qr con deeplink extrae el codigo y se une`() = runTest {
        val viewModel = UnirseCarteraViewModel(repositorio)

        viewModel.onCodigoEscaneado("finanzapp://invitacion/ABCD2345")

        assertEquals(UnirseCarteraEvento.Unido, viewModel.eventos.first())
        assertEquals("ABCD2345", repositorio.codigoUsado)
    }

    @Test
    fun `extrae codigo de texto directo`() {
        assertEquals("ABCD2345", extraerCodigoInvitacion(" abcd2345 "))
        assertNull(extraerCodigoInvitacion("corto"))
    }
}

private class RepositorioFalso : InvitacionesRepository {

    var codigoUsado: String? = null

    override suspend fun consultar(idCartera: Int): Result<Invitacion?> =
        Result.success(null)

    override suspend fun unirse(codigo: String): Result<Unit> {
        codigoUsado = codigo
        return Result.success(Unit)
    }
}
