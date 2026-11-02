package com.finanzap.core.di

import com.finanzap.core.storage.SesionLocal
import com.finanzap.core.storage.SesionLocalCifrada
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

// Enlaza el contrato de sesión con su almacenamiento cifrado para poder doblarlo en pruebas.
@Module
@InstallIn(SingletonComponent::class)
abstract class AlmacenamientoModule {

    @Binds
    @Singleton
    abstract fun bindSesionLocal(impl: SesionLocalCifrada): SesionLocal
}
