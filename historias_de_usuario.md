# d. Definición de Historias de Usuario

**Universidad Tecnológica de León**
**Ingeniería en Desarrollo y Gestión de Software · Grupo IDGS1002**

| | |
| --- | --- |
| **Proyecto** | FinanzApp · Plataforma web y móvil de finanzas personales y colaborativas por carteras |
| **Entregable** | d. Definición de historias de usuario (mínimo 8; se documentan 14) |
| **Materias** | Aplicaciones Web Progresivas · Desarrollo Móvil Integral |
| **Metodología** | Kanban (tablero en Taiga) |
| **Integrantes** | Diego Yair Borja Romero · Aideé Vanessa Casillas Tapia · Vanessa Yassmin Rea Muñoz · Antonio Damián Rodríguez Alarcón |
| **Fecha** | 29 de septiembre de 2026 · León, Guanajuato |

---

## Contenido

1. [Introducción](#1-introducción)
2. [Perfiles de usuario (personas)](#2-perfiles-de-usuario-personas)
3. [Método: INVEST y estimación por 4 factores](#3-método-invest-y-estimación-por-4-factores)
4. [Mapa de historias por épica](#4-mapa-de-historias-por-épica)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Resumen de estimación y plan de entregas](#6-resumen-de-estimación)
7. [Matriz de trazabilidad](#7-matriz-de-trazabilidad)
8. [Backlog complementario](#8-backlog-complementario)
9. [Conclusión](#9-conclusión)
10. [Anexo: backlog técnico y reparto para 4 desarrolladores](#10-anexo-backlog-técnico-y-reparto-para-4-desarrolladores)

---

## 1. Introducción

FinanzApp permite gestionar **finanzas personales y colaborativas** mediante *carteras* (espacios compartidos de hogar, viaje o evento). Su arquitectura es dual: la **app móvil** es el punto de registro rápido en campo y el **panel web** es el centro de control analítico (métricas, administración de participantes, cierre y balance final).

Este documento define las **14 historias de usuario principales** del producto (el mínimo solicitado era 8), redactadas **desde el enfoque del usuario** y con el detalle necesario para pasar directamente a implementación:

* Cada historia tiene formato `Como <rol>, quiero <acción>, para <beneficio>`, identificador `HU-xx`, prioridad MoSCoW, personas involucradas y plataformas.
* Cada historia incluye **flujo principal**, **criterios de aceptación verificables (Dado / Cuando / Entonces)**, **reglas de negocio** y **notas de implementación** con los nombres reales de los componentes del prototipo (web y móvil) y el contrato de API previsto para el *backend*.
* Cada historia se evalúa contra los **criterios INVEST** y se estima en **puntos de historia**, ponderando 4 factores: complejidad inherente, duración estimada, volumen de trabajo e incertidumbre/riesgos.

### 1.1 Alcance

| Incluye | No incluye (fases posteriores) |
| --- | --- |
| Los 4 módulos base: *Landing/Login*, *Carteras*, *Contribuyentes* y *Transacciones/Gastos* | Backend real (ASP.NET Core + MongoDB); aquí se define la API prevista |
| Flujos de invitación con QR, unión desde móvil, colaboraciones, cierre con balance y ajustes | Notificaciones *push*, modo *offline* con sincronización, exportación a PDF/CSV |
| Prototipo funcional web (Angular 21 + Tailwind) y app móvil Android (MVVM + Room + Hilt) | Publicación en tiendas y validación con usuarios reales |

### 1.2 Convenciones

* **Perfiles:** `P1`–`P4` (sección 2). Los roles funcionales son **Administrador** (crea la cartera, invita, gestiona y cierra) y **Contribuyente / Miembro** (consulta y registra sus propios movimientos). El `rol` global (`admin` / `miembro`) del modelo de datos se complementa con el rol dentro de cada cartera (`MiembroCartera.rol`).
* **Prioridad:** MoSCoW (`Must` = imprescindible para el MVP; `Should` = importante; `Could` = deseable).
* **Montos:** pesos mexicanos (MXN) con formato `es-MX`; fechas `dd/MM/aaaa`.
* **Traducción a código:** las notas de implementación usan los archivos reales de `finanzapp-web/src/app/...` y la nomenclatura móvil del proyecto (Fragment + ViewModel + Room + Hilt).

---

## 2. Perfiles de usuario (personas)

Los perfiles se derivan de la problemática del proyecto (analfabetismo financiero y descontrol en gastos compartidos) y coinciden con las **4 cuentas de demostración** del prototipo (`diego@finanzapp.mx`, `aidee@finanzapp.mx`, `vanessa@finanzapp.mx` y `antonio@finanzapp.mx`); el resto del *dataset* representa a los contribuyentes invitados.

| Perfil | Rol en FinanzApp | Plataforma principal | Necesidad clave |
| --- | --- | --- | --- |
| **P1 · Diego** (22) | Administrador de carteras (hogar y viajes) | Web (móvil ocasional) | Controlar el presupuesto y cerrar cuentas claras |
| **P2 · Aideé** (23) | Administradora del evento (boda) y de un viaje | Web | Transparencia con la familia y reportes claros |
| **P3 · Vanessa** (21) | Administradora de un hogar y contribuyente en viajes | Móvil (web para su hogar) | Registrar en segundos y saber su saldo |
| **P4 · Damián** (23) | Contribuyente sin carteras propias | Móvil | Unirse por QR sin fricción y saber cuánto le toca |

### 2.1 Descripción narrativa

**P1 · Diego — "el organizador".** Estudiante de IDGS; organiza el *Viaje a Cancún* con amigos y coordina los gastos de *Casa Borja*. Usa el panel web para planear, revisar avances por semana y cerrar cuentas; en el móvil registra gastos cuando está fuera. Su meta es que **nadie quede debiendo ni pagando de más**. Le frustran las hojas de cálculo que nadie actualiza y no saber quién pagó qué.

**P2 · Aideé — "la anfitriona del evento".** Organiza su boda con un presupuesto alto y muchos contribuyentes (familia de ambos lados). Necesita **reportes, transparencia e imprimibles** para mostrar en juntas familiares. Su meta es cerrar el evento **sin discusiones ni desconfianza**; le frustra la falta de comprobantes.

**P3 · Vanessa — "la administradora del hogar".** Administra *Casa de la Abuela* y a la vez participa como contribuyente en *Viaje a Cancún* y *Viaje a Mazatlán*. Registra gastos al momento (gasolina, comida) desde el celular y consulta su saldo. Su meta es **registrar en segundos y saber si está al corriente**; le frustran los formularios largos y los saldos que no entiende.

**P4 · Damián — "el contribuyente móvil".** Participa en *Viaje a Cancún* y en la *Posada Equipo IDGS*, pero **no administra ninguna cartera**. Se integra por invitación (QR o enlace de WhatsApp), registra sus gastos desde el celular y quiere saber cuánto lleva pagado. Su meta es **unirse y registrar sin aprender una app nueva**; le frustran los registros largos y los códigos que "no sirven".

> **Implicación de diseño:** para P3 y P4, que registran en campo desde el móvil, las historias de unión y registro deben resolverse con **pocos toques**, lenguaje llano y mensajes de error que digan qué hacer, no solo qué falló.

---

## 3. Método: INVEST y estimación por 4 factores

### 3.1 Criterios INVEST

Toda historia de la sección 5 se evalúa contra esta lista; la verificación puntual se incluye en cada historia.

| Criterio | Pregunta que responde |
| --- | --- |
| **I**ndependiente | ¿Se puede desarrollar sin depender de que otra historia esté terminada? |
| **N**egociable | ¿Los detalles de la solución están abiertos (no es un contrato cerrado)? |
| **V**aliosa | ¿Entrega un beneficio claro y observable para la persona usuaria? |
| **E**stimable | ¿Se entiende lo suficiente para asignarle puntos? |
| **S**mall (pequeña) | ¿Cabe en una iteración (≤ 1 semana de trabajo; si no, se divide)? |
| **T**estable | ¿Se puede comprobar con criterios de aceptación concretos? |

### 3.2 Factores de ponderación

Se usa una escala **1–5** por factor y pesos que suman 100 %. La estimación se hizo por consenso del equipo (Planning Poker simplificado) sobre el alcance descrito en cada historia.

| Factor | Peso | Qué mide | Valor 1 (bajo) | Valor 5 (alto) |
| --- | ---: | --- | --- | --- |
| **C · Complejidad inherente** | 30 % | Dificultad técnica/analítica de la tarea | Pantalla o CRUD simple; sin lógica | Algoritmos, reglas de negocio entrelazadas, concurrencia |
| **D · Duración estimada** | 20 % | Tiempo ideal de desarrollo, pruebas y ajustes | ≤ ½ día | ≥ 5 días |
| **V · Volumen de trabajo** | 25 % | Cantidad de artefactos a construir (pantallas, componentes, servicios, endpoints, pruebas) | 1 componente / 1 capa | Varias pantallas y capas (UI + estado + persistencia + API + pruebas) |
| **I · Incertidumbre y riesgos** | 25 % | Dudas de requisitos y riesgos técnicos/externos | Todo definido, sin dependencias | Requisitos ambiguos, hardware, terceros o APIs externas |

> **Duración vs. volumen:** son factores distintos. Una tarea puede ser *corta* pero *voluminosa* (muchos elementos repetitivos) o *larga* con poco volumen (esperas o pruebas en dispositivos físicos, como el escaneo QR).

### 3.3 Cálculo y conversión a puntos de historia

```
S = 0.30·C + 0.20·D + 0.25·V + 0.25·I          (rango 1.00 – 5.00)

Ejemplo HU-07 (unión por QR): S = 0.30·4 + 0.20·4 + 0.25·4 + 0.25·4 = 4.00
```

El índice `S` se convierte a la serie de Fibonacci usada en el tablero:

| Índice S | Puntos | Lectura (1 punto ≈ ½ jornada ideal de un integrante) |
| --- | :---: | --- |
| 1.00 – 1.50 | **1** | Trivial; menos de medio día |
| 1.51 – 2.20 | **2** | ~1 día |
| 2.21 – 3.00 | **3** | 1.5 – 2 días |
| 3.01 – 3.80 | **5** | 2.5 – 3.5 días |
| 3.81 – 4.50 | **8** | ~1 semana; vigilar tamaño |
| 4.51 – 5.00 | **13** | ~2 semanas; **dividir antes de iniciar** |

**Supuestos de estimación**

* 1 punto ≈ media jornada ideal (4 h) de un integrante.
* Equipo de 4 integrantes con dedicación parcial (~2 h/día hábiles).
* El prototipo trabaja con datos estáticos; las estimaciones cubren frontend web y app móvil, dejando las firmas de servicio listas para conectar la API real.
* No incluyen despliegue a tiendas ni pruebas de usuario formales.

### 3.4 Definition of Ready / Definition of Done

**Lista para desarrollar (Ready):** formato Como/Quiero/Para; criterios de aceptación escritos; estimada en el tablero; sin dependencias bloqueantes; pantallas o *wireframes* identificados; entidades y endpoints previstos; datos demo disponibles.

**Terminada (Done):** código integrado a la rama principal y revisado por un compañero; criterios de aceptación verificados; las funciones puras nuevas o modificadas (`core/utils/finanzas.ts`) cuentan con pruebas unitarias de casos límite (centavos impares y tolerancias); `ng build` sin errores y consola sin errores en los flujos; diseño responsivo (390 px y 1440 px); accesibilidad básica (etiquetas, foco visible, contraste AA); datos demo consistentes; documentación (`README`/propuesta) actualizada; demo mostrada al equipo y tarjeta en "Concluido" de Taiga.

---

## 4. Mapa de historias por épica

| Épica | Objetivo de negocio | Historias | Puntos |
| --- | --- | --- | ---: |
| **E1 · Acceso y cuentas** | Que cualquier persona entre y mantenga su cuenta segura | HU-01, HU-02, HU-14 | 6 |
| **E2 · Carteras** | Crear, consultar y archivar los espacios compartidos | HU-03, HU-04, HU-05, HU-13 | 13 |
| **E3 · Contribuyentes e invitaciones** | Incorporar personas por QR y administrar su participación | HU-06, HU-07, HU-08, HU-11 | 17 |
| **E4 · Transacciones** | Registrar y gestionar ingresos y gastos con confianza | HU-09, HU-10 | 6 |
| **E5 · Cierre** | Terminar con cuentas claras y mínimas transferencias | HU-12 | 8 |
| | | **Total** | **50** |

---

## 5. Historias de usuario

Las 14 historias siguen la misma plantilla: ficha rápida → contexto → flujo → criterios de aceptación → reglas de negocio → notas de implementación → INVEST → estimación.

---

### HU-01 · Iniciar sesión y conservar la sesión

> **Como** usuario registrado (P1–P4), **quiero** iniciar sesión con mi correo y contraseña y que la sesión se conserve al recargar, **para** entrar a mis carteras sin autenticarme en cada visita.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **2** |
| **Personas** | P1, P2, P3, P4 |
| **Plataformas** | Web y móvil |
| **Épica** | E1 · Acceso y cuentas |
| **Depende de** | HU-02 (para cuentas nuevas) |

**Contexto.** Es la puerta de entrada a todo el producto. Diego y Aideé la usan a diario en la web; Vanessa y Damián desde el móvil, muchas veces antes de registrar un gasto. Debe ser rápida, tolerante a errores de escritura y recordar la sesión.

**Flujo principal**

1. La persona abre `/login` (o la pantalla *Login* en móvil) e introduce correo y contraseña.
2. El sistema valida el formato en línea y, al enviar, verifica credenciales.
3. Con credenciales válidas, se crea la sesión y se le dirige a *Carteras* (o a la ruta que intentaba abrir: `/login?destino=…`).
4. Si las credenciales fallan, se muestra un mensaje claro sin salir del formulario y conservando el correo escrito.
5. Al recargar o reabrir la app, la sesión sigue activa hasta que la persona cierre sesión.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Una persona con cuenta registrada | Introduce correo y contraseña válidos | Accede al panel y ve su nombre en la barra superior |
| 2 | Credenciales incorrectas | Intenta entrar | Ve "Correo o contraseña incorrectos" sin revelar cuál dato falló |
| 3 | Una sesión activa | Recarga el navegador o reabre la app | Continúa autenticado en la misma vista |
| 4 | Una persona sin sesión | Abre una ruta `/app/…` | Es enviada a `/login?destino=…` y, tras entrar, regresa a esa ruta |
| 5 | Un correo mal formado | Escribe en el campo | Ve el error junto al campo y el botón queda deshabilitado hasta corregir |
| 6 | Una persona autenticada | Pulsa "Cerrar sesión" (en Ajustes) | Su sesión se elimina y se le envía a la landing |

**Reglas de negocio**

* El correo se normaliza a minúsculas y se ignora el espacio inicial/final.
* El mensaje de error no distingue entre "correo no existe" y "contraseña incorrecta" (evita enumerar cuentas).
* El prototipo persiste solo el `idUsuario` en `localStorage` (`finanzapp.sesion`); en producción se usará JWT con expiración.
* En móvil, la sesión se guarda de forma segura y se pedirá bloqueo por PIN/biometría solo si la persona lo activa (fase posterior).

**Notas de implementación**

* **Web:** `features/auth/login.ts` + `core/services/auth.service.ts` (`login`, `salir`, signals `usuario` y `autenticado`) + `core/guards/auth.guard.ts`; redirección con `Router.navigate` respetando `destino`.
* **Móvil:** `LoginFragment` + `LoginViewModel` con `StateFlow` (`correo`, `contrasena`, `cargando`, `error`); navegación con `Navigation Component`; sesión en `DataStore`.
* **API prevista:** `POST /api/auth/login` → `{ token, usuario }`; `POST /api/auth/logout`.
* **Casos borde:** bloqueo temporal tras 5 intentos fallidos; sesión caducada al abrir la app; correo con mayúsculas o acentos.

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Se puede desarrollar con el dataset demo, sin esperar a HU-02. |
| Negociable | El tipo de sesión (local/JWT) se decide al integrar el backend. |
| Valiosa | Sin ella no hay acceso al producto; es el requisito habilitante. |
| Estimable | Formulario, guard y persistencia conocidos. |
| Pequeña | Cabe en 1 día; no requiere división. |
| Testable | Los 6 criterios se verifican manualmente y con *smoke test*. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | :---: | --- | ---: |
| Complejidad inherente | 30 % | 2 | Formulario + guard + persistencia; sin lógica financiera | 0.60 |
| Duración estimada | 20 % | 2 | ~1 día incluyendo validaciones y pruebas | 0.40 |
| Volumen de trabajo | 25 % | 2 | 1 vista web, 1 pantalla móvil, 1 servicio, 1 guard | 0.50 |
| Incertidumbre y riesgos | 25 % | 2 | Requisitos claros; la migración a JWT es una fase aparte | 0.50 |
| **Total (S)** | **100 %** | | | **2.00 → 2 puntos** |

---

### HU-02 · Crear una cuenta nueva

> **Como** persona invitada que aún no tiene cuenta (P4 y personas nuevas), **quiero** registrarme con mis datos básicos en menos de un minuto, **para** unirme a una cartera sin pasar por un proceso largo.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **2** |
| **Personas** | P4 (y personas nuevas) |
| **Plataformas** | Web y móvil |
| **Épica** | E1 · Acceso y cuentas |
| **Depende de** | — |

**Contexto.** Damián se integra a los grupos por invitación y no quiere aprender una app nueva: el registro debe pedir **solo lo indispensable** (nombre, apellidos, correo, contraseña y teléfono opcional) y dejar a la persona autenticada al terminar.

**Flujo principal**

1. La persona llega a `/registro` (o a la pantalla *Registro*) desde la landing o desde el flujo de unión por QR.
2. Escribe sus datos; el sistema valida en línea (campos obligatorios, formato de correo, contraseña mínima, confirmación).
3. Al enviar, se verifica que el correo no exista y se crea la cuenta.
4. Se inicia sesión automáticamente y se continúa al destino original (por ejemplo, la pantalla de unión a la cartera con el código ya capturado).

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un formulario completo y válido | Envía el registro | Su cuenta se crea y queda autenticado en el sistema |
| 2 | Un correo ya registrado | Intenta registrarse | Ve "Ese correo ya tiene una cuenta" y un acceso directo a iniciar sesión |
| 3 | Una contraseña de menos de 6 caracteres o sin confirmar | Envía | El error se muestra junto al campo y no se crea la cuenta |
| 4 | Un teléfono con formato inválido | Envía | Se le indica el formato esperado (10 dígitos, México) |
| 5 | Un registro iniciado desde el QR | Termina de registrarse | Continúa al flujo de unión **sin volver a capturar el código** |
| 6 | Campos vacíos | Envía | El botón permanece deshabilitado y no hay errores de consola |

**Reglas de negocio**

* El correo es único en el sistema (sin distinguir mayúsculas).
* Contraseña: mínimo 6 caracteres con al menos una letra y un número.
* El rol global por defecto es `miembro`; quien crea una cartera obtiene el rol de **administrador dentro de esa cartera** (`MiembroCartera.rol`).
* Los datos personales se guardan completos, pero ante otros miembros solo se muestra nombre y color de avatar (ver HU-11).
* En producción, la contraseña nunca viaja ni se guarda en claro: se almacena con *hash* (Argon2/bcrypt) en el servidor.

**Notas de implementación**

* **Web:** `features/auth/registro.ts` + `auth.service.registrar()` + `usuarios.service.registrarNuevo()`; validaciones con Reactive Forms.
* **Móvil:** `RegistroFragment` + `RegistroViewModel` (`StateFlow` con errores por campo); conservar el código de invitación en `SavedStateHandle` si se viene del QR.
* **API prevista:** `POST /api/usuarios` → `201 Created`; error `409 Conflict` si el correo existe.
* **Casos borde:** doble envío con doble *tap* (deshabilitar botón mientras guarda); correo con espacios; nombre con acentos.

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Solo depende de que exista el servicio de usuarios (ya en el prototipo). |
| Negociable | Campos exactos y política de contraseña se ajustan con seguridad. |
| Valiosa | Habilita la adopción de personas nuevas (P4 y personas invitadas) sin trabajo manual del admin. |
| Estimable | Formulario estándar con validaciones conocidas. |
| Pequeña | 1 día. |
| Testable | Criterios verificables campo por campo. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 2 | Validaciones y unicidad; sin algoritmos | 0.60 |
| Duración estimada | 20 % | 2 | ~1 día | 0.40 |
| Volumen de trabajo | 25 % | 2 | Formulario + servicio + enlace con login automático | 0.50 |
| Incertidumbre y riesgos | 25 % | 1 | Flujo totalmente definido, sin dependencias externas | 0.25 |
| **Total (S)** | **100 %** | | | **1.75 → 2 puntos** |

---

### HU-03 · Panel de bienvenida con mis carteras y colaboraciones

> **Como** usuario (P1–P4), **quiero** que al entrar vea mis carteras activas y aquellas en las que participo, con sus indicadores clave, **para** retomar mi trabajo en un clic.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Should |
| **Puntos** | **3** |
| **Personas** | P1, P2, P3, P4 |
| **Plataformas** | Web (consulta móvil en fase posterior) |
| **Épica** | E2 · Carteras |
| **Depende de** | HU-01, HU-04 |

**Contexto.** Es la pantalla de aterrizaje después del login. Por decisión de diseño **no mezcla métricas globales de todas las carteras**: presenta dos bloques de trabajo (*Mis carteras* y *Carteras en las que participo*) y las gráficas se consultan dentro de cada cartera. Así se evita ruido y se sigue la lógica mental del usuario: "mis cosas" y "lo compartido". Damián, que no administra ninguna cartera, solo ve el bloque de compartidas.

**Flujo principal**

1. Tras iniciar sesión, la persona llega al inicio y ve el saludo con su nombre.
2. En **Mis carteras** (activas que administra) ve tarjetas con categoría, fechas, integrantes, avance del presupuesto, gasto, número de movimientos y acceso al detalle.
3. En **Carteras en las que participo** ve tarjetas de carteras de otros con administrador, "mi pagado", "mi cuota", "mi saldo", avance y un botón de registro rápido de gasto.
4. Si no tiene carteras, ve un estado vacío con acciones sugeridas: *Nueva cartera* y *Unirse con QR*.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un usuario con carteras propias y compartidas | Entra al inicio | Ve ambos bloques con sus tarjetas pobladas |
| 2 | Una tarjeta de cartera propia | La selecciona | Abre el detalle de esa cartera |
| 3 | Una tarjeta de colaboración | Pulsa "Registrar gasto" | Se abre el formulario con cartera y usuario preseleccionados |
| 4 | Un usuario nuevo sin carteras | Entra al inicio | Ve el estado vacío con las dos acciones sugeridas |
| 5 | Una cartera archivada | Consulta el inicio | No aparece; solo se ve en *Inactivas* |
| 6 | Vista en móvil (390 px) | Navega con gestos | Las tarjetas se apilan en una columna y hay barra inferior |

**Reglas de negocio**

* Solo se muestran carteras **activas**; el orden es por fecha de creación descendente.
* Los indicadores provienen de las funciones puras de cálculo (sin cálculos duplicados en la vista).
* Un miembro solo ve carteras donde está dado de alta como miembro.

**Notas de implementación**

* **Web:** componente de inicio (`features/dashboard/inicio.ts`) con `StatCard`, `ProgressBar` y `Avatar`; servicios `carteras.service.ts` (`misCarteras`, `colaboracionesDe`) y `finanzas.ts` para el avance por tarjeta. En el prototipo actual, esta vista se despliega como las pestañas **"Mis carteras" / "Compartidas"** de `/app/carteras` (`lista.ts`), que es la evolución del mismo contenido.
* **API prevista:** `GET /api/carteras?usuario=me&estado=activa`.
* **Casos borde:** cartera sin presupuesto (el avance se oculta y se muestra solo el gasto); miembro sin movimientos (badge "sin movimientos").

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Depende de datos de carteras, pero puede maquetarse con el dataset demo. |
| Negociable | La composición exacta de cada tarjeta admite ajustes. |
| Valiosa | Reduce a un clic el acceso al trabajo diario. |
| Estimable | Se conocen componentes y datos. |
| Pequeña | 3 puntos; cabe en la iteración 2. |
| Testable | Criterios observables en pantalla. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 2 | Tarjetas con cálculos ya existentes en utilidades | 0.60 |
| Duración estimada | 20 % | 2 | ~1 día | 0.40 |
| Volumen de trabajo | 25 % | 3 | Dos bloques, tarjetas, estados vacíos y accesos directos | 0.75 |
| Incertidumbre y riesgos | 25 % | 2 | Qué indicador mostrar en cada tarjeta puede iterar | 0.50 |
| **Total (S)** | **100 %** | | | **2.25 → 3 puntos** |

---

### HU-04 · Crear y administrar carteras

> **Como** administrador (P1, P2, P3), **quiero** crear carteras de hogar, viaje o evento con presupuesto, fechas y descripción, y poder editarlas, archivarlas o eliminarlas, **para** organizar el dinero del grupo en un solo lugar.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **3** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web (creación); móvil en fase 2 |
| **Épica** | E2 · Carteras |
| **Depende de** | HU-01 |

**Contexto.** Es el corazón del producto: sin cartera no hay nada que compartir. Diego crea una cartera por viaje; Aideé, una para la boda; Vanessa, una permanente para el hogar. La categoría cambia el comportamiento: *Viaje* y *Evento* manejan **fechas de inicio y fin**, mientras *Hogar* es continua.

**Flujo principal**

1. Desde *Carteras*, la persona pulsa **Nueva cartera**.
2. Captura nombre, categoría, descripción, presupuesto (opcional) y, si es viaje/evento, fechas.
3. Al guardar, el sistema valida y crea la cartera; quien la crea queda como administrador con aporte comprometido opcional.
4. Desde la tarjeta o el detalle puede editar, archivar (pasa a *Inactivas*) o eliminar.
5. Al eliminar, si existen movimientos, el sistema sugiere archivar en lugar de borrar para no perder el histórico.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un formulario completo y válido | Guarda | La cartera aparece en "Mis carteras" con su color y categoría |
| 2 | Categoría Viaje o Evento | Intenta guardar sin fechas | El sistema exige fecha de inicio y fin |
| 3 | Fecha de fin anterior al inicio | Guarda | Ve el error y no se crea la cartera |
| 4 | Presupuesto vacío | Guarda | La cartera se crea sin presupuesto (avance no disponible) |
| 5 | Una cartera con movimientos | Pulsa "Eliminar" | Se le advierte y se sugiere archivar; no se elimina sin confirmación |
| 6 | Una persona que no administra la cartera | Abre el detalle | No ve acciones de edición, archivo ni eliminación |
| 7 | Nombres duplicados del mismo propietario | Guarda | Se le advierte que ya existe una cartera con ese nombre, sin bloquear |

**Reglas de negocio**

* Nombre obligatorio (3–60 caracteres); descripción ≤ 200 caracteres.
* Presupuesto inicial opcional, mayor que 0; en MXN.
* `fechaFin ≥ fechaInicio`; ambos campos requeridos para *Viaje* y *Evento*, opcionales para *Hogar*.
* Estado inicial `activa`; toda cartera tiene un `codigoInvitacion` desde su creación (ver HU-06).
* Solo el propietario o un administrador de la cartera pueden editar, archivar o eliminar.

**Notas de implementación**

* **Web:** `features/carteras/lista.ts`, `cartera-form.ts`; `CarterasService.crear/actualizar/archivar/eliminar`; modelo `Cartera` + `CategoriaCartera`; confirmaciones con `ConfirmModal`.
* **API prevista:** `POST /api/carteras`, `PUT /api/carteras/{id}`, `PATCH /api/carteras/{id}/archivar`, `DELETE /api/carteras/{id}`.
* **Autorización:** el backend valida la pertenencia y el rol, nunca la UI por sí sola.
* **Casos borde:** cartera archivada intentando editar (bloqueada); eliminar la última cartera activa (permitido, con estado vacío claro).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Solo requiere sesión y catálogo de categorías. |
| Negociable | Reglas de duplicados y de borrado pueden ajustarse. |
| Valiosa | Habilita todo el flujo colaborativo. |
| Estimable | CRUD conocido con reglas definidas. |
| Pequeña | 3 puntos; si creciera, se separa "crear" de "editar/archivar". |
| Testable | Los 7 criterios se prueban con el *smoke test* existente. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | Reglas por categoría, presupuesto opcional, permisos y estados | 0.90 |
| Duración estimada | 20 % | 3 | 1.5 – 2 días | 0.60 |
| Volumen de trabajo | 25 % | 3 | Lista + formulario + edición + archivo + eliminación | 0.75 |
| Incertidumbre y riesgos | 25 % | 2 | Reglas de borrado por afinar; propuesta ya definida | 0.50 |
| **Total (S)** | **100 %** | | | **2.75 → 3 puntos** |

---

### HU-05 · Consultar el resumen y las estadísticas de una cartera

> **Como** administrador (P1, P2), **quiero** ver en una sola vista cuánto se ha gastado, cuánto queda y cómo se reparte el gasto, **para** detectar desviaciones del presupuesto a tiempo.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Should |
| **Puntos** | **5** |
| **Personas** | P1, P2 (también P3 para consulta) |
| **Plataformas** | Web |
| **Épica** | E2 · Carteras |
| **Depende de** | HU-04, HU-09 |

**Contexto.** Es el valor diferencial del panel web: convertir cientos de movimientos en decisiones. Aideé necesita ver la evolución mensual de la boda; Diego, qué porcentaje del presupuesto del viaje se ha consumido y en qué categorías.

**Flujo principal**

1. La persona abre el detalle de una cartera y entra a la pestaña **Resumen**.
2. Ve 4 tarjetas KPI (presupuesto, gastado, disponible y movimientos) y el avance del presupuesto.
3. Consulta la gráfica de barras de los últimos 6 meses (gastos vs. ingresos).
4. Revisa la dona de gasto por categoría (top 6), el ranking de pagos por contribuyente y los últimos movimientos.
5. Puede saltar a *Movimientos* o *Cierre y balance* con un clic.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Una cartera con movimientos | Abre la pestaña Resumen | Los 4 KPI coinciden con la suma de sus movimientos |
| 2 | Presupuesto inicial definido | Observa el avance | Se muestra porcentaje y color; a partir del 90 % cambia a alerta |
| 3 | Gastos en varias categorías | Observa la dona | Ve el top 6 por monto con porcentajes que suman 100 % |
| 4 | Movimientos en 6 meses | Observa la gráfica de barras | Cada mes muestra gasto e ingreso en formato compacto (k/M) |
| 5 | Una cartera sin movimientos | Abre Resumen | KPIs en cero y estado vacío que invita a registrar el primer movimiento |
| 6 | Cambio de tamaño de pantalla | Redimensiona | Las gráficas y tarjetas se reorganizan sin desbordarse |

**Reglas de negocio**

* `disponible = presupuestoInicial − totalGastos` (puede ser negativo y se muestra en rojo).
* La cuota por miembro es `totalGastos / número de miembros` (base del cierre en HU-12).
* Los cálculos son **funciones puras** compartibles entre web y móvil; no se duplican en componentes.
* Montos en MXN y etiquetas en español (`es-MX`).

**Notas de implementación**

* **Web:** pestaña Resumen de `features/carteras/detalle.ts`; `core/utils/finanzas.ts` (`calcularResumen`, `serieMensual`, `gastosPorCategoria`, `avancePresupuesto`); gráficas propias en `shared/charts.ts` (`BarChart`, `DonutChart`) y `StatCard`.
* **Rendimiento:** los cálculos son O(n) sobre los movimientos de la cartera (391 en el dataset demo); si creciera, se paginaría o agregaría en el servidor.
* **API prevista:** `GET /api/carteras/{id}/resumen` (el servidor puede devolver series ya agregadas).
* **Casos borde:** montos negativos; meses sin datos (barras en cero); cartera sin presupuesto (se usa el total de ingresos como base de referencia).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Usa los movimientos existentes; puede maquetarse con datos demo. |
| Negociable | Tipos de gráfica y métricas pueden evolucionar. |
| Valiosa | Es la promesa del "centro de control analítico". |
| Estimable | Métricas y componentes identificados. |
| Pequeña | 5 puntos: al límite; si se agregan reportes, dividir. |
| Testable | Los totales se contrastan con los movimientos y suman cero en saldos. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 4 | Agregados, serie temporal, dona, ranking y cuota por miembro | 1.20 |
| Duración estimada | 20 % | 3 | ~2 días incluyendo validación visual | 0.60 |
| Volumen de trabajo | 25 % | 4 | 4 KPI + 2 gráficas + ranking + últimos movimientos + pruebas | 1.00 |
| Incertidumbre y riesgos | 25 % | 3 | Definición de métricas iterable; formato de cifras y rendimiento | 0.75 |
| **Total (S)** | **100 %** | | | **3.55 → 5 puntos** |

---

### HU-06 · Invitar contribuyentes con QR y clave única

> **Como** administrador (P1, P2, P3), **quiero** generar un código QR y una clave única y compartirlos por WhatsApp, **para** que mis amigos y familiares se unan a la cartera sin que yo los registre a mano.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **3** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web |
| **Épica** | E3 · Contribuyentes e invitaciones |
| **Depende de** | HU-04 |

**Contexto.** La incorporación de personas es el momento más crítico de la colaboración. El QR elimina el "pásame tus datos" y el alta manual: Diego lo comparte en el grupo de WhatsApp; Aideé lo imprime en las invitaciones.

**Flujo principal**

1. La persona abre la cartera, pestaña **Invitación QR**.
2. El sistema muestra el QR (generado localmente) y la clave única en texto grande.
3. Puede **copiar la clave**, **compartir** con la hoja nativa del dispositivo (con respaldo de copiado si no está disponible) o **descargar/imprimir** el QR.
4. Si la clave se filtró, pulsa **Regenerar**: se invalida la anterior y se genera un par nuevo.
5. El enlace codificado tiene el formato `finanzapp.mx/unirse?codigo=XXXX-XXXX` (contrato compartido con la app móvil).

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Una cartera activa | Abre la pestaña QR | Ve un QR válido (imagen generada) y la clave en texto |
| 2 | El QR visible | Pulsa "Copiar clave" | La clave queda en el portapapeles y aparece un aviso de confirmación |
| 3 | Un dispositivo con Web Share API | Pulsa "Compartir" | Se abre la hoja nativa con el enlace de invitación |
| 4 | Un dispositivo sin Web Share API | Pulsa "Compartir" | El enlace se copia y se avisa por notificación |
| 5 | Una clave regenerada | Comparte el enlace anterior | El enlace anterior ya no permite unirse |
| 6 | Una persona que no administra | Abre la pestaña | Ve la invitación en modo solo lectura (sin regenerar) |

**Reglas de negocio**

* Clave alfabética de 8 caracteres sin caracteres ambiguos (sin `O/0`, `I/1`).
* El código es único por cartera y válido hasta que se regenere o la cartera se cierre.
* Regenerar invalida el código anterior de inmediato (los enlaces ya compartidos dejan de servir).
* La generación del QR ocurre en el cliente (librería `qrcode`), sin llamadas a servicios externos.
* La invitación nunca expone datos personales de los miembros actuales.

**Notas de implementación**

* **Web:** pestaña Invitación de `detalle.ts`; `CarterasService.regenerarCodigo(id)`; `qrcode` renderizado a *data URL*; `navigator.share` con `try/catch` y respaldo `navigator.clipboard`; toast de confirmación.
* **API prevista:** `POST /api/carteras/{id}/invitacion` (regenerar) y validación del código en `POST /api/carteras/unirse`.
* **Casos borde:** cartera cerrada (no se puede invitar); intento de copiar en navegadores sin permiso de portapapeles (mensaje alterno para copiar a mano); impresión en blanco y negro (el QR debe seguir siendo legible).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Solo depende de que exista la cartera. |
| Negociable | Formato del código y del enlace son acordables con móvil. |
| Valiosa | Habilita la colaboración sin captura manual de datos. |
| Estimable | Librería local y API web conocidas. |
| Pequeña | 3 puntos. |
| Testable | Se verifica escaneando el QR desde un teléfono real. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | QR + clave + compartir + regeneración con invalidación | 0.90 |
| Duración estimada | 20 % | 2 | ~1 día | 0.40 |
| Volumen de trabajo | 25 % | 3 | QR, enlace, copiar, compartir, regenerar (UI + servicio) | 0.75 |
| Incertidumbre y riesgos | 25 % | 3 | Soporte variable de Web Share; legibilidad del QR; contrato del enlace | 0.75 |
| **Total (S)** | **100 %** | | | **2.80 → 3 puntos** |

---

### HU-07 · Unirme a una cartera escaneando el QR (móvil)

> **Como** contribuyente invitado (P1, P3, P4), **quiero** escanear el QR, abrir el enlace que me compartieron o escribir el código a mano, **para** entrar a la cartera del grupo en segundos.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **8** |
| **Personas** | P1, P3, P4 |
| **Plataformas** | Móvil |
| **Épica** | E3 · Contribuyentes e invitaciones |
| **Depende de** | HU-06 (generación del código) |

**Contexto.** Es el diferenciador móvil del proyecto: unirse **escaneando**, sin capturar datos de la cartera. Damián recibe el enlace por WhatsApp y quiere entrar cuanto antes; el flujo debe resolver el registro (si hace falta) y la incorporación **sin perder el código** en el camino.

**Flujo principal**

1. La persona abre *Unirse a cartera* desde el inicio o llega por el *deep link* del enlace.
2. Si viene por enlace, el código ya está capturado; si no, se abre la cámara con un marco guía para escanear el QR. La pantalla **siempre** ofrece también la captura manual del código, visible desde el día 1 de la Iteración 1 (no se espera al final del desarrollo).
3. Si la cámara no está disponible (emulador sin cámara física, permiso denegado o QR dañado), la persona escribe el código a mano y el flujo continúa por **el mismo camino** que el escaneo.
4. Si no hay sesión, se le pide registrarse o iniciar sesión y, al terminar, **el flujo continúa con el mismo código**.
5. El sistema valida el código (existente, activo y no regenerado).
6. Se muestra una confirmación con el nombre de la cartera, el administrador, la categoría y las fechas.
7. Al confirmar, la persona queda como miembro y la cartera aparece en su inicio.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un QR válido frente a la cámara | Se enfoca | Se lee y avanza automáticamente a la validación |
| 2 | Permiso de cámara denegado | Abre la pantalla | Ve una explicación y la opción de pegar el código o abrir el enlace a mano |
| 3 | Un emulador o dispositivo sin cámara física | Abre la pantalla | La captura manual del código está habilitada y completa el flujo sin cámara, con los mismos estados y mensajes |
| 4 | Un código inexistente o regenerado | Valida | Ve "La invitación ya no es válida; pide un nuevo código al administrador" |
| 5 | Sin sesión iniciada | Escanea (o captura) un código válido | Se registra o entra y **conserva el código**; al terminar se une sin repetir pasos |
| 6 | Una persona ya miembro | Escanea de nuevo | Se le indica que ya pertenece a la cartera; no se duplica la membresía |
| 7 | Un código válido | Confirma la unión | La cartera aparece en su inicio con su rol de miembro |
| 8 | Un código de una cartera cerrada | Valida | Se le indica que la cartera ya finalizó y no admite nuevos miembros |

**Reglas de negocio**

* La validación del código se hace **en el servidor** (el móvil no decide por sí solo).
* La unión no requiere aprobación del administrador (auto-ingreso con notificación posterior al admin).
* El aporte comprometido inicia vacío (`null`) y el admin puede editarlo después (HU-08).
* Un miembro no puede unirse dos veces a la misma cartera (clave única `idCartera + idUsuario`).
* Si la persona llegó por enlace, el código se conserva aunque se cierre la app a la mitad del registro.
* La captura manual del código es un **camino de primera clase**, no un parche: se implementa desde el día 1 de la Iteración 1 en los mismos componentes de UI, para no bloquear las pruebas en emuladores sin cámara física.

**Notas de implementación**

* **Móvil:** `UnirseFragment` + `UnirseViewModel` con `StateFlow` de estados (`escaneando`, `capturando`, `validando`, `confirmar`, `exito`, `error`); el escáner se aísla tras una interfaz (`EscannerCodigo`) con implementación **CameraX + ML Kit Barcode Scanning** (alternativa ZXing) y una implementación *fake* para pruebas automatizadas; el campo de **captura manual** se conecta al mismo `UnirseViewModel` y se construye **desde el día 1 de la Iteración 1**; código guardado en `SavedStateHandle`; `Room` para persistir la membresía tras la respuesta del servidor; navegación con *deep link* `finanzapp.mx/unirse`.
* **API prevista:** `POST /api/carteras/unirse` con `{ codigo }` → `{ cartera, miembro }`; errores `404` (código inválido), `409` (ya es miembro), `410` (cartera cerrada).
* **Casos borde:** códigos con reflexión o baja luz (se ofrece la captura manual); **emulador o dispositivo sin cámara física (rama manual habilitada desde el día 1)**; códigos de otras apps (ignorar y seguir escaneando); doble confirmación por doble *tap*.

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Puede desarrollarse contra el código generado en HU-06, sin esperar el resto del móvil. |
| Negociable | Tecnología de escaneo y UX de permisos son negociables. |
| Valiosa | Es el flujo más valorado por el usuario móvil: unirse sin fricción. |
| Estimable | Alcance y riesgos identificados. |
| Pequeña | **8 puntos: se recomienda dividir** en (a) escáner + lectura **y captura manual**, (b) validación + membresía, (c) errores y continuidad con registro. |
| Testable | La rama manual permite verificar el flujo completo en emulador; la cámara se valida en dispositivo físico, criterio por criterio. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 4 | Cámara, permisos, deep link, validación y estados de error | 1.20 |
| Duración estimada | 20 % | 4 | 3 – 4 días con pruebas en dispositivos | 0.80 |
| Volumen de trabajo | 25 % | 4 | Escáner + captura manual + confirmación + ViewModel + repositorio + endpoint + permisos | 1.00 |
| Incertidumbre y riesgos | 25 % | 4 | Hardware/permisos variables, dispositivos Android diversos, QR dañados | 1.00 |
| **Total (S)** | **100 %** | | | **4.00 → 8 puntos** |

---

### HU-08 · Administrar los contribuyentes de una cartera

> **Como** administrador (P1, P2, P3), **quiero** dar de alta contribuyentes (existentes o nuevos), consultarlos con filtro y darlos de baja, **para** mantener actualizada la lista de participantes y sus aportaciones.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **3** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web |
| **Épica** | E3 · Contribuyentes e invitaciones |
| **Depende de** | HU-04 |

**Contexto.** No todas las personas llegan por QR: Aideé necesita dar de alta a su tía que no usa la app. El administrador puede **buscar un usuario existente** o **crear una persona nueva** (que quedará registrada) e indicar el aporte comprometido. También debe poder dar de baja con seguridad.

**Flujo principal**

1. La persona abre la pestaña **Contribuyentes** de la cartera (o el módulo global *Contribuyentes*).
2. Ve la tabla con nombre, contacto, rol, aporte comprometido, movimientos y saldo.
3. Pulsa **Agregar contribuyente**: busca por nombre/correo un usuario existente o captura una persona nueva.
4. Define el aporte comprometido (opcional) y confirma el alta.
5. Para dar de baja, selecciona el miembro, revisa la confirmación con su saldo y confirma la eliminación.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un usuario existente | Lo busca por nombre o correo y lo agrega | Aparece en la lista con rol de miembro |
| 2 | Una persona sin cuenta | Captura sus datos y la agrega | Se crea su cuenta y queda como miembro de la cartera |
| 3 | Un miembro ya agregado | Intenta agregarlo otra vez | El sistema avisa que ya pertenece a la cartera |
| 4 | La tabla de contribuyentes | Escribe en el filtro por nombre | La lista se reduce a las coincidencias |
| 5 | Un miembro con movimientos | Pulsa "Dar de baja" | Ve una advertencia con su saldo y los movimientos se conservan |
| 6 | El último administrador | Intenta darse de baja | El sistema lo impide (la cartera quedaría sin administrador) |
| 7 | Alta o baja completada | Recarga la vista | Los totales, cuotas y saldos se recalculan |

**Reglas de negocio**

* No se duplica un miembro en la misma cartera (`idCartera + idUsuario` únicos).
* La baja de un miembro **no elimina** sus movimientos: permanecen en el histórico y se recalculan cuotas y saldos.
* No se puede eliminar al último administrador de la cartera.
* El aporte comprometido es informativo (referencia de ahorro); no es obligatorio.
* El administrador de la cartera es el único que puede dar de alta/modificar/baja; los miembros solo consultan.

**Notas de implementación**

* **Web:** `features/contribuyentes/contribuyentes.ts` y `miembro-form.ts` (también accesible desde la pestaña Contribuyentes de `detalle.ts`); `CarterasService.crearMiembro/eliminarMiembro`.
* **API prevista:** `GET/POST /api/carteras/{id}/miembros`, `DELETE /api/carteras/{id}/miembros/{idMiembro}`, `PUT` para aporte comprometido.
* **Casos borde:** usuario creado sin correo (permitir teléfono); miembro con saldo a favor que se da de baja (advertencia más visible); reactivar un miembro dado de baja (fase 2).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Reutiliza el alta de usuarios de HU-02, pero funciona con el dataset demo. |
| Negociable | Si la baja conserva o no movimientos, ya está decidido; el resto admite ajustes. |
| Valiosa | Mantiene la transparencia y las cuotas correctas. |
| Estimable | Tabla y modal ya prototipados. |
| Pequeña | 3 puntos. |
| Testable | Cada criterio se verifica en la interfaz y con los totales recalculados. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | Usuario existente o nuevo, duplicados y reglas de baja con saldo | 0.90 |
| Duración estimada | 20 % | 3 | 1.5 – 2 días | 0.60 |
| Volumen de trabajo | 25 % | 3 | Tabla + filtro + modal de alta + baja con confirmación + recálculo | 0.75 |
| Incertidumbre y riesgos | 25 % | 2 | Reglas definidas; el caso "persona nueva" reutiliza HU-02 | 0.50 |
| **Total (S)** | **100 %** | | | **2.75 → 3 puntos** |

---

### HU-09 · Registrar un gasto o ingreso en segundos (móvil)

> **Como** contribuyente en campo (P3, P4), **quiero** registrar un gasto o un ingreso con la menor cantidad de toques posible, **para** no perder el registro cuando estoy fuera de casa.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **3** |
| **Personas** | P3, P4 |
| **Plataformas** | Móvil |
| **Épica** | E4 · Transacciones |
| **Depende de** | HU-01, HU-04 |

**Contexto.** Es el momento de la verdad del producto: Vanessa paga la gasolina y quiere registrarlo antes de subir al auto; Damián anota su aportación de la posada al llegar a casa. El formulario debe abrirse desde el botón central de la barra inferior y resolverse con **monto, categoría y guardar** (3 toques en el caso ideal).

**Flujo principal**

1. La persona abre el registro desde el botón central "+" del inicio o desde una tarjeta de cartera.
2. Captura el **monto** con teclado numérico; el tipo inicia en *gasto* (el más frecuente) y puede cambiarse a *ingreso*.
3. Elige la categoría en chips (Alimentos, Gas, Estadías, Alcohol, etc.).
4. La fecha es hoy por defecto y puede cambiarse; la nota es opcional.
5. Guarda y ve una confirmación con la opción **"Registrar otro"**; el inicio ya refleja el nuevo total.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | El formulario abierto | Captura monto, categoría y guarda | El movimiento aparece en la cartera y actualiza los totales |
| 2 | Un monto vacío, cero o negativo | Intenta guardar | El botón está deshabilitado y se indica "El monto debe ser mayor a 0" |
| 3 | Un monto mayor a $1,000,000 | Intenta guardar | Se advierte del límite y se impide el registro |
| 4 | El formulario recién abierto | Observa los valores por defecto | Tipo = gasto, fecha = hoy, cartera = la activa de contexto |
| 5 | Un guardado exitoso | Pulsa "Registrar otro" | Se limpia el monto y la nota, y conserva cartera, tipo y categoría |
| 6 | Sin conexión a internet (fase 2) | Guarda | El movimiento se guarda localmente y se sincroniza después, con aviso visible |
| 7 | Texto de nota | Escribe más de 120 caracteres | Se limita la captura con contador visible |

**Reglas de negocio**

* Campos obligatorios: monto, categoría y cartera; fecha por defecto hoy.
* Monto en MXN con 2 decimales; que no exceda $1,000,000 por movimiento.
* No se permiten movimientos en carteras cerradas (el servidor lo valida).
* Cada movimiento guarda quién lo registró (`idUsuario`), para los cálculos de saldos.
* El registro *offline* con sincronización queda explícitamente **diferido** (fase 2); en el MVP la app exige conexión y avisa con claridad.

**Notas de implementación**

* **Móvil:** `MovimientoFragment` + `MovimientoViewModel` con `StateFlow` (`monto`, `tipo`, `categoria`, `fecha`, `nota`, `guardando`); `Room` (`TransaccionDao.insert`) a través de un repositorio con Hilt; teclado `numberDecimal`; validaciones en el ViewModel (no en la vista); `Snackbar` de confirmación con acción "Registrar otro".
* **API prevista:** `POST /api/transacciones` → `201 Created` con el movimiento creado.
* **Casos borde:** doble *tap* en Guardar (bloquear durante el envío); comas en el monto (`1,250.50`); cambio de cartera antes de guardar.

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Depende de que exista cartera, pero usa datos demo para desarrollo. |
| Negociable | Número y orden de campos se ajustan con pruebas de usuario. |
| Valiosa | Es la funcionalidad más usada del producto. |
| Estimable | Formulario conocido; validaciones definidas. |
| Pequeña | 3 puntos. |
| Testable | Criterios medibles (toques, validaciones, totales). |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | Validaciones, estados de guardado y sincronización diferida | 0.90 |
| Duración estimada | 20 % | 3 | 1.5 – 2 días | 0.60 |
| Volumen de trabajo | 25 % | 3 | Pantalla + ViewModel + Room + validaciones + confirmación | 0.75 |
| Incertidumbre y riesgos | 25 % | 3 | "Pocos toques" es iterable; decisión de offline genera dudas | 0.75 |
| **Total (S)** | **100 %** | | | **3.00 → 3 puntos** |

---

### HU-10 · Consultar, filtrar y editar movimientos (web)

> **Como** administrador (P1, P2, P3), **quiero** ver todos los movimientos de mis carteras y filtrarlos por texto, tipo, categoría, cartera y mes, **para** encontrar un cargo dudoso y corregirlo.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **3** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web |
| **Épica** | E4 · Transacciones |
| **Depende de** | HU-04, HU-09 |

**Contexto.** Con 391 movimientos en la demo (y cientos en la boda de Aideé), la tabla necesita filtros reales y totales visibles. Es también donde se corrigen errores de captura del móvil.

**Flujo principal**

1. La persona abre *Transacciones* (vista global) o la pestaña *Movimientos* de una cartera.
2. Ve la tabla ordenada por fecha descendente: fecha, descripción, categoría, cartera, responsable, método y monto (ingreso en verde, gasto en rojo).
3. Combina filtros: texto libre, tipo, categoría, cartera y mes; ve el contador y la suma de resultados.
4. Edita un movimiento en un modal reutilizable o lo elimina con confirmación.
5. Limpia los filtros para volver a la vista completa.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Una lista con movimientos | Aplica el filtro "gasto" + categoría | Solo ve las coincidencias y el contador se actualiza |
| 2 | Un filtro de texto | Escribe "gasolina" | Se filtran los movimientos por nombre y nota |
| 3 | Filtros sin resultados | Espera la respuesta | Ve un estado vacío con el botón "Limpiar filtros" |
| 4 | Un movimiento seleccionado | Pulsa "Editar" | Se abre el modal con los datos cargados y guarda los cambios |
| 5 | Un movimiento seleccionado | Pulsa "Eliminar" | Se pide confirmación y, al aceptar, desaparece y se recalculan totales |
| 6 | Una cartera cerrada | Intenta editar o eliminar | Las acciones están deshabilitadas con el mensaje "Cartera finalizada" |
| 7 | Vista en móvil | Abre la tabla | Se convierte en tarjetas legibles sin desplazamiento horizontal |

**Reglas de negocio**

* Solo se editan/eliminan movimientos de carteras activas y con permiso (administrador o el propio autor).
* Las mismas validaciones de monto/fecha/categoría de HU-09 aplican al editar.
* Los filtros se combinan con lógica AND; el defecto es fecha descendente.
* La suma mostrada corresponde a los movimientos filtrados (no al total de la cartera).

**Notas de implementación**

* **Web:** `features/transacciones/transacciones.ts` + `transaccion-form.ts` (reutilizado en `detalle.ts`); filtros como signals con `computed` y función pura `filtrar()` en `finanzas.ts`; tipo `FiltroTransacciones`; estado vacío con `EmptyState`.
* **API prevista:** `GET /api/transacciones?texto=&tipo=&idCartera=&idCategoria=&mes=`, `PUT /api/transacciones/{id}`, `DELETE /api/transacciones/{id}`.
* **Casos borde:** muchos resultados (paginación visual con "cargar más" o *scroll* virtual); filtros combinados que dejan la lista vacía; edición concurrente de dos administradores (fase 2: bloqueo optimista).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Reutiliza componentes de HU-04/HU-08. |
| Negociable | Conjunto de filtros puede crecer (p. ej. responsable). |
| Valiosa | Da control y confianza sobre los datos capturados en móvil. |
| Estimable | Tabla y modal ya prototipados. |
| Pequeña | 3 puntos. |
| Testable | Criterios verificables con los datos demo. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | CRUD con 5 filtros combinables, totales y orden | 0.90 |
| Duración estimada | 20 % | 3 | ~2 días | 0.60 |
| Volumen de trabajo | 25 % | 3 | Tabla + modal + filtros + edición/eliminación + estado vacío | 0.75 |
| Incertidumbre y riesgos | 25 % | 2 | Patrones ya usados en HU-04 y HU-08 | 0.50 |
| **Total (S)** | **100 %** | | | **2.75 → 3 puntos** |

---

### HU-11 · Contribuir en carteras de otras personas

> **Como** contribuyente (P3, P4), **quiero** ver las carteras donde me invitaron con cuánto llevo pagado, mi cuota y mi saldo, y registrar ahí mi gasto, **para** saber si estoy al corriente sin pedir cuentas.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Should |
| **Puntos** | **3** |
| **Personas** | P3, P4 |
| **Plataformas** | Web (espejo en móvil, fase 2) |
| **Épica** | E3 · Contribuyentes e invitaciones |
| **Depende de** | HU-07, HU-09 |

**Contexto.** Vanessa y Damián participan como contribuyentes en carteras que no administran. Necesitan una vista de lectura de la cartera ajena donde **entiendan sus números personales** (pagado, cuota, saldo) y puedan registrar su gasto asignado, sin tocar la configuración de la cartera.

**Flujo principal**

1. La persona entra a *Compartidas* (o *Colaboraciones*) y ve tarjetas con: administrador, mi pagado, mi cuota, mi saldo y avance.
2. Abre el detalle en **modo lectura**: sin editar cartera, sin invitar y sin eliminar movimientos ajenos.
3. Pulsa **Registrar mi gasto** y captura el movimiento (queda asignado a su usuario).
4. Consulta cómo cambia su saldo personal y los movimientos del grupo.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Un miembro de una cartera ajena | Abre *Compartidas* | Ve sus tarjetas con "mi pagado", "mi cuota" y "mi saldo" |
| 2 | El detalle en modo lectura | Revisa la pantalla | No aparecen acciones de administración (editar, invitar, cerrar, eliminar) |
| 3 | Un miembro | Pulsa "Registrar mi gasto" | El formulario se abre con la cartera y su usuario preseleccionados |
| 4 | Un miembro | Intenta editar o eliminar un movimiento de otra persona | La acción no está disponible |
| 5 | Saldo personal negativo | Observa la tarjeta | El saldo se muestra en rojo y con la leyenda "Debes aportar" |
| 6 | Un movimiento propio | Lo registra | Su "pagado" se actualiza al instante |
| 7 | Cualquier miembro | Consulta la lista de participantes | Ve nombre y montos, pero no correo ni teléfono de otros |

**Reglas de negocio**

* Matriz de permisos: **Administrador** (todo), **Miembro** (consulta y registra gastos propios), **Ninguno** (no ve la cartera).
* La privacidad manda: otros miembros ven nombre, aporte y montos; nunca contacto.
* La cuota y el saldo se calculan con la fórmula de HU-05; el saldo personal es `pagado − cuota`.
* Los gastos registrados por un miembro se suman al total de la cartera y al ranking de pagos.

**Notas de implementación**

* **Web:** pestaña **"Compartidas"** de `features/carteras/lista.ts` (equivalente a `/app/colaboraciones` de la propuesta) + `detalle.ts` con *flags* por rol (helper de permisos, p. ej. `puedeAdministrar(cartera, usuario)`); reutiliza tarjetas y tablas existentes en modo lectura.
* **API prevista:** `GET /api/carteras?participando=me`; autorización por pertenencia en cada endpoint.
* **Casos borde:** miembro dado de baja que intenta abrir el enlace (error claro); cartera cerrada (solo lectura absoluta); miembro sin cuota (sin gastos aún: cuota $0).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Se apoya en HU-07 y HU-09, pero puede probarse con el dataset demo. |
| Negociable | La matriz de permisos admite afinarse con el equipo. |
| Valiosa | Cubre al 100 % de los contribuyentes que no administran. |
| Estimable | Reutiliza vistas y cálculos existentes. |
| Pequeña | 3 puntos. |
| Testable | Permisos verificables por rol con las cuentas demo. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 3 | Permisos por rol + vista lectura + registro restringido + saldo personal | 0.90 |
| Duración estimada | 20 % | 3 | ~2 días | 0.60 |
| Volumen de trabajo | 25 % | 3 | Vista de colaboraciones + detalle en modo lectura + servicio de permisos | 0.75 |
| Incertidumbre y riesgos | 25 % | 3 | Matriz de permisos por validar; privacidad entre miembros | 0.75 |
| **Total (S)** | **100 %** | | | **3.00 → 3 puntos** |

---

### HU-12 · Cerrar la cartera y obtener el balance final

> **Como** administrador (P1, P2, P3), **quiero** cerrar la cartera y obtener el balance final con quién le debe a quién y con el mínimo de transferencias, **para** terminar el viaje o evento con cuentas claras y sin discusiones.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Must |
| **Puntos** | **8** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web |
| **Épica** | E5 · Cierre |
| **Depende de** | HU-05, HU-08, HU-10 |

**Contexto.** Es el momento de mayor valor emocional: la boda y el viaje terminan, y las cuentas deben cuadrar. El sistema calcula la tabla de saldos por integrante y una **liquidación sugerida** (algoritmo *greedy* de mínimo número de transferencias), que se puede imprimir para la junta familiar.

**Flujo principal**

1. La persona abre la pestaña **Cierre y balance** de la cartera.
2. Ve la tabla por integrante: pagado, aportado, cuota y saldo; el sistema avisa si la suma no es cero.
3. Revisa la **liquidación sugerida**: "X le transfiere $N a Y" con el mínimo de operaciones posible.
4. Puede imprimir o guardar el balance (impresión del navegador con formato limpio).
5. Pulsa **Finalizar cartera**, confirma la acción y la cartera pasa a *Inactivas* con fecha de cierre, bloqueando nuevas ediciones.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Una cartera con movimientos | Abre la pestaña Cierre | Ve la tabla de saldos por integrante |
| 2 | La tabla calculada | Revisa la suma de saldos | Suma $0 (tolerancia de $1 por redondeo) y se advierte si no |
| 3 | Saldos distintos de cero | Observa la liquidación | Ve transferencias sugeridas que, aplicadas, dejan todos los saldos en cero |
| 4 | La liquidación mostrada | Pulsa "Imprimir" | Se abre la impresión con la tabla y la liquidación en formato legible |
| 5 | La persona pulsa "Finalizar cartera" | Confirma en el diálogo | La cartera queda inactiva con fecha de cierre y aparece en *Inactivas* |
| 6 | Una cartera finalizada | Intenta registrar, editar o invitar | El sistema lo bloquea con el mensaje "Cartera finalizada" |
| 7 | Una persona que no administra | Abre la pestaña | Ve el balance, pero no el botón Finalizar |
| 8 | Saldos con centavos impares (p. ej., $33.33 o $12,345.67) | Revisa la liquidación | Todas las deudas mayores a $1.00 quedan cubiertas y los residuos se mantienen dentro de ±$1.00 |

**Reglas de negocio**

* Cuota por integrante = `totalGastos / número de miembros`; saldo = `pagado − cuota`.
* Los saldos se redondean a centavos y la liquidación aplica una **tolerancia de ±$1.00 MXN**: todo saldo con `|saldo| ≤ 1` se considera liquidado y no genera transferencias; el algoritmo *greedy* ordena deudores y acreedores por monto y empareja al mayor con el mayor.
* El cierre es **irreversible** en el MVP; la reapertura queda como fase 2 con bitácora.
* Tras el cierre no se admiten movimientos, miembros ni regeneración de códigos.
* La suma de los saldos y de las transferencias debe cerrar en cero (verificación automática).

**Notas de implementación**

* **Web:** pestaña Cierre de `detalle.ts`; funciones puras `calcularResumen()` y `liquidar()` de `core/utils/finanzas.ts`; `ConfirmModal` para finalizar; `window.print()` con `@media print`; `CarterasService.finalizar(id)` que fija `estado = 'inactiva'` y `fechaCierre`.
* **API prevista:** `POST /api/carteras/{id}/cerrar` (validar en servidor que no queden saldos distintos de cero o confirmarlos con bandera).
* **Casos borde:** cartera con un solo miembro; saldos con `|saldo| ≤ $1.00` (ignorados); cartera sin gastos (cuota $0 y sin transferencias); centavos impares (ver vectores de prueba); impresión sin encabezados de la app.

**Pruebas unitarias obligatorias de `liquidar()`**

Forman parte del **DoD de esta historia** y viven en `core/utils/finanzas.spec.ts`. Vectores mínimos:

| # | Saldos de entrada | Resultado esperado |
| --- | --- | --- |
| V1 · centavos impares | `+$33.34`, `−$16.67`, `−$16.67` | 2 transferencias de $16.67; saldos en $0.00 |
| V2 · centavos impares con residuo | `+$100.00`, `−$50.25`, `−$49.74`, `−$0.01` | 2 transferencias ($50.25 y $49.74); el residuo de $0.01 queda dentro de la tolerancia |
| V3 · dentro de la tolerancia | `+$1.00`, `−$1.00` | 0 transferencias (ambos dentro de ±$1.00) |
| V4 · frontera | `+$1.01`, `−$1.01` | 1 transferencia de $1.01 |

Invariantes que cada vector debe verificar: (1) los saldos con `|saldo| ≤ $1.00` no generan transferencias; (2) después de aplicar la liquidación, todos los saldos quedan dentro de ±$1.00 (ninguna deuda mayor a $1.00 queda pendiente); (3) el número de transferencias es ≤ n − 1; (4) la suma de las transferencias coincide con la esperada en el vector (±$0.01 por redondeo). Las comparaciones de punto flotante se redondean a centavos (`Math.round(x * 100) / 100`) con tolerancia de ±$0.01 para evitar falsos negativos (p. ej., `33.34 − 16.67 − 16.67 ≠ 0` en binario).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Requiere datos consolidados, pero se prueba con carteras demo. |
| Negociable | Redondeo y reapertura son decisiones abiertas (documentadas). |
| Valiosa | Es el cierre del ciclo de valor: transparencia total. |
| Estimable | Algoritmo y pantalla ya prototipados. |
| Pequeña | **8 puntos: dividir** en (a) cálculo de saldos, (b) liquidación sugerida, (c) cierre + impresión. |
| Testable | La suma de saldos en cero y las invariantes de `liquidar()` son pruebas objetivas y automatizables (incluye vectores con centavos impares). |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 5 | Algoritmo de liquidación, redondeos, reglas de cierre e inmutabilidad | 1.50 |
| Duración estimada | 20 % | 4 | 3 – 4 días | 0.80 |
| Volumen de trabajo | 25 % | 4 | Tabla + liquidación + confirmación + impresión + archivado + bloqueos + pruebas unitarias | 1.00 |
| Incertidumbre y riesgos | 25 % | 4 | Definición de redondeo y reapertura; percepción de "descuadres" (mitigada con pruebas de centavos impares) | 1.00 |
| **Total (S)** | **100 %** | | | **4.30 → 8 puntos** |

---

### HU-13 · Consultar carteras finalizadas (histórico)

> **Como** usuario (P1, P2, P3), **quiero** consultar el histórico de carteras finalizadas con su balance final, **para** recordar cuánto costó el viaje o comparar gastos pasados.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Could |
| **Puntos** | **2** |
| **Personas** | P1, P2, P3 |
| **Plataformas** | Web |
| **Épica** | E2 · Carteras |
| **Depende de** | HU-12 |

**Contexto.** Después del cierre, la información no debe desaparecer: es la memoria financiera del grupo y la base para planear el próximo viaje con datos reales.

**Flujo principal**

1. La persona entra a *Inactivas* desde *Carteras*.
2. Ve la lista de carteras finalizadas con categoría, fecha de cierre y total gastado.
3. Filtra por texto o categoría y abre el detalle en modo lectura absoluta.
4. Consulta el balance final y la liquidación que se aplicó.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | Carteras finalizadas | Abre *Inactivas* | Ve la lista ordenada por fecha de cierre descendente |
| 2 | Una cartera finalizada | Abre su detalle | Ve balance final y liquidación, todo en solo lectura |
| 3 | El buscador | Escribe el nombre de un viaje | La lista se filtra en línea |
| 4 | Una cartera activa | Consulta *Inactivas* | No aparece en la lista |
| 5 | Un miembro del grupo | Abre una cartera finalizada ajena | La ve solo si participó en ella |

**Reglas de negocio**

* Solo aparecen carteras con `estado = 'inactiva'` en las que la persona fue miembro.
* Ninguna acción de escritura está disponible (ni editar, ni invitar, ni reabrir en el MVP).
* Los montos se muestran ya "congelados" (no se recalculan con movimientos posteriores, porque no existen).

**Notas de implementación**

* **Web:** `features/inactivas/inactivas.ts`; reutiliza tarjetas de cartera y el detalle en modo lectura; `CarterasService` expone `inactivasDe(idUsuario)`.
* **API prevista:** `GET /api/carteras?estado=inactiva&usuario=me`.
* **Casos borde:** cartera finalizada sin movimientos; miembro eliminado tras el cierre (mantiene acceso de lectura a la cartera de la que participó).

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Usa el estado generado por HU-12, pero puede probarse con carteras demo ya inactivas. |
| Negociable | Filtros y columnas admisibles de ajuste. |
| Valiosa | Conserva el histórico y da contexto para futuros presupuestos. |
| Estimable | Vistas de solo lectura ya existentes. |
| Pequeña | 2 puntos. |
| Testable | Criterios simples de visibilidad y permisos. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 2 | Listado y detalle de solo lectura | 0.60 |
| Duración estimada | 20 % | 2 | ~1 día | 0.40 |
| Volumen de trabajo | 25 % | 2 | Lista + filtro + reutilización del detalle | 0.50 |
| Incertidumbre y riesgos | 25 % | 2 | Depende de la definición de archivado (ya resuelta en HU-12) | 0.50 |
| **Total (S)** | **100 %** | | | **2.00 → 2 puntos** |

---

### HU-14 · Ajustar el perfil y las preferencias

> **Como** usuario (P1–P4), **quiero** actualizar mis datos, mi contraseña y mis preferencias, y cerrar sesión de forma segura, **para** mantener mi cuenta al día y a mi gusto.

| Ficha rápida | |
| --- | --- |
| **Prioridad** | Could |
| **Puntos** | **2** |
| **Personas** | P1, P2, P3, P4 |
| **Plataformas** | Web y móvil |
| **Épica** | E1 · Acceso y cuentas |
| **Depende de** | HU-01, HU-02 |

**Contexto.** Aideé corrige su apellido y su teléfono; Diego activa los avisos de presupuesto; cualquiera puede cerrar sesión desde un dispositivo prestado. Los cambios de perfil deben **reflejarse al instante** en saludos y avatares de toda la interfaz.

**Flujo principal**

1. La persona abre *Ajustes*.
2. En **Perfil** edita nombre, apellidos, correo y teléfono; al guardar, ve la confirmación y su avatar/saludo actualizados sin recargar.
3. En **Seguridad** cambia su contraseña (actual + nueva + confirmación).
4. En **Preferencias** activa o desactiva avisos (presupuesto al 80 %, resumen semanal, notificaciones *push* en fase 2).
5. En **Sesión** cierra sesión con confirmación y regresa a la landing.

**Criterios de aceptación**

| # | Dado | Cuando | Entonces |
| --- | --- | --- | --- |
| 1 | El formulario de perfil | Guarda cambios válidos | Los datos se actualizan y el saludo y avatares lo reflejan al instante |
| 2 | Un correo ya usado por otra cuenta | Intenta guardar | Ve "Ese correo ya está en uso" y no se guarda |
| 3 | La sección de seguridad | Cambia la contraseña con la actual correcta | La nueva contraseña queda activa y se confirma por notificación |
| 4 | La contraseña actual incorrecta | Intenta cambiarla | Se muestra el error y no se modifica |
| 5 | Una preferencia (switch) | La cambia | El cambio se guarda y persiste al recargar |
| 6 | La persona pulsa "Cerrar sesión" | Confirma | Su sesión termina y se le envía a la landing |
| 7 | Vista en móvil | Usa los switches | Responden con *feedback* táctil y están etiquetados para accesibilidad |

**Reglas de negocio**

* Correo único en el sistema (misma regla que HU-02).
* La contraseña nunca se muestra ni se registra en texto plano; se pide la actual para cambiarla.
* El cambio de perfil es inmediato en todas las vistas (estado reactivo: usuario derivado de un `signal`).
* Las preferencias son por usuario y persisten localmente en el MVP (en producción, en el servidor).
* "Eliminar cuenta" y verificación de correo por enlace quedan para fases posteriores.

**Notas de implementación**

* **Web:** `features/ajustes/ajustes.ts`; `AuthService.actualizar(cambios)` → `UsuariosService.actualizar(id, cambios)`; como `AuthService.usuario` es un `computed`, todos los consumidores reaccionan; switches con `role="switch"` y `aria-checked`.
* **Móvil:** `AjustesFragment` + `AjustesViewModel`; sesión y preferencias en `DataStore`; cierre de sesión limpia el token y navega al inicio.
* **API prevista:** `PUT /api/usuarios/{id}`, `PUT /api/usuarios/{id}/contrasena`, `PUT /api/usuarios/{id}/preferencias`.
* **Casos borde:** guardar sin cambios (no hacer petición); correo con espacios; sesión expirada mientras se edita el perfil.

**Verificación INVEST**

| Criterio | Evaluación |
| --- | --- |
| Independiente | Solo necesita la sesión activa. |
| Negociable | Lista de preferencias y campos admite ajustes. |
| Valiosa | Da control y seguridad sobre la cuenta. |
| Estimable | Formularios y propagación de estado ya resueltos. |
| Pequeña | 2 puntos. |
| Testable | Criterios verificables por formulario. |

**Estimación de complejidad**

| Factor | Peso | Valor | Justificación | Ponderado |
| --- | ---: | --- | --- | ---: |
| Complejidad inherente | 30 % | 2 | Formularios sencillos y propagación de estado reactivo | 0.60 |
| Duración estimada | 20 % | 2 | ~1 día | 0.40 |
| Volumen de trabajo | 25 % | 2 | Perfil + seguridad + preferencias + sesión | 0.50 |
| Incertidumbre y riesgos | 25 % | 1 | Alcance claro, sin dependencias externas | 0.25 |
| **Total (S)** | **100 %** | | | **1.75 → 2 puntos** |

---

## 6. Resumen de estimación

### 6.1 Tabla general

| HU | Historia | Épica | Personas | Prioridad | Puntos | Iteración |
| --- | --- | --- | --- | :---: | :---: | :---: |
| HU-01 | Iniciar sesión y conservar la sesión | E1 | P1–P4 | Must | 2 | 1 |
| HU-02 | Crear una cuenta nueva | E1 | P4 | Must | 2 | 1 |
| HU-03 | Panel de bienvenida | E2 | P1, P2, P3, P4 | Should | 3 | 2 |
| HU-04 | Crear y administrar carteras | E2 | P1, P2, P3 | Must | 3 | 2 |
| HU-05 | Resumen y estadísticas de cartera | E2 | P1, P2 | Should | 5 | 3 |
| HU-06 | Invitar con QR y clave única | E3 | P1, P2, P3 | Must | 3 | 2 |
| HU-07 | Unirme a una cartera por QR (móvil) | E3 | P1, P3, P4 | Must | 8 | 1 |
| HU-08 | Administrar contribuyentes | E3 | P1, P2, P3 | Must | 3 | 2 |
| HU-09 | Registrar un movimiento en segundos (móvil) | E4 | P3, P4 | Must | 3 | 1 |
| HU-10 | Consultar, filtrar y editar movimientos | E4 | P1, P2, P3 | Must | 3 | 2 |
| HU-11 | Contribuir en carteras de otras personas | E3 | P3, P4 | Should | 3 | 3 |
| HU-12 | Cerrar cartera y balance final | E5 | P1, P2, P3 | Must | 8 | 3 |
| HU-13 | Consultar carteras finalizadas | E2 | P1, P2, P3 | Could | 2 | 3 |
| HU-14 | Ajustar el perfil y las preferencias | E1 | P1–P4 | Could | 2 | 2 |
| | | | | **Total** | **50** | |

### 6.2 Plan de entregas (iteraciones de 2 semanas)

El proyecto usa **Kanban** con flujo continuo; esta división por iteraciones es una referencia para priorizar y controlar el WIP (límite sugerido: 2 historias *en progreso* y 3 *en revisión*).

| Iteración | Enfoque | Historias | Puntos | Incremento demostrable |
| :---: | --- | --- | :---: | --- |
| **1** | Acceso y registro en campo | HU-01, HU-02, HU-07, HU-09 | **15** | Una persona nueva se registra, se une por QR (o con el código capturado a mano, desde el día 1) y registra su primer gasto desde el móvil |
| **2** | Administración web de carteras | HU-03, HU-04, HU-06, HU-08, HU-10, HU-14 | **17** | El administrador crea carteras, invita, gestiona contribuyentes y movimientos, y ajusta su cuenta |
| **3** | Analítica, colaboración y cierre | HU-05, HU-11, HU-12, HU-13 | **18** | Estadísticas por cartera, vista del contribuyente y cierre con liquidación firmable |
| | | **Total** | **50** | |

**Velocidad de referencia:** 15–18 puntos por iteración con 4 integrantes a medio tiempo. Las historias de 8 puntos (HU-07 y HU-12) se dividen al iniciarlas para mantener el flujo y reducir riesgo.

> **Actualización vigente (anexo, sección 10).** El reparto para los 4 desarrolladores está en el anexo: 4 carriles paralelos, historias ≤ 3 puntos (tres de 5 con corte definido), contrato congelado y datos semilla. El calendario queda: **Iteración 0** (cimientos, 3 días) + 3 iteraciones de 2 semanas + colchón para chat/integración.

### 6.3 Riesgos detectados y mitigación

| Riesgo | Historias afectadas | Mitigación |
| --- | --- | --- |
| Permisos/hardware de cámara en Android heterogéneo; emuladores sin cámara física | HU-07 | Captura manual del código construida desde el día 1 de la Iteración 1 (no bloquea pruebas en emulador); escáner aislado tras una interfaz con implementación *fake*; pruebas en al menos 2 dispositivos físicos |
| Percepción de "cuentas que no cuadran" por redondeos | HU-05, HU-12 | Tolerancia de ±$1.00 MXN documentada; suma de saldos verificada automáticamente; pruebas unitarias de `liquidar()` con centavos impares e invariantes |
| Web Share API no disponible | HU-06 | Respaldo a copiado al portapapeles y opción de descargar la imagen |
| Requisitos de permisos y privacidad entre miembros | HU-11 | Matriz de permisos validada con los cuatro perfiles demo antes de programar |
| Historias grandes (8 puntos) que frenan el flujo Kanban | HU-07, HU-12 | División obligatoria antes de iniciar (escáner / validación / errores; saldos / liquidación / cierre) |

---

## 7. Matriz de trazabilidad

| HU | Módulo del proyecto | Entidad principal | Vista web | Pantalla móvil | API prevista (fase con backend) |
| --- | --- | --- | --- | --- | --- |
| HU-01 | Landing / Login | `Usuario` | `/login` | `LoginFragment` | `POST /api/auth/login` |
| HU-02 | Landing / Login | `Usuario` | `/registro` | `RegistroFragment` | `POST /api/usuarios` |
| HU-03 | Bienvenida | `Cartera`, `MiembroCartera` | `/app/inicio` (hoy pestañas de `/app/carteras`) | — | `GET /api/carteras?usuario=me` |
| HU-04 | Carteras | `Cartera`, `CategoriaCartera` | `/app/carteras` | — | `CRUD /api/carteras` |
| HU-05 | Carteras / Estadísticas | `Transaccion` | `/app/carteras/:id` (Resumen) | — | `GET /api/carteras/{id}/resumen` |
| HU-06 | Carteras / QR | `Cartera.codigoInvitacion` | `/app/carteras/:id` (Invitación) | — | `POST /api/carteras/{id}/invitacion` |
| HU-07 | Unirse a cartera | `MiembroCartera` | — | `UnirseFragment` | `POST /api/carteras/unirse` |
| HU-08 | Contribuyentes | `MiembroCartera`, `Usuario` | `/app/contribuyentes` | — | `CRUD /api/carteras/{id}/miembros` |
| HU-09 | Transacciones | `Transaccion`, `CategoriaGasto` | — | `MovimientoFragment` | `POST /api/transacciones` |
| HU-10 | Transacciones | `Transaccion` | `/app/transacciones` | — | `GET/PUT/DELETE /api/transacciones` |
| HU-11 | Carteras a las que contribuyo | `MiembroCartera` | `/app/colaboraciones` (hoy pestaña Compartidas) | — | `GET /api/carteras?participando=me` |
| HU-12 | Transacciones / Cierre | `Cartera`, `Transaccion` | `/app/carteras/:id` (Cierre) | — | `POST /api/carteras/{id}/cerrar` |
| HU-13 | Carteras inactivas | `Cartera` | `/app/inactivas` | — | `GET /api/carteras?estado=inactiva` |
| HU-14 | Ajustes | `Usuario` | `/app/ajustes` | `AjustesFragment` | `PUT /api/usuarios/{id}` |

---

## 8. Backlog complementario

Historias identificadas que **no forman parte del compromiso** de las 14 principales; se atenderán en iteraciones posteriores y ya tienen estimación preliminar para planear:

| ID | Historia (resumen) | Valor | Puntos preliminares |
| --- | --- | --- | :---: |
| HU-15 | Recuperar contraseña por correo | No perder cuentas | 3 |
| HU-16 | Adjuntar foto del ticket a un movimiento | Comprobación y confianza (campo `foto` ya previsto) | 3 |
| HU-17 | Notificaciones *push* (nuevo gasto, cierre, presupuesto al 80 %) | Mantener al grupo informado | 5 |
| HU-18 | Exportar balance a PDF/CSV | Reportes para juntas familiares | 3 |
| HU-19 | Modo *offline* con sincronización | Registro sin conexión en viajes | 8 |
| HU-20 | Presupuestos por categoría con alertas | Mayor control del gasto | 5 |
| HU-21 | Roles avanzados por cartera (solo lectura, revisor) | Privacidad fina en grupos grandes | 5 |
| HU-22 | Comentarios por movimiento | Resolver dudas sin salir de la app | 3 |

---

## 9. Conclusión

* Se documentaron **14 historias de usuario principales** (mínimo requerido: 8), redactadas desde el perfil de **4 personas** representativas del problema, con **criterios de aceptación verificables**, reglas de negocio y notas de implementación ligadas al código real del prototipo y al contrato de API futuro.
* Las 14 historias cumplen **INVEST**; las dos de mayor tamaño (HU-07 y HU-12, de 8 puntos) se marcan explícitamente para **dividirse** al iniciar su desarrollo, manteniendo así el flujo Kanban con WIP controlado.
* La estimación ponderada por los **4 factores** (complejidad inherente 30 %, duración 20 %, volumen 25 %, incertidumbre y riesgos 25 %) da un total de **50 puntos**, distribuidos en 3 iteraciones de valor: acceso/registro móvil (15), administración web (17) y analítica/cierre (18).
* El orden de las iteraciones respeta la estrategia del producto: primero el **flujo colaborativo mínimo** (entrar, crear, invitar, unirse, registrar), después la **administración y el análisis**, y al final el **cierre con balance**, que es el entregable de mayor valor para el usuario.
* El **anexo (sección 10)** reexpresa este backlog en **4 carriles técnicos e independientes**, uno por desarrollador, con contrato congelado, datos semilla y plan de iteraciones, sin cambiar el alcance funcional.

---

## 10. Anexo: backlog técnico y reparto para 4 desarrolladores

**Propósito.** Este anexo convierte las 14 historias de la sección 5 en un backlog **técnico** y **paralelizable entre los 4 integrantes**: historias de máximo 3 puntos (tres de 5 con corte definido), criterios verificables, contrato congelado y datos semilla que eliminan las dependencias entre historias. No sustituye lo documentado arriba; lo complementa. El detalle ampliado y las reglas de integración viven en el documento de trabajo `backlog_tecnico_y_reparto.md`.

### 10.1 Diagnóstico: por qué el backlog original no se puede repartir

| # | Problema | Corrección aplicada |
| :---: | --- | --- |
| 1 | Historias "de pantalla completa" que mezclan capas y plataformas (p. ej., unirse por QR = escáner + permisos + deep link + validación + registro + membresía) | Rebanadas verticales por comportamiento (K3, K4, K5), cada una con una capa dominante y ~3 puntos |
| 2 | Dependencias en cadena ("HU-11 → HU-07 → HU-06") | Toda dependencia se convierte en **contrato + fixture**; nunca se espera una pantalla ajena |
| 3 | Criterios sin verificación técnica ("ve un QR válido") | Criterios técnicos: contrato, validaciones, estados de UI, rendimiento, pruebas, accesibilidad |
| 4 | Estimaciones hechas sobre un prototipo estático (solo web) | Se estima por capa entregable y se añade la Iteración 0 (cimientos) |
| 5 | Historias de 8 puntos "por dividir" sin división escrita | Todo ≤ 3 puntos; las de 5 traen corte definido por escrito |

**Regla de oro:** una historia no puede depender de que otra historia esté terminada; solo del contrato congelado y de los fixtures.

### 10.2 Estrategia: contrato primero + rebanadas verticales

| Mecanismo | Qué es | En la práctica |
| --- | --- | --- |
| **Contrato congelado** (C0.1) | Entidades, endpoints, DTOs y errores aprobados antes de programar | Cada historia cita su endpoint/DTO; un cambio es un PR al contrato, no una decisión local |
| **Fixtures deterministas** (C0.2) | Datos semilla con casos borde sembrados a propósito | Códigos `FZ-K7M2PD` (válido), `FZ-J5N8QW` (ya miembro), `FZ-C3R6TY` (cartera cerrada), `FZ-V9B4XS` (regenerado); carteras sin presupuesto, centavos, usuario sin carteras |
| **Repositorio conmutable** (C0.4) | La UI consume interfaces; mock hoy, API después, sin tocar pantallas | Web: `AuthRepo`, `CarterasRepo`, `TransaccionesRepo`; móvil: repositorios con Hilt |
| **Rebanada vertical** | Cada historia entrega UI + estado + datos + pruebas **de su parte** | "Registrar gasto móvil" incluye ViewModel, validaciones y pruebas JUnit |

**Listo (Ready):** Como/Quiero/Para + endpoints citados + fixture/mock disponible + criterios técnicos + ≤ 3 puntos.
**Terminado (Done):** PR revisado por otro integrante + criterios verificados + pruebas + responsive 390/1440 px + accesibilidad básica + evidencia en la tarjeta.

### 10.3 Iteración 0 — cimientos (11 puntos, 3 días)

| ID | Entregable | Titular | Pts |
| --- | --- | :---: | :---: |
| C0.1 | Contrato de dominio y API v1 (entidades, endpoints, errores, ejemplos) | Diego | 2 |
| C0.2 | Semilla determinista + fixtures con casos borde + cuentas demo | Aideé | 2 |
| C0.3 | Núcleo de cálculo financiero congelado + vectores dorados (V1–V4) | Damián | 2 |
| C0.4 | Capa de datos conmutable mock ⇄ API (interfaces + repositorios) | Vanessa | 3 |
| C0.5 | Esqueleto de navegación, deep link `unirse?codigo=` y barra inferior móvil | Vanessa | 2 |

*Criterio de salida:* contrato firmado por los 4, fixtures en el repo, mocks operando y vectores dorados en verde.

### 10.4 Reparto por carriles

| Carril | Titular | Foco | Historias | Puntos |
| :---: | --- | --- | --- | :---: |
| 1 | **Diego** | Identidad y usuarios (web + móvil) | I1–I5 | 18 |
| 2 | **Aideé** | Carteras, invitación y unión | K1–K5 | 18 |
| 3 | **Vanessa** | Movimientos y panel | M1–M5 | 19 |
| 4 | **Damián** | Analítica y cierre | A1–A5 | 18 |
| Flotante | — | Chat de cartera (nueva) | F1 | 5 (opcional) |
| | | | **Total** | **73** (+5) |

### 10.5 Fichas técnicas resumidas

#### Carril 1 · Identidad y usuarios — Diego

**I1 · Sesión web: login, guard y retorno al destino — 3 pts · Iter 1 · web**
- *Aceptación:* credenciales válidas → carteras o `?destino=`; error genérico sin revelar qué dato falló; recarga conserva sesión; ruta protegida redirige a `/login?destino=`; botón bloqueado durante el envío.
- *Pruebas:* unit del guard; smoke de los 5 casos.
- *Independencia:* `AuthRepo` mock + usuarios fixture.

**I2 · Registro web con conservación del código de invitación — 3 pts · Iter 1 · web**
- *Aceptación:* correo único (`CORREO_DUPLICADO`); contraseña ≥ 6 con letra y número; teléfono opcional de 10 dígitos; auto-login; `?codigo=` se guarda en `sessionStorage.finanzapp.invitacionPendiente` y no se vuelve a capturar.
- *Pruebas:* unit de validadores; smoke con y sin código.
- *Independencia:* probado con el fixture `FZ-K7M2PD`; sin depender del escáner.

**I3 · Autenticación móvil: Login y Registro con MVVM — 5 pts · Iter 2 · móvil**
- *Aceptación:* Fragments + ViewModels con `StateFlow`; sesión en `DataStore`; código pendiente en `SavedStateHandle`; rotación y muerte del proceso conservan estado; validaciones en el ViewModel con JUnit.
- *Palanca de corte:* login (3) / registro (2).
- *Independencia:* `AuthRepository` fake + fixtures.

**I4 · Perfil, contraseña y preferencias — 2 pts · Iter 3 · web**
- *Aceptación:* cambios de perfil se reflejan al instante (estado reactivo); correo duplicado bloqueado; cambio de contraseña exige la actual; preferencias persisten; switches con `role="switch"` + `aria-checked`; cierre de sesión con confirmación.
- *Independencia:* solo requiere sesión activa y usuarios fixture.

**I5 · Contribuyentes: alta, consulta y baja — 3 pts · Iter 3 · web**
- *Aceptación:* busca usuario existente o crea persona nueva; duplicado → `YA_ES_MIEMBRO`; filtro por nombre en línea; baja con advertencia de saldo y **conservando sus movimientos**; no se elimina al último administrador (`ULTIMO_ADMIN`); recálculo de totales.
- *Independencia:* cartera y usuarios de fixtures; no depende del QR (K2).

#### Carril 2 · Carteras, invitación y unión — Aideé

**K1 · Carteras: crear, editar, archivar y eliminar — 5 pts · Iter 1 · web**
- *Aceptación:* nombre 3–60 y descripción ≤ 200; Viaje/Evento exigen fechas y fin ≥ inicio; presupuesto opcional > 0; permisos con `puedeAdministrar`; eliminar con movimientos sugiere archivar; archivar pasa a inactiva con `fechaCierre`; aviso de nombres duplicados.
- *Palanca de corte:* crear/editar (3) / ciclo de vida y permisos (2).
- *Independencia:* fixtures; el QR solo lee `codigoInvitacion`.

**K2 · Invitación QR: generar, copiar, compartir y regenerar — 3 pts · Iter 1 · web**
- *Aceptación:* QR local (librería `qrcode`, sin servicios externos); clave `FZ-XXXXXX` sin caracteres ambiguos; copiar con fallback; compartir con Web Share + fallback; regenerar invalida el código anterior de inmediato; no administrador en modo lectura; QR legible impreso en blanco y negro.
- *Independencia:* cartera de fixture; la validación del código vive en K4.

**K3 · Escáner QR móvil con captura manual — 3 pts · Iter 2 · móvil**
- *Aceptación:* CameraX + ML Kit tras la interfaz `EscanerCodigo` (fake en pruebas); **captura manual desde el día 1** por el mismo camino; permiso denegado o emulador sin cámara → explicación + manual; QR de otras apps se ignora; lectura única sin dobles avances.
- *Independencia:* probado con `FZ-K7M2PD`; no requiere el QR real ni el canje.

**K4 · Validación del código, vista previa y unión — 3 pts · Iter 2 · móvil**
- *Aceptación:* vista previa (nombre, administrador, categoría, fechas) antes de confirmar; errores `INVITACION_INVALIDA`, `YA_ES_MIEMBRO`, `CARTERA_CERRADA`; sin doble membresía (`idCartera + idUsuario`); validación del lado del repositorio (simula servidor).
- *Independencia:* fixtures de los 4 códigos; funciona con captura manual.

**K5 · Conservar el código durante registro o inicio de sesión — 2 pts · Iter 3 · móvil + web**
- *Aceptación:* si no hay sesión, se registra o entra y **continúa con el mismo código**; sobrevive la muerte del proceso; sin código pendiente el flujo termina normal; el código se limpia al consumirse.
- *Independencia:* interfaz `InvitacionPendienteRepo`; se prueba con pantalla de autenticación fake.

#### Carril 3 · Movimientos y panel — Vanessa

**M1 · Registro rápido de un movimiento (móvil) — 3 pts · Iter 1 · móvil**
- *Aceptación:* defaults tipo gasto, fecha hoy, cartera de contexto; monto > 0 y ≤ $1,000,000 (2 decimales); nota ≤ 120 con contador; "Registrar otro" conserva cartera/tipo/categoría; doble tap bloqueado; sin conexión aviso claro (offline diferido); guarda `idUsuario`; validaciones en ViewModel con JUnit.
- *Independencia:* guarda contra repo mock con cartera fixture.

**M2 · Lista y filtros de movimientos (web) — 3 pts · Iter 2 · web**
- *Aceptación:* tabla por fecha descendente con monto verde/rojo; 5 filtros combinables AND (texto, tipo, cartera, categoría, mes); contador y **suma de los filtrados**; estado vacío con "Limpiar filtros"; O(n) sobre 391 fixtures; en 390 px tarjetas sin scroll horizontal.
- *Independencia:* fixtures de transacciones; sin depender de M3 ni A3.

**M3 · Edición y eliminación de movimientos (web) — 2 pts · Iter 2 · web**
- *Aceptación:* modal precargado con las mismas validaciones de M1; eliminar con confirmación y recálculo; cartera finalizada → acciones deshabilitadas; miembro solo edita lo propio, admin de cartera todo.
- *Independencia:* fixtures + modal existente.

**M4 · Colaboraciones: contribuir en carteras de otras personas — 3 pts · Iter 3 · web**
- *Aceptación:* tarjetas con administrador, mi pagado, mi cuota y mi saldo (negativo en rojo, "Debes aportar"); detalle en modo lectura sin acciones de administración; "Registrar mi gasto" preselecciona cartera y usuario; nunca se muestra correo ni teléfono de otros; cartera cerrada = solo lectura.
- *Independencia:* consume `ResumenCarteraDTO` (C0.3) y fixtures.

**M5 · Panel de inicio: mis carteras y colaboraciones — 3 pts · Iter 3 · web**
- *Aceptación:* bloque "Mis carteras" (activas propias, orden descendente, avance/gasto/nº movimientos); bloque "Compartidas" (administrador + mis números + registrar gasto); estado vacío con "Nueva cartera" y "Unirse con QR"; archivadas no aparecen; cálculos desde `finanzas.ts` (C0.3).
- *Independencia:* maquetable con fixtures; no requiere datos de otros carriles.

#### Carril 4 · Analítica y cierre — Damián

**A1 · Saldos por integrante — 3 pts · Iter 1 · lógica compartida**
- *Aceptación:* tabla pagado/aportado/cuota/saldo por integrante; cuota = totalGastos / nº miembros; **suma de saldos = $0 ± $1.00** verificada; cartera sin movimientos → cuota y saldos en $0; casos límite con centavos impares y miembro dado de baja.
- *Independencia:* transacciones y miembros de fixtures.

**A2 · Liquidación sugerida con el mínimo de transferencias — 3 pts · Iter 2 · lógica compartida**
- *Aceptación:* greedy que empareja mayor deudor con mayor acreedor; invariantes: saldos `|s| ≤ $1.00` no generan transferencias, ninguna deuda > $1.00 queda pendiente, nº transferencias ≤ n − 1, suma coincide ± $0.01.
- *Pruebas obligatorias:* vectores V1 `+33.34, −16.67, −16.67` → 2 × $16.67; V2 con residuo `−0.01`; V3 `±1.00` → 0; V4 `±1.01` → 1. Comparación `Math.round(x*100)/100`.
- *Independencia:* función pura; se prueba con vectores, sin UI.

**A3 · Resumen y estadísticas de una cartera — 5 pts · Iter 2–3 · web**
- *Aceptación:* 4 KPI coincidentes con los movimientos; avance con alerta ≥ 90 % (sin presupuesto → base ingresos); barras de 6 meses (gastos vs. ingresos, formato k/M, meses vacíos en cero); dona top 6 con porcentajes que suman 100 %; ranking de pagos y últimos movimientos; estado vacío; 390–1440 px sin desbordes.
- *Palanca de corte:* KPIs + barras (3) / dona + ranking + estados (2).
- *Independencia:* maquetable con fixtures.

**A4 · Finalizar cartera e imprimir el balance — 3 pts · Iter 2 · web**
- *Aceptación:* impresión legible sin shell de la app (`@media print`); finalizar con confirmación → inactiva + `fechaCierre`; bloqueo total de escrituras (`CARTERA_CERRADA`); irreversible en el MVP; no administrador no ve el botón; layout estable en 390 px.
- *Independencia:* usa A1/A2 del mismo carril; no espera A5.

**A5 · Histórico de carteras finalizadas — 2 pts · Iter 2 · web**
- *Aceptación:* lista por `fechaCierre` descendente; buscador y filtro; cartera activa no aparece; detalle en solo lectura con balance congelado; miembro ve solo donde participó; cartera finalizada sin movimientos muestra $0.
- *Independencia:* fixtures ya inactivas; sin depender de A4.

#### Historia flotante

**F1 · Chat de cartera (#19) — 5 pts · Iter 3/colchón · web + móvil**
- *Aceptación:* mensajes cronológicos con autor; máx. 500 caracteres con contador; solo miembros leen/escriben; cartera finalizada en solo lectura; envío optimista sin duplicados; refresco por *polling* cada 5 s (WebSocket = fase 2); sin edición, borrado ni push en el MVP.
- *Palanca de corte:* web (3) / móvil (2).
- *Independencia:* modelo `Mensaje` + fixtures; se prueba con dos cuentas demo.

### 10.6 Plan de iteraciones en paralelo

| Iteración | Diego (C1) | Aideé (C2) | Vanessa (C3) | Damián (C4) | Demo del incremento |
| :---: | --- | --- | --- | --- | --- |
| **0** (3 días) | C0.1 | C0.2 | C0.4 + C0.5 | C0.3 | Contrato firmado, fixtures en repo, mocks operando y vectores dorados en verde |
| **1** (2 sem) | I1, I2 | K1, K2 | M1 | A1, A2 | Login/registro web, cartera + QR, gasto desde móvil (mock), saldos y liquidación probados |
| **2** (2 sem) | I3 | K3, K4 | M2, M3 | A3 | Auth móvil, escanear/unirse (o capturar el código), lista y edición de movimientos, resumen con gráficas |
| **3** (2 sem) | I4, I5 | K5 | M4, M5 | A4, A5 | Perfil y contribuyentes, conservar código al entrar, colaboraciones, finalizar + imprimir, histórico |
| **Colchón** | F1 (chat) · deuda técnica · integración · pruebas de usuario | | | | |

### 10.7 Trazabilidad: de las 14 historias originales a los 4 carriles

| Historia original | Se convierte en |
| --- | --- |
| HU-01 Iniciar sesión | I1, I3 |
| HU-02 Crear cuenta | I2, I3 |
| HU-03 Panel de bienvenida | M5 |
| HU-04 Crear y administrar carteras | K1 |
| HU-05 Resumen y estadísticas | A1, A3 |
| HU-06 Invitar con QR y clave | K2 |
| HU-07 Unirme escaneando/abriendo/escribiendo | K3, K4, K5 |
| HU-08 Administrar contribuyentes | I5 |
| HU-09 Registrar en segundos | M1 |
| HU-10 Consultar, filtrar y editar | M2, M3 |
| HU-11 Contribuir en carteras ajenas | M4 |
| HU-12 Cerrar cartera y balance | A1, A2, A4 |
| HU-13 Carteras finalizadas (histórico) | A5 |
| HU-14 Ajustar perfil y preferencias | I4 |
| *(nuevas)* | C0.1–C0.5 (cimientos), F1 (chat #19) |

### 10.8 Remapeo del tablero Taiga

| Tarjeta actual | Acción | Nueva historia |
| --- | --- | --- |
| #4 Invitar con QR y clave | Editar | K2 |
| #5 Obtener el código | Editar | K3 |
| #6 Validar y confirmar | Editar | K4 |
| #7 Conservar el código | Editar | K5 |
| #8 Administrar contribuyentes | Editar | I5 |
| #9 Registrar en segundos | Editar | M1 |
| #10 Consultar, filtrar y editar | **Dividir** | M2 + M3 |
| #11 Saldos por integrante | Editar | A1 |
| #12 Liquidación sugerida | Editar | A2 |
| #13 Finalizar e imprimir | Editar | A4 |
| #15 Resumen y estadísticas | Editar | A3 |
| #16 Contribuir en carteras ajenas | Editar | M4 |
| #17 Consultar histórico | Editar | A5 |
| #18 Ajustar perfil | Editar | I4 |
| #19 CHAT | Estimar (5) | F1 |
| — | **Crear** | C0.1–C0.5, I3, M5 |

### 10.9 Riesgos y mitigación

| Riesgo | Mitigación |
| --- | --- |
| Cámara y permisos en Android heterogéneo | Captura manual desde el día 1; `EscanerCodigo` con implementación fake; pruebas en 2 dispositivos físicos |
| "Cuentas descuadradas" por redondeos | Tolerancia ± $1.00, suma de saldos verificada y vectores de centavos impares en CI |
| Web Share API no disponible | *Fallback* a portapapeles y descarga del QR |
| Privacidad entre miembros | Matriz de permisos validada con las 4 cuentas demo; contacto nunca visible |
| Cambios de contrato a mitad de iteración | PR al contrato + aviso; los mocks absorben el cambio sin romper pantallas |

> **Detalle ampliado** (fichas completas, criterios línea por línea, reglas de ramas y revisión): `backlog_tecnico_y_reparto.md`.
