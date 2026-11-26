# Guía del SLA y las pruebas (en simple)

Esta guía explica qué pidió el profesor, qué decidió el equipo y cómo se llena el Formato de Pruebas SLA. Sin tecnicismos de más.

El Word vive fuera del repo, en:
`C:\PERSONAL\uni\10mo-2026\GPDS\Formato_Pruebas_SLA_FinanzApp.docx`

---

## 1. Qué pidió Ruiz

Tres entregables:

1. **Una app que funcione y se pueda usar.**
2. **Pruebas automáticas** que revisen que los módulos importantes:
   - sigan **disponibles** (que respondan), y
   - sigan **funcionando** (que hagan lo que deben),
   y que dejen un **registro (log)** de lo que pasó.
3. **Un reporte de máximo 3 páginas** (más portada) que explique:
   - qué pruebas se hicieron,
   - qué logs se generaron,
   - y cómo con esos logs se demuestra el **nivel de servicio**.

Piénsalo como un chequeo médico:

- **Pruebas** = los análisis que le haces al sistema.
- **Logs** = la bitácora donde queda anotado cada latido.
- **SLA / SLO / SLI** = el acuerdo de “el paciente debe estar estable el 99% del mes”; con la bitácora demuestras si se cumplió.

---

## 2. Qué significan SLI, SLO y SLA

Con la misma situación para las tres:

- **SLI** = el **dato** que mides. Ejemplo: “de cada 100 visitas al portal, 99 respondieron bien”. Es un número.
- **SLO** = la **meta** que quieres. Ejemplo: “queremos que sea mínimo 99%”. Es un objetivo.
- **SLA** = el **acuerdo** con el cliente y qué pasa si no cumples. Ejemplo: “nos comprometemos a 99%; si no, hay reunión y penalización”. Es el contrato.

Regla para recordarlo: **SLI se mide, SLO se busca, SLA se firma.**

---

## 3. Qué decidimos medir

El SLA de Ruiz tiene 17 cosas. Medir las 17 en el tiempo disponible es demasiado. El equipo eligió **5**, las más importantes y alcanzables:

| # | Qué medimos | Pregunta simple | SLI del SLA |
| --- | --- | --- | --- |
| 1 | Disponibilidad del portal | ¿Está prendido y responde? | SLI-02 |
| 2 | Consulta de carteras | ¿Me lista mis carteras? | SLI-06 |
| 3 | Abrir una cartera | ¿Me muestra el detalle? | SLI-06 |
| 4 | Crear transacción | ¿Registra el gasto o ingreso? | SLI-04 y SLI-05 |
| 5 | Soporte / ticket | ¿Puedo crear y cerrar un ticket? | SLI-15 y SLI-16 |

Dos ideas clave:

- No inventamos nada: esos endpoints ya existen en la app.
- El reporte dirá **“medimos 5 de 17”**. Es honesto; fingir que se mide todo es lo que el profesor detectaría.

---

## 4. Las piezas y qué hace cada una

1. **`/salud` (health check)** — el *pulso*.
   Dirección de la API que contesta: “estoy viva y la base de datos también”. Si la base falla, contesta error. No dice si todo funciona, solo si está prendido.

2. **Log de accesos** — la *bitácora*.
   Cada petición apunta una línea con: qué pidió, si salió bien, cuánto tardó y qué usuario fue. Sin contraseñas ni datos sensibles. Es la evidencia.

3. **Monitor** (`scripts/monitoreo_sla.py`) — el *robot enfermero*.
   Cada minuto pregunta “¿está prendido el portal?” y apunta la respuesta. El archivo se llama **JSONL**: una lista donde cada línea es un latido.

4. **Calculadora** (`scripts/calcular_sli.py`) — el que *saca cuentas*.
   Lee los latidos y el log de accesos, y los convierte en porcentajes (“disponibilidad 99.4%”, “95% de consultas bajo 2 s”). Lo exporta a **CSV** (tabla que abre Excel).

5. **Pruebas pytest** (P-01 a P-07) — los *análisis de funcionamiento*.
   No preguntan “¿está prendido?”, preguntan “¿hace bien su trabajo?”. Ejemplo: listar carteras, abrir una, crear una transacción, abrir y cerrar un ticket.

6. **Formato Word** — la *hoja de resultados*.
   Donde se vacían los números y la evidencia para entregarlos.

---

## 5. Cómo se conectan

```
Pruebas pytest  → dicen "funciona: sí/no"
Log de accesos  → guarda cada petición (evidencia)
Monitor         → cada minuto: "¿está prendido?" → JSONL
Calculadora     → JSONL + log → porcentajes → CSV
Todo eso        → se copia al Word
```

Así se cubre lo que pidió Ruiz:

- “que jale bien” → pytest P-01 a P-07.
- “disponibilidad con logs” → monitor + `/salud` + log de accesos.
- “reporte” → el Word con los CSV y resultados.

---

## 6. Cómo llenar el Formato de Pruebas SLA

### Lo que ya viene prellenado (no se toca)

- Portada.
- Objetivo y alcance.
- Mapeo procedimiento → SLI → SLO.
- Catálogo P-01 a P-07.
- Fórmulas de evaluación.

Eso salió del SLA y de los endpoints reales. Solo se llena lo que depende de **haber corrido las pruebas**.

### Paso 1: junta los tres resultados

Todo se corre desde `Backend_FinanzaApp`:

