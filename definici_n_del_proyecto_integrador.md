# Universidad Tecnológica de León
## Ingeniería en Desarrollo y Gestión de Software 

### Definición Proyecto Integrador
**Materia:** Aplicaciones Web Progresivas  
**Integrantes:**
* Diego Yair Borja Romero
* Aideé Vanessa Casillas Tapia
* Vanesa Yassmin Rea Muñoz
* Antonio Damián Rodriguez Alarcón

**Fecha:** 14 de septiembre del 2026  
**Lugar:** León, Guanajuato  

---

## Proyecto Final: FinanzApp

**FinanzApp** es una plataforma web y móvil para la gestión de finanzas personales y colaborativas mediante "carteras" (para eventos/viajes o espacios compartidos como el hogar). Permite a los usuarios crear y administrar sus propias carteras o unirse a las de otros.

* **App Móvil:** Diseñada para el registro rápido e individual de ingresos y gastos diarios, unión a carteras mediante escaneo QR y consulta de movimientos.
* **Panel Web:** Funciona como un centro de control analítico con métricas, balances, administración de participantes, cierre de carteras y reportes generales.

---

### Problemática 
En México existe un alto grado de analfabetismo financiero y una falta de herramientas adecuadas para coordinar gastos compartidos. Esto complica la administración del hogar y la organización de eventos o viajes en grupo, generando descontrol presupuestario, falta de transparencia y desacuerdos entre los involucrados.

---

### Justificación
FinanzApp resuelve la falta de control económico grupal centralizando la información financiera en un entorno accesible y transparente. Su arquitectura dual simplifica el seguimiento cotidiano desde el celular y ofrece un análisis estratégico en la web, promoviendo la educación financiera, el consumo responsable y la colaboración organizada entre las personas.

---

## Modelo de Datos y Entidades (CRUDs)

A partir del diseño del sistema, se han estructurado las siguientes entidades principales con sus respectivos atributos:

### 1. Usuario
* `idUsuario` (PK)
* `nombreUsuario`
* `APaterno`
* `AMaterno`
* `correo`
* `contrasena`
* `rol` *(Admin / Miembro)*
* `fechaCreacion`

### 2. Cartera
* `idCartera` (PK)
* `nombreCartera`
* `miembros`
* `presupuestoInicial` *(Nullable)*
* `descripcion`
* `categoriaCartera` (FK)
* `fechaCreacion`

### 3. CategoriaCartera
* `idCategoriaCartera` (PK)
* `nombreCategoriaCartera`  
  * *Ejemplos / Tipos:*
    * **Hogar:** Enfocado en estadísticas continuas de gastos recurrentes.
    * **Viaje / Evento:** Incluye campos adicionales como `fechaInicio` y `fechaFin`.

### 4. CategoriaGasto / Transacciones
* `idCategoriaGasto` (PK)
* `nombreGasto` *(Ejemplos: Gas, Estadías, Alcohol, Alimentos, etc.)*
* `monto`
* `foto` *(Nullable)*
* `idUsuario` (FK)
* `fecha`

---

## Módulos y Flujos de Trabajo (Web vs. Móvil)

El sistema agrupa sus funcionalidades principales en 4 Módulos Base:
1. **Landing / Login**
2. **Carteras**
3. **Contribuyentes**
4. **Transacciones / Gastos**

### Plataforma WEB (Centro de Control Analítico)

* **Landing Page:** Presentación del producto, características clave e información general.
* **Login / Registro:**
  * Inicio de sesión con autenticación.
  * Registro y creación de cuentas de usuario.
* **Módulo Bienvenida:** Vista general e indicadores rápidos del usuario.
* **Carteras (CRUD):**
  * **Estadísticas de Cartera:** Consulta gráfica por `idCartera`.
  * **Generar QR:** Generación de código QR y clave única para invitar contribuyentes.
* **Contribuyentes (CRUD):**
  * **Meter Contribuyente:** Registro/adición de participantes a la cartera.
  * **Borrar Contribuyente:** Eliminación de miembros de una cartera.
  * **Consultar Información:** Vista de datos de contribuyentes (nombre/filtro por nombre).
* **Transacciones (CRUD) & Cierre:**
  * Registro y gestión de movimientos.
  * **Finalizar Cartera:** Generación de **Balance de Gastos** final (cierre financiero del evento/viaje o período).
* **Carteras a las que contribuyo (Read):**
  * Vista de lectura para carteras ajenas donde el usuario es colaborador.
  * Registro de gastos asignados ($-\text{gastos}$).
* **Carteras Inactivas (Read):** Histórico y consulta de carteras archivadas.
* **Ajustes:** Configuración y gestión de perfil de la cuenta.

---

### Plataforma MÓVIL (Registro Rápido en Campo)

* **Login:** Autenticación rápida de usuario.
* **Movimientos de Cartera:** Interfaz optimizada para el registro de ingresos y egresos diarios.
* **Unirse a Cartera:** Funcionalidad para integrarse a una cartera existente mediante **Escaneo de Código QR**.
* **Módulo Bienvenida / Consulta:** Acceso directo a resumen rápido y accesos directos a carteras.
* **Ajustes:** Preferencias de cuenta y ajustes de eventos.