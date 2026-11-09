package com.finanzap.core.network

import com.finanzap.core.storage.SesionLocal
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/** Agrega el JWT a todas las peticiones cuando existe una sesión. */
@Singleton
class AuthInterceptor @Inject constructor(
    private val sesionLocal: SesionLocal
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sesionLocal.accessToken()
        val peticion = if (token.isNullOrBlank()) {
            chain.request()
        } else {
            chain.request()
                .newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        }
        return chain.proceed(peticion)
    }
}
