# Universidad Tecnológica de León
## Ingeniería en Desarrollo y Gestión de Software 

### Proyecto FinanzApp – Arquitectura y Metodología seleccionada
**Materia:** Desarrollo Móvil Integral  
**Docente:** Dario Hernández Rosas  
**Grupo:** IDGS1002  
**Integrantes:**
* Diego Yair Borja Romero
* Aideé Vanessa Casillas Tapia 
* Vanessa Yassmin Rea Muñoz
* Antonio Damián Rodríguez Alarcón

**Fecha:** 15 de septiembre del 2026  

---

## Contenido
1. [Arquitectura de Software](#arquitectura-de-software)
2. [Metodología Ágil Kanban](#metodología-ágil-kanban)
3. [Herramienta de Gestión: Taiga](#herramienta-de-gestión-taiga)

---

## Arquitectura de Software

### MVVM (Model-View-ViewModel)

Divide la app en 3 capas que solo se hablan "hacia abajo" (la View nunca toca datos directo):

```
View (Pantalla: Eventos) 
   ↓
ViewModel (Estado UI) 
   ↓
Model (Room, Repositorio)
```
*`StateFlow` notifica los cambios a la `View`.*

#### Componentes de la Arquitectura:
* **View (Fragments + ViewBinding):** Solo dibuja y captura lo que toca el usuario. Sin lógica de negocio.
* **ViewModel (StateFlow):** Tiene la lógica de la UI y el "estado" de la pantalla. Sobrevive a rotaciones y cambios de configuración.
* **Model (Room + Repositorios):** Entidades, DAO, repositorios y dominio.
* **Adicionales:** Hilt (Inyección de dependencias) y Corrutinas.

#### Por qué MVVM y no MVC/MVP:
* **MVC:** El *Activity* termina siendo un "god object" gigante, acoplado y difícil de probar; no sobrevive a rotaciones.
* **MVP:** Separa mejor, pero el *Presenter* no es *lifecycle-aware* (se deben manejar fugas de memoria a mano y requiere mucho *boilerplate*).
* **MVVM:** Es la arquitectura oficial de Google. El *ViewModel* es testeable sin Android, resiste la rotación y se integra de forma nativa con Room + Hilt + StateFlow (lo cual el prototipo ya ha validado).

---

## Metodología Ágil Kanban

Para el desarrollo de FinanzApp se seleccionó la metodología **Kanban** debido a su enfoque visual, flexible y de flujo continuo. Esta metodología se adapta perfectamente al desarrollo de aplicaciones con dos plataformas (Web y Móvil), permitiendo:

* **Visualización del flujo de trabajo:** Mapeo claro de las etapas del desarrollo (Por hacer, En progreso, En revisión, Concluido).
* **Control del trabajo en proceso (WIP):** Limitación de tareas simultáneas para evitar cuellos de botella y priorizar la entrega constante de módulos funcionales.
* **Flexibilidad ante cambios:** Capacidad de reconfigurar prioridades rápidamente según las necesidades del diseño, las pruebas de usuario o la integración entre la aplicación móvil y el panel web.

---

## Herramienta de Gestión: Taiga

Para la implementación y seguimiento de Kanban se utilizará **Taiga**, una herramienta *open source* intuitiva y ágil, ideal para equipos de desarrollo de software:

* **Tableros Kanban interactivos:** Organización centralizada de las tareas (*User Stories* e *Epics*), asignación clara de responsabilidades a cada desarrollador y monitoreo visual del progreso en tiempo real.
* **Simplicidad y enfoque ágil:** Interfaz ligera que facilita el seguimiento de estados sin la complejidad de configuración de otras plataformas, optimizando el tiempo del equipo.
* **Gestión de incidencias y tareas:** Clasificación estructurada de errores (*bugs*) y tareas asociadas tanto al *backend/frontend* de la plataforma web como a la aplicación móvil.