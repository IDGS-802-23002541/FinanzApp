package com.finanzap.core.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    // null = todavía se está leyendo el token; true/false = ya hay respuesta.
    private val _haySesion = MutableStateFlow<Boolean?>(null)
    val haySesion: StateFlow<Boolean?> = _haySesion.asStateFlow()

    init {
        viewModelScope.launch {
            _haySesion.value = withContext(Dispatchers.IO) {
                authRepository.haySesion()
            }
        }
    }

    fun cerrarSesion() {
        authRepository.cerrarSesion()
    }
}
