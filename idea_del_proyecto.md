# FinanzApp — Idea del Proyecto

**Universidad Tecnológica de León**
**Ingeniería en Desarrollo y Gestión de Software**
**Grupo:** IDGS1002
**Lugar:** León, Guanajuato
**Fecha:** Septiembre 2026

**Integrantes:**
* Diego Yair Borja Romero
* Aideé Vanessa Casillas Tapia
* Vanessa Yassmin Rea Muñoz
* Antonio Damián Rodríguez Alarcón

---

## 1. Idea General

**FinanzApp** es una plataforma **web y móvil** para la gestión de finanzas personales y colaborativas mediante **"carteras"** (espacios compartidos para eventos, viajes o el hogar). El usuario puede crear y administrar sus propias carteras o unirse a las de otros.

El proyecto integra dos materias:
* **Aplicaciones Web Progresivas:** definición del producto, modelo de datos y plataforma web.
* **Desarrollo Móvil Integral:** arquitectura de software y metodología de trabajo.

---

## 2. Plataformas

| Plataforma | Rol | Enfoque |
| --- | --- | --- |
| **App Móvil** | Registro rápido en campo | Ingresos y gastos diarios, unión a carteras por escaneo QR, consulta de movimientos |
| **Panel Web** | Centro de control analítico | Métricas, balances, administración de participantes, cierre de carteras y reportes |

---

## 3. Problemática

En México existe un alto grado de **analfabetismo financiero** y una falta de herramientas adecuadas para coordinar **gastos compartidos**. Esto complica la administración del hogar y la organización de eventos o viajes en grupo, generando:

* Descontrol presupuestario.
* Falta de transparencia.
* Desacuerdos entre los involucrados.

---

## 4. Justificación

FinanzApp resuelve la falta de control económico grupal **centralizando la información financiera** en un entorno accesible y transparente. Su arquitectura dual simplifica el seguimiento cotidiano desde el celular y ofrece un análisis estratégico en la web, promoviendo la **educación financiera**, el **consumo responsable** y la **colaboración organizada**.

---

## 5. Módulos Base

1. Landing / Login
2. Carteras
3. Contribuyentes
4. Transacciones / Gastos

### 5.1 Plataforma WEB (Centro de Control Analítico)

* **Landing Page:** presentación del producto, características clave e información general.
* **Login / Registro:** autenticación, registro y creación de cuentas.
* **Módulo Bienvenida:** vista general e indicadores rápidos del usuario.
* **Carteras (CRUD):**
  * Estadísticas de cartera: consulta gráfica por `idCartera`.
  * Generar QR: código QR y clave única para invitar contribuyentes.
* **Contribuyentes (CRUD):**
  * Meter contribuyente: registro/adición de participantes a la cartera.
  * Borrar contribuyente: eliminación de miembros.
  * Consultar información: datos de contribuyentes (con filtro por nombre).
* **Transacciones (CRUD) & Cierre:**
  * Registro y gestión de movimientos.
  * Finalizar cartera: generación del **Balance de Gastos** final.
* **Carteras a las que contribuyo (Read):** carteras ajenas donde el usuario colabora, con registro de gastos asignados ($-\text{gastos}$).
* **Carteras Inactivas (Read):** histórico y consulta de carteras archivadas.
* **Ajustes:** configuración y gestión del perfil de la cuenta.

### 5.2 Plataforma MÓVIL (Registro Rápido en Campo)

* **Login:** autenticación rápida de usuario.
* **Movimientos de Cartera:** interfaz optimizada para el registro de ingresos y egresos diarios.
* **Unirse a Cartera:** integración a una cartera existente mediante **escaneo de código QR**.
* **Módulo Bienvenida / Consulta:** resumen rápido y accesos directos a carteras.
* **Ajustes:** preferencias de cuenta y ajustes de eventos.

---

## 6. Modelo de Datos y Entidades (CRUDs)

### Usuario
* `idUsuario` (PK)
* `nombreUsuario`
* `APaterno`
* `AMaterno`
* `correo`
* `contrasena`
* `rol` (Admin / Miembro)
* `fechaCreacion`

### Cartera
* `idCartera` (PK)
* `nombreCartera`
* `miembros`
* `presupuestoInicial` (Nullable)
* `descripcion`
* `categoriaCartera` (FK)
* `fechaCreacion`

### CategoriaCartera
* `idCategoriaCartera` (PK)
* `nombreCategoriaCartera`
  * **Hogar:** estadísticas continuas de gastos recurrentes.
  * **Viaje / Evento:** incluye campos adicionales `fechaInicio` y `fechaFin`.

### CategoriaGasto / Transacciones
* `idCategoriaGasto` (PK)
* `nombreGasto` (Gas, Estadías, Alcohol, Alimentos, etc.)
* `monto`
* `foto` (Nullable)
* `idUsuario` (FK)
* `fecha`

---

## 7. Arquitectura de Software: MVVM

La app se divide en 3 capas que solo se comunican "hacia abajo" (la View nunca toca datos directamente):

```
View (Pantalla: Eventos)
   ↓
ViewModel (Estado UI)
   ↓
Model (Room, Repositorio)
```

`StateFlow` notifica los cambios a la `View`.

### Componentes
* **View (Fragments + ViewBinding):** solo dibuja y captura la interacción del usuario. Sin lógica de negocio.
* **ViewModel (StateFlow):** lógica de la UI y estado de la pantalla. Sobrevive a rotaciones y cambios de configuración.
* **Model (Room + Repositorios):** entidades, DAO, repositorios y dominio.
* **Adicionales:** Hilt (inyección de dependencias) y Corrutinas.

### Por qué MVVM y no MVC/MVP
* **MVC:** la *Activity* termina como un "god object" acoplado y difícil de probar; no sobrevive a rotaciones.
* **MVP:** separa mejor, pero el *Presenter* no es *lifecycle-aware* (fugas de memoria manuales y mucho *boilerplate*).
* **MVVM:** arquitectura oficial de Google; el *ViewModel* es testeable sin Android, resiste la rotación y se integra de forma nativa con Room + Hilt + StateFlow.

---

## 8. Metodología: Kanban

Se seleccionó **Kanban** por su enfoque visual, flexible y de flujo continuo, ideal para un desarrollo con dos plataformas (Web y Móvil):

* **Visualización del flujo:** etapas claras (Por hacer, En progreso, En revisión, Concluido).
* **Control WIP:** límite de tareas simultáneas para evitar cuellos de botella y priorizar entregas constantes.
* **Flexibilidad ante cambios:** reconfiguración rápida de prioridades según diseño, pruebas de usuario o integración web-móvil.

### Herramienta de Gestión: Taiga
* **Tableros Kanban interactivos:** organización de *User Stories* y *Epics*, asignación de responsabilidades y monitoreo en tiempo real.
* **Simplicidad ágil:** interfaz ligera que agiliza el seguimiento de estados.
* **Gestión de incidencias:** clasificación de *bugs* y tareas de backend, frontend web y app móvil.

---

## 9. Resumen de Valor

| Aspecto | Definición |
| --- | --- |
| **Producto** | Plataforma web + móvil de finanzas personales y colaborativas por carteras |
| **Problema** | Descontrol presupuestario y falta de transparencia en gastos compartidos |
| **Diferenciador** | Registro rápido en móvil (QR) + análisis estratégico en web |
| **Arquitectura** | MVVM (View / ViewModel / Model) con Room, Hilt, StateFlow y Corrutinas |
| **Metodología** | Kanban gestionado en Taiga |
