package com.finanzap.core.di

import com.finanzap.features.auth.data.AuthRepository
import com.finanzap.features.auth.data.AuthRepositoryImpl
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.data.CarterasRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

// Enlaza cada contrato de repositorio con su implementación para poder doblarlos en pruebas.
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoriosModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    @Singleton
    abstract fun bindCarterasRepository(impl: CarterasRepositoryImpl): CarterasRepository
}
