package com.finanzap.core.di

import com.finanzap.BuildConfig
import com.finanzap.core.network.AuthInterceptor
import com.finanzap.core.network.TokenAuthenticator
import com.finanzap.core.network.jsonApi
import com.finanzap.core.storage.SesionLocal
import com.finanzap.core.storage.SesionLocalCifrada
import com.finanzap.features.auth.data.AuthApi
import com.finanzap.features.auth.data.AuthRepository
import com.finanzap.features.auth.data.AuthRepositoryImpl
import com.finanzap.features.carteras.data.CarterasApi
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.data.CarterasRepositoryImpl
import com.finanzap.features.carteras.data.InvitacionesApi
import com.finanzap.features.carteras.data.InvitacionesRepository
import com.finanzap.features.carteras.data.InvitacionesRepositoryImpl
import com.finanzap.features.transacciones.data.CategoriasApi
import com.finanzap.features.transacciones.data.CategoriasRepository
import com.finanzap.features.transacciones.data.CategoriasRepositoryImpl
import com.finanzap.features.transacciones.data.TransaccionesApi
import com.finanzap.features.transacciones.data.TransaccionesRepository
import com.finanzap.features.transacciones.data.TransaccionesRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

// Un solo módulo: bindings de repositorios/almacenamiento y construcción de la red.
@Module
@InstallIn(SingletonComponent::class)
abstract class Modulos {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    @Singleton
    abstract fun bindCarterasRepository(impl: CarterasRepositoryImpl): CarterasRepository

    @Binds
    @Singleton
    abstract fun bindInvitacionesRepository(
        impl: InvitacionesRepositoryImpl
    ): InvitacionesRepository

    @Binds
    @Singleton
    abstract fun bindTransaccionesRepository(
        impl: TransaccionesRepositoryImpl
    ): TransaccionesRepository

    @Binds
    @Singleton
    abstract fun bindCategoriasRepository(
        impl: CategoriasRepositoryImpl
    ): CategoriasRepository

    @Binds
    @Singleton
    abstract fun bindSesionLocal(impl: SesionLocalCifrada): SesionLocal

    companion object {

        @Provides
        @Singleton
        fun provideJson(): Json = jsonApi

        @Provides
        @Singleton
        fun provideOkHttpClient(
            authInterceptor: AuthInterceptor,
            tokenAuthenticator: TokenAuthenticator
        ): OkHttpClient {
            val constructor = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .authenticator(tokenAuthenticator)

            if (BuildConfig.DEBUG) {
                val registro = HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BASIC
                    redactHeader("Authorization")
                }
                constructor.addInterceptor(registro)
            }

            return constructor.build()
        }

        @Provides
        @Singleton
        fun provideRetrofit(cliente: OkHttpClient, json: Json): Retrofit =
            Retrofit.Builder()
                .baseUrl(BuildConfig.API_BASE_URL)
                .client(cliente)
                .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
                .build()

        @Provides
        @Singleton
        fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

        @Provides
        @Singleton
        fun provideCarterasApi(retrofit: Retrofit): CarterasApi =
            retrofit.create(CarterasApi::class.java)

        @Provides
        @Singleton
        fun provideInvitacionesApi(retrofit: Retrofit): InvitacionesApi =
            retrofit.create(InvitacionesApi::class.java)

        @Provides
        @Singleton
        fun provideTransaccionesApi(retrofit: Retrofit): TransaccionesApi =
            retrofit.create(TransaccionesApi::class.java)

        @Provides
        @Singleton
        fun provideCategoriasApi(retrofit: Retrofit): CategoriasApi =
            retrofit.create(CategoriasApi::class.java)
    }
}
