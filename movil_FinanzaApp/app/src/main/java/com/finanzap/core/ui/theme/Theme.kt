package com.finanzap.core.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val PrimarioOscuro = Coral
private val SobrePrimarioOscuro = Petroleo

private val LightColorScheme = lightColorScheme(
    primary = Petroleo,
    onPrimary = Blanco,
    secondary = Terracota,
    onSecondary = Blanco,
    tertiary = Coral,
    onTertiary = Petroleo,
    background = Fondo,
    onBackground = Petroleo,
    surface = Blanco,
    onSurface = Petroleo,
    surfaceVariant = SuperficieSuave,
    onSurfaceVariant = TextoSecundario,
    outline = Borde,
    error = Error,
    onError = Blanco,
    errorContainer = ErrorSuave,
    onErrorContainer = Error
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimarioOscuro,
    onPrimary = SobrePrimarioOscuro,
    secondary = Terracota,
    onSecondary = Blanco,
    tertiary = Coral,
    onTertiary = Petroleo,
    background = FondoOscuro,
    onBackground = TextoOscuro,
    surface = SuperficieOscura,
    onSurface = TextoOscuro,
    surfaceVariant = SuperficieSuaveOscura,
    onSurfaceVariant = TextoSecundarioOscuro,
    outline = BordeOscuro,
    error = ErrorOscuro,
    onError = Petroleo,
    errorContainer = ErrorSuaveOscuro,
    onErrorContainer = ErrorOscuro
)

@Composable
fun FinanzAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography,
        content = content
    )
}
