package com.finanzap.core.ui

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.finanzap.R

/** Secciones que se pueden elegir desde el menú lateral. */
enum class SeccionMenu {
    CARTERAS,
    REPORTES,
    SOPORTE,
    MI_CUENTA
}

/** Permite que cualquier pantalla abra el menú lateral sin pasar callbacks por todas las capas. */
val LocalAbrirMenu = staticCompositionLocalOf<(() -> Unit)?> { null }

@Composable
fun MenuLateral(
    temaOscuro: Boolean,
    seccionActual: SeccionMenu?,
    onSeccion: (SeccionMenu) -> Unit,
    onAlternarTema: () -> Unit,
    onCerrarSesion: () -> Unit
) {
    ModalDrawerSheet {
        Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 28.dp, vertical = 24.dp)
        )
        HorizontalDivider()
        Spacer(modifier = Modifier.height(8.dp))

        ItemMenu(
            texto = stringResource(R.string.carteras_titulo),
            seleccionado = seccionActual == SeccionMenu.CARTERAS,
            onClick = { onSeccion(SeccionMenu.CARTERAS) },
            icono = { Icon(Icons.Default.Home, contentDescription = null) }
        )
        ItemMenu(
            texto = stringResource(R.string.reportes_titulo),
            seleccionado = seccionActual == SeccionMenu.REPORTES,
            onClick = { onSeccion(SeccionMenu.REPORTES) },
            icono = { Icon(Icons.Default.Star, contentDescription = null) }
        )
        ItemMenu(
            texto = stringResource(R.string.soporte_titulo),
            seleccionado = seccionActual == SeccionMenu.SOPORTE,
            onClick = { onSeccion(SeccionMenu.SOPORTE) },
            icono = { Icon(Icons.Default.Info, contentDescription = null) }
        )
        ItemMenu(
            texto = stringResource(R.string.carteras_mi_cuenta),
            seleccionado = seccionActual == SeccionMenu.MI_CUENTA,
            onClick = { onSeccion(SeccionMenu.MI_CUENTA) },
            icono = { Icon(Icons.Default.Person, contentDescription = null) }
        )
        ItemMenu(
            texto = stringResource(if (temaOscuro) R.string.tema_claro else R.string.tema_oscuro),
            onClick = onAlternarTema,
            icono = {
                Icon(
                    painter = painterResource(
                        if (temaOscuro) R.drawable.ic_tema_claro else R.drawable.ic_tema_oscuro
                    ),
                    contentDescription = null
                )
            }
        )

        Spacer(modifier = Modifier.weight(1f))
        HorizontalDivider()
        ItemMenu(
            texto = stringResource(R.string.carteras_cerrar_sesion),
            onClick = onCerrarSesion,
            icono = {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = null
                )
            }
        )
        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun ItemMenu(
    texto: String,
    onClick: () -> Unit,
    icono: @Composable () -> Unit,
    seleccionado: Boolean = false
) {
    NavigationDrawerItem(
        label = { Text(texto) },
        selected = seleccionado,
        onClick = onClick,
        icon = icono,
        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
    )
}
