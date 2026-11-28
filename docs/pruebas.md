# Pruebas y monitoreo de SLA

Cómo correr lo que mide los SLI de FinanzApp. Todo es Python estándar y pytest; no requiere dependencias nuevas.

## 1. Pruebas automáticas (pytest y vitest)

Desde la raíz del repositorio, el script corre backend y web de una vez:

```bash
python3 ejecutar_pruebas.py            # backend + web
python3 ejecutar_pruebas.py backend    # solo pytest
python3 ejecutar_pruebas.py web        # solo vitest
```

Devuelve código 0 solo si todo pasa.

Backend desde `Backend_FinanzaApp/`:

```bash
python -m pytest -q
```

Web desde `web_FinanzaApp/`:

```bash
npm run test
```

Cubre los módulos medidos:
- P-01 portal
- P-02 consulta de carteras
- P-03 abrir cartera
- P-04 / P-05 alta de transacción (válida e inválida)
- P-06 / P-07 soporte (crear, responder, cerrar)

En CI corre con `ci-develop.yml` en cada push y pull request a `develop`, y antes de cada despliegue de `ci-deploy.yml`. El job de web ejecuta `lint`, `test` y `build`.

## 2. Log de accesos (JSON)

Cada petición escribe una línea JSON en stdout. Azure la captura en el Log Stream sin costo de ingesta.

Campos: `ts, request_id, metodo, ruta, status, duracion_ms, es_5xx, usuario_id`.

Para guardarlo también en archivo local (opcional):

```bash
export LOG_ARCHIVO=logs/acceso.jsonl
```

Para verlo en Azure:

```bash
az webapp log tail -g finanzapp -n finanzapp
```

## 3. Monitor de disponibilidad (SLI-02)

```bash
python scripts/monitoreo_sla.py --repeticiones 5 --intervalo 60 --salida metricas/demo.jsonl
```

- `--repeticiones`: cuántas pruebas hace.
- `--intervalo`: segundos entre pruebas (60 = 1 por minuto, como pide el SLA).
- `--url`: por defecto `https://finanzapp.vellumdigitall.online/`.

En CI corre `.github/workflows/monitoreo-sla.yml`: un job por hora que hace 60 pruebas (1 por minuto) y sube el JSONL como artifact.

## 4. Cálculo de SLI a CSV

```bash
python scripts/calcular_sli.py \
  --monitoreo "metricas/*.jsonl" \
  --csv reportes/sli.csv
```

Si además exportas el log de accesos, agrégalo para calcular latencia y errores:

```bash
python scripts/calcular_sli.py \
  --monitoreo "metricas/*.jsonl" \
  --accesos "logs/acceso.jsonl" \
  --csv reportes/sli.csv
```

Calcula:
- SLI-02 disponibilidad (regla de 3 fallos consecutivos).
- SLI-04 alta de transacciones menor a 1500 ms.
- SLI-05 errores 5xx de transacciones.
- SLI-06 consulta de carteras menor a 2000 ms.
- SLI-08 éxito en gestión de carteras.

SLI-15 y SLI-16 (soporte) salen de las fechas de `TICKET` y `RESPUESTA_TICKET`; se calculan aparte contra la base.

## 5. Costos

- Repo público: minutos de GitHub Actions gratis.
- Logs a stdout: sin cobro de ingesta; solo consumen almacenamiento del plan de App Service. Pon retención corta (1-3 días).
- No se usa Application Insights ni Log Analytics, que sí cobran ingesta.