```powershell
cd C:\PERSONAL\utl\decimo\Proyecto\Backend_FinanzaApp

# 1) Pruebas de funcionamiento (dice cuántas pasan)
.venv\Scripts\python.exe -m pytest -q

# 2) Monitor de disponibilidad (5 pruebas, una por minuto)
#    Salida: Backend_FinanzaApp\metricas\demo.jsonl
.venv\Scripts\python.exe scripts\monitoreo_sla.py --repeticiones 5 --intervalo 60 --salida metricas\demo.jsonl

# 3) Cálculo de SLI a CSV
#    Salida: Backend_FinanzaApp\reportes\sli.csv
.venv\Scripts\python.exe scripts\calcular_sli.py --monitoreo "metricas\*.jsonl" --csv reportes\sli.csv
```

Notas:

- El monitor apunta por defecto a `https://finanzapp.vellumdigitall.online/`. Para otra URL: `--url "https://..."`.
- `pytest -q` imprime algo como `7 passed`; ese número va al reporte.
- El CSV trae `% de disponibilidad` y `p95`; esos valores se copian al Word.
- En Linux/macOS cambia `.venv\Scripts\python.exe` por `.venv/bin/python` y `metricas\*.jsonl` por `"metricas/*.jsonl"`.

Si además exportaste el log de accesos:

```powershell
$env:LOG_ARCHIVO = "logs\acceso.jsonl"
.venv\Scripts\python.exe scripts\calcular_sli.py --monitoreo "metricas\*.jsonl" --accesos "logs\acceso.jsonl" --csv reportes\sli.csv
```

### Paso 2: llena la tabla de autoevaluación

Columnas:

| Columna | Qué se pone | Ejemplo |
| --- | --- | --- |
| ID | Ya está | P-01 |
| Criterio | Ya está | El portal responde 200 y sirve HTML |
| Peso | Ya está | 20 |
| Cumple (Sí/No) | Si la prueba pasó, Sí; si no, No | Sí |
| Puntos | El peso solo si cumple; si no, 0 | 20 |
| Observaciones | Evidencia corta | “26/11, GET / devolvió 200” |

Al final se suman los Puntos. Máximo 100.

La tabla de pesos la hizo el equipo para calificar; el profesor no la pidió, pero da orden al reporte.

### Paso 3: llena el registro de ejecución

Una fila por cada vez que se corra todo:

| Columna | De dónde sale |
| --- | --- |
| Fecha | El día que se corrió |
| Ejecutado por | Nombre de quien corrió |
| URL | La del portal |
| Resultado global | `7/7` de pytest |
| % Disponibilidad | Del CSV de la calculadora |
| p95 latencia | Del CSV |
| Log generado | Nombre del artifact o del JSONL |

Ejemplo de fila:
`2026-11-26 | Damián | https://finanzapp.vellumdigitall.online/ | 7/7 | 99.4 | 320 | artifact sla-123`

---

## 7. El reporte de 3 páginas

Máximo 3 páginas **más la portada**. Una página por cada cosa que pidió Ruiz.

**Portada (aparte):** título, materia, profesor, equipo, fecha.

**Página 1 — Qué pruebas se hicieron y cómo**
- “Se probaron 5 procedimientos críticos”.
- Tabla corta P-01 a P-07: procedimiento, qué verifica, resultado (Sí/No).
- Herramientas en una línea: pytest, monitor y calculadora.
- Nada de código completo.

**Página 2 — Qué logs se generaron**
- Una línea de ejemplo del log JSON.
- De dónde salen: stdout/Azure y el JSONL del monitor.
- Qué campos tiene y por qué (evidencia, sin datos sensibles).
- Una captura o fragmento real.

**Página 3 — Cómo se evalúa el nivel de servicio**
- SLI/SLO/SLA en tres renglones.
- Tabla de resultados: `SLI | medido | meta | cumple`. Ejemplo: SLI-02 | 99.4% | 99% | Sí.
- Conclusión honesta: “medimos 5 de 17 SLI; el resto queda fuera por alcance y tiempo”.

---

## 8. Resumen en cinco frases

1. Ruiz quiere: app funcional, pruebas automáticas con logs, y reporte con datos.
2. Medimos 5 procedimientos críticos, no los 17 del SLA.
3. Las pruebas pytest dicen si **funciona**; `/salud` y el monitor dicen si **está prendido**.
4. El log y el JSONL son la evidencia; la calculadora los vuelve porcentajes y CSV.
5. El Word y el reporte de 3 páginas solo vacían esos resultados.

---

## 9. Costos

- Repo público: minutos de GitHub Actions gratis.
- Logs a stdout: sin cobro de ingesta; solo almacenamiento del plan de App Service.
- No se usa Application Insights ni Log Analytics, que sí cobran.

## 10. Referencia rápida de archivos

| Archivo | Para qué sirve |
| --- | --- |
| `app/observabilidad.py` | Log JSON de cada petición |
| `app/__init__.py` (`/salud`) | Health check de API + BD |
| `scripts/monitoreo_sla.py` | Mide disponibilidad del portal |
| `scripts/calcular_sli.py` | Calcula SLI y exporta CSV |
| `.github/workflows/monitoreo-sla.yml` | Automatiza el monitor cada hora |
| `tests/test_salud.py` | Prueba `/salud` |
| `docs/pruebas.md` | Comandos y detalle técnico |
| `docs/observaciones-sla.txt` | Ajustes pendientes al SLA |
