package com.finanzap.core.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

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

private val Formas = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(Dimensiones.RadioTarjeta),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun FinanzAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography,
        shapes = Formas,
        content = content
    )
}
