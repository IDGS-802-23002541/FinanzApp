package com.finanzap.core.network

import com.finanzap.core.storage.SesionLocalFalsa
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

class AuthInterceptorTest {

    private val servidor = MockWebServer()

    @Before
    fun iniciar() {
        servidor.start()
    }

    @After
    fun detener() {
        servidor.shutdown()
    }

    @Test
    fun `agrega el jwt cuando hay sesion`() {
        val sesion = SesionLocalFalsa(access = "jwt-1")
        val cliente = clienteCon(sesion)
        servidor.enqueue(MockResponse().setResponseCode(200))

        cliente.newCall(peticion()).execute().close()

        assertEquals("Bearer jwt-1", servidor.takeRequest().getHeader("Authorization"))
    }

    @Test
    fun `no agrega encabezado sin token`() {
        val sesion = SesionLocalFalsa(access = null)
        val cliente = clienteCon(sesion)
        servidor.enqueue(MockResponse().setResponseCode(200))

        cliente.newCall(peticion()).execute().close()

        assertNull(servidor.takeRequest().getHeader("Authorization"))
    }

    private fun clienteCon(sesion: SesionLocalFalsa): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sesion))
            .build()

    private fun peticion(): Request =
        Request.Builder().url(servidor.url("/carteras")).build()
}
