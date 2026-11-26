# Guía de componentes — SLA y pruebas

Qué hace cada pieza, de qué se alimenta y cómo llega al **Formato de Pruebas SLA** (Word). El Word vive fuera del repo, en `C:\PERSONAL\uni\10mo-2026\GPDS\Formato_Pruebas_SLA_FinanzApp.docx`.

## 1. Componentes

| Archivo | Para qué sirve | Se alimenta de | Produce |
| --- | --- | --- | --- |
| `app/observabilidad.py` | Log de cada petición HTTP en JSON | Petición HTTP + identidad del JWT | Una línea JSON en stdout |
| `app/__init__.py` (`GET /salud`) | Health check de API + BD | SQL Server (`DB_NAME()`, `SELECT 1`) | JSON `200` o `503` con `request_id` |
| `app/__init__.py` (`GET /prueba`) | Prueba vieja de conexión | SQL Server | JSON con base y número de tablas |
| `scripts/monitoreo_sla.py` | Mide disponibilidad del portal | URL pública (`https://finanzapp.vellumdigitall.online/`) | JSONL con `ok`, `status`, `duracion_ms` |
| `scripts/calcular_sli.py` | Calcula SLI y exporta CSV | JSONL del monitor + log de accesos | `reportes/sli.csv` y tabla en consola |
| `.github/workflows/monitoreo-sla.yml` | Automatiza el monitor | Cron de GitHub + script | Artifact JSONL por hora |
| `tests/test_salud.py` | Prueba `/salud` | App Flask (test client) | Resultado de pytest |
| `docs/pruebas.md` | Cómo correr todo | — (manual) | Guía de comandos |
| `docs/observaciones-sla.txt` | Ajustes pendientes al SLA | SLA Ruiz v1.0 | Checklist con avances |

## 2. Flujo de datos

```
Petición HTTP
  └─ observabilidad.py → stdout JSON → Azure Log Stream → (exportar) → log de accesos JSONL
                                                                          │
Monitor cada 60 s                                                         │
  └─ monitoreo_sla.py → JSONL ───────────────┐                            │
                                             ▼                            ▼
                              calcular_sli.py (regla 3 fallos) → reportes/sli.csv
                                             │
pytest (P-01..P-07) → resultado en consola ──┴──► Formato de Pruebas SLA (.docx)
```

## 3. De dónde se alimenta el Formato de Pruebas SLA

| Sección del Word | De dónde sale |
| --- | --- |
| Objetivo y alcance | Decisión del equipo: 5 procedimientos medidos |
| Mapeo procedimiento → SLI → SLO | SLA Ruiz v1.0, sección 7 (`docs/observaciones-sla.txt`) |
| Catálogo P-01 a P-07 | Endpoints reales en `app/routes/` y las pruebas de `tests/` |
| Formato de log | Campos que emite `app/observabilidad.py` |
| Cómo se evalúan los niveles | Fórmulas del SLA sección 7 + lógica de `scripts/calcular_sli.py` |
| Tabla de autoevaluación | Resultado de `pytest` + `reportes/sli.csv` |
| Registro de ejecución | Salida de pytest, JSONL del monitor, CSV y log de Azure |

## 4. Reglas del log

Se guarda: `ts, request_id, metodo, ruta, status, duracion_ms, es_5xx, usuario_id`.
No se guarda: contraseñas, tokens, `Authorization`, descripciones, body completo ni correo.

## 5. Costos

- Repo público: GitHub Actions gratis.
- Logs a stdout: sin cobro de ingesta; solo almacenamiento del plan de App Service.
- No se usa Application Insights ni Log Analytics.

## 6. Cómo correr (resumen)

Desde `Backend_FinanzaApp/`:

```powershell
.venv\Scripts\python.exe -m pytest -q
.venv\Scripts\python.exe scripts\monitoreo_sla.py --repeticiones 5 --intervalo 60 --salida metricas\demo.jsonl
.venv\Scripts\python.exe scripts\calcular_sli.py --monitoreo "metricas\*.jsonl" --csv reportes\sli.csv
```

Ver `docs/pruebas.md` para el detalle y para el log de accesos.
