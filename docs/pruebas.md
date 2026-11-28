# Pruebas y monitoreo de SLA

Cómo correr lo que mide los SLI de FinanzApp. Todo es Python estándar y pytest; no requiere dependencias nuevas.

## 1. Pruebas automáticas (pytest)

Desde `Backend_FinanzaApp/`:

```bash
python -m pytest -q
```

Cubre los módulos medidos:
- P-01 portal
- P-02 consulta de carteras
- P-03 abrir cartera
- P-04 / P-05 alta de transacción (válida e inválida)
- P-06 / P-07 soporte (crear, responder, cerrar)

En CI corre solo con `ci-develop.yml` en cada push a `develop`.

## 2. Log de accesos (JSON)

Cada petición escribe una línea JSON en stdout. Azure la captura en el Log Stream sin costo de ingesta.

Campos: `ts, request_id, metodo, ruta, status, duracion_ms, es_5xx, usuario_id`.

Para guardarlo también en archivo local (opcional):

```bash
export LOG_ARCHIVO=logs/acceso.jsonl
```

### Ver los logs en Azure

El contenedor ya escribe el JSON en stdout; hay que habilitar que App Service lo guarde.

1. Habilitar el registro (una sola vez):

```bash
az webapp log config -g finanzapp -n finanzapp --docker-container-logging filesystem
```

2. Ver en vivo:

```bash
az webapp log tail -g finanzapp -n finanzapp
```

También en el portal: Web App `finanzapp` → **Supervisión → Registro en streaming**.

3. Descargar lo ya escrito (para adjuntar la evidencia del mes):

```text
https://finanzapp-efaydwe0heemd0ad.scm.mexicocentral-01.azurewebsites.net/api/logs/docker
```

Devuelve la lista de archivos; cada uno se baja desde
`.../api/vfs/LogFiles/docker/<archivo>`. Las credenciales son las de publicación:
Web App → **Centro de implementación → Credenciales de FTP**.

4. Retención: App Service rota y borra esos archivos. Para conservar un mes completo
se descargan al cierre del periodo, o se activa **Registro de App Service → Almacenamiento
de blobs** con los días de retención que pida el SLA.

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
