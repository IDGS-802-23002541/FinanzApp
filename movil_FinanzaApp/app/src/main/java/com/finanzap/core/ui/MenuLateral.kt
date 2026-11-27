package com.finanzap.core.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
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
    ModalDrawerSheet(
        modifier = Modifier.width(296.dp),
        drawerShape = RoundedCornerShape(topEnd = 24.dp, bottomEnd = 24.dp),
        drawerContainerColor = MaterialTheme.colorScheme.surface
    ) {
        EncabezadoMenu()

        Spacer(modifier = Modifier.height(12.dp))

        EtiquetaSeccion(stringResource(R.string.menu_seccion_principal))

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

        Spacer(modifier = Modifier.height(16.dp))
        EtiquetaSeccion(stringResource(R.string.menu_seccion_cuenta))

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
        HorizontalDivider(color = MaterialTheme.colorScheme.outline)
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
        Spacer(modifier = Modifier.height(12.dp))
    }
}

@Composable
private fun EncabezadoMenu() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.primary
    ) {
        Column(modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.tertiary,
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "F",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onTertiary
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = stringResource(R.string.app_name),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = stringResource(R.string.menu_lema),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
private fun EtiquetaSeccion(texto: String) {
    Text(
        text = texto.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(start = 28.dp, top = 8.dp, bottom = 4.dp)
    )
}

@Composable
private fun ItemMenu(
    texto: String,
    onClick: () -> Unit,
    icono: @Composable () -> Unit,
    seleccionado: Boolean = false
) {
    NavigationDrawerItem(
        label = { Text(texto, style = MaterialTheme.typography.bodyMedium) },
        selected = seleccionado,
        onClick = onClick,
        icon = icono,
        shape = RoundedCornerShape(12.dp),
        colors = NavigationDrawerItemDefaults.colors(
            selectedContainerColor = MaterialTheme.colorScheme.primary,
            selectedTextColor = MaterialTheme.colorScheme.onPrimary,
            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
            unselectedTextColor = MaterialTheme.colorScheme.onSurface,
            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant
        ),
        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
    )
}
