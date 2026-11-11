# Despliegue en Azure, CI/CD y dominio personalizado

> Última actualización: 10/11/2026.

Este documento describe cómo está desplegado FinanzApp, cómo se armó y cómo operarlo.

## URLs

| Entorno | URL |
|---|---|
| Aplicación (producción) | https://finanzapp.vellumdigitall.online |
| Health check | https://finanzapp.vellumdigitall.online/prueba |
| Azure por defecto | https://finanzapp-efaydwe0heemd0ad.mexicocentral-01.azurewebsites.net |
| Sitio anterior (GitHub Pages) | https://www.vellumdigitall.online |

El frontend y la API viven en el **mismo contenedor**: Flask sirve el build de React desde `wwwroot` y las rutas de la API en la raíz (`/auth`, `/carteras`, etc.).

## Arquitectura

```text
Push a main
└── GitHub Actions (.github/workflows/ci-deploy.yml)
    ├── pruebas (reutiliza ci-develop.yml)
    │   ├── backend: pytest
    │   └── web: npm ci + lint + build
    └── build-and-deploy
        ├── docker build
        ├── smoke test del contenedor (con DB falsa)
        ├── login a Azure con OIDC (sin contraseña)
        ├── push de la imagen a ACR
        ├── deploy a la Web App
        └── health check /prueba

Navegador
└── Cloudflare (HTTPS, Universal SSL)
    └── Worker finanzapp-proxy (reescribe el Host)
        └── Azure Web App (contenedor Linux)
            ├── Flask + React
            └── SQL Server externo
```

## Recursos de Azure

| Recurso | Nombre |
|---|---|
| Grupo de recursos | `finanzapp` |
| Web App (contenedor Linux) | `finanzapp` |
| App Service Plan | `ASP-finanzapp-ac51` (F1 Free) |
| Azure Container Registry | `finanzappacr` (Basic) |
| App registration de CI | `finanzapp-ci` |
| Base de datos | SQL Server externo (configurado en app settings) |

La Web App usa una **identidad administrada** con rol `AcrPull` sobre el ACR para jalar la imagen. El pipeline usa la app registration `finanzapp-ci` con OIDC y los roles `Contributor` (grupo de recursos) y `AcrPush` (ACR).

## Cómo se armó

### 1. Dockerfile y servido del frontend

- El `Dockerfile` vive en la raíz y construye dos etapas:
  - `node:22-alpine` compila `web_FinanzaApp/` con Vite.
  - `python:3.13-slim-bookworm` instala dependencias, el driver `msodbcsql18` y gunicorn, y copia el build a `/app/wwwroot`.
- Se ejecuta con `gunicorn ... run:app` como usuario `appuser`.
- `Backend_FinanzaApp/app/__init__.py` sirve `wwwroot`: archivos estáticos si existen y `index.html` como fallback del SPA. Sin build, `/` responde el JSON de la API.
- `.dockerignore` excluye `.env`, `.venv`, `node_modules`, `dist` y el proyecto móvil.

### 2. App registration y credencial federada (OIDC)

1. Entra ID → **App registrations** → `finanzapp-ci` (single tenant, sin redirect URI).
2. **Certificados y secretos → Credenciales federadas → GitHub Actions**:
   - Organización: `IDGS-802-23002541`
   - Repositorio: `FinanzApp`
   - Entidad: **Environment** → `production`
   - Subject resultante:
     `repo:IDGS-802-23002541@<owner_id>/FinanzApp@<repo_id>:environment:production`
3. Permisos IAM:
   - `Contributor` sobre el grupo de recursos `finanzapp`.
   - `AcrPush` sobre `finanzappacr`.

> ⚠️ El asistente del portal generó IDs de organización/repositorio equivocados en el primer intento y el login falló con `AADSTS700213: No matching federated identity record found`. Los IDs correctos son los que devuelve la API de GitHub:
> `GET https://api.github.com/repos/IDGS-802-23002541/FinanzApp` → `id` y `owner.id`.
> Si vuelve a pasar, corrige el subject de la credencial federada con esos valores.

### 3. Secretos de GitHub

En **Settings → Secrets and variables → Actions** (repositorio o environment `production`):

| Secreto | Dónde se obtiene |
|---|---|
| `AZURE_CLIENT_ID` | App registration `finanzapp-ci` → Información general → Id. de aplicación (cliente) |
| `AZURE_TENANT_ID` | Entra ID → Información general → Id. de inquilino |
| `AZURE_SUBSCRIPTION_ID` | Suscripciones → Id. de suscripción |

No se usa client secret ni contraseña: la autenticación es OIDC con la credencial federada.

### 4. Workflow de deploy

`.github/workflows/ci-deploy.yml`:

- Se dispara con **push a `main`** o manualmente (`workflow_dispatch`).
- Job `pruebas`: llama a `ci-develop.yml` con `workflow_call`, así el deploy corre **exactamente** las mismas pruebas que `develop` (pytest del backend y lint/build del web).
- Job `build-and-deploy` depende de `pruebas`:
  1. Construye la imagen.
  2. Corre un **smoke test**: levanta el contenedor con DB falsa y espera a que `/` responda (máx. 30 s). Si no arranca, imprime los logs y falla antes de tocar Azure.
  3. Login OIDC, `az acr login`, push de los tags `<sha>` y `latest`.
  4. `azure/webapps-deploy@v3` despliega el tag del commit.
  5. Verifica `https://<host>/prueba`.

### 5. App settings de la Web App

En **Web App `finanzapp` → Configuration → Application settings**:

| Variable | Uso |
|---|---|
| `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a SQL Server |
| `SECRET_KEY`, `JWT_SECRET_KEY` | Firma de sesiones y tokens |
| `JWT_ACCESS_MINUTOS`, `REFRESH_TOKEN_DIAS` | Duración de tokens |
| `WEBSITES_PORT=8000` | Puerto de gunicorn |

Sin las variables `DB_*`, el contenedor **no arranca** (`RuntimeError: Either 'SQLALCHEMY_DATABASE_URI' or 'SQLALCHEMY_BINDS' must be set`).

### 6. Dominio personalizado con Cloudflare

El dominio `vellumdigitall.online` está registrado en Namecheap y usa los nameservers de Cloudflare. El subdominio de la app es `finanzapp.vellumdigitall.online`.

Registros relevantes:

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| CNAME | `finanzapp` | `finanzapp-efaydwe0heemd0ad.mexicocentral-01.azurewebsites.net` | Proxied |
| A / CNAME | `@` y `www` | GitHub Pages (sitio anterior) | DNS only |
| MX / TXT | `@` | Correo de Namecheap | DNS only |

El sitio anterior se dejó intacto en la raíz y `www`.

**Por qué hay un Worker:** App Service en el plan F1 no permite dominios personalizados, y en Cloudflare la opción de reescribir el `Host` (Origin Rules) es solo Enterprise. Sin reescribir el Host, Azure responde su propio 404. El Worker hace de proxy:

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = "finanzapp-efaydwe0heemd0ad.mexicocentral-01.azurewebsites.net";
    return fetch(new Request(url, request));
  },
};
```

- Worker: `finanzapp-proxy`.
- Ruta: `finanzapp.vellumdigitall.online/*`.
- SSL/TLS de Cloudflare: modo **Full** (no Flexible, porque Azure fuerza HTTPS y se produciría un bucle).
- El Worker es infraestructura externa al repo. Si se borra, el subdominio deja de funcionar (el registro CNAME solo no basta).

### 7. App móvil

`movil_FinanzaApp/app/build.gradle.kts` define:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://finanzapp.vellumdigitall.online/\"")
```

Para desarrollar contra el backend local, cambiar a `http://10.0.2.2:5000/` (el manifiesto de debug permite HTTP local).

## Cómo se usa

### Desplegar una nueva versión

1. Integrar los cambios en `develop` y probar el CI.
2. Mergear o pushear a `main`.
3. El workflow `ci-deploy` corre solo: pruebas → imagen → smoke test → ACR → Web App → health check.
4. Ver el run en **Actions** y confirmar que el último paso (`Verificar health check`) pasó.

El deploy también se puede lanzar a mano desde **Actions → Build y deploy a Azure Web App → Run workflow** (rama `main`).

### Verificar que está arriba

```bash
curl -I https://finanzapp.vellumdigitall.online/
curl https://finanzapp.vellumdigitall.online/prueba
```

`/prueba` devuelve `200` con `{"ok":true,"data":{"base":"...","tablas":N}}` si la API conecta a SQL Server; si devuelve `503`, el deploy falla en el health check.

### Desarrollo local

**Backend**

```bash
cd Backend_FinanzaApp
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # si existe; si no, crear .env con las variables
flask --app run.py run --debug
```

**Web**

```bash
cd web_FinanzaApp
npm ci
npm run dev
```

En desarrollo, `VITE_API_URL` vacío hace que Vite reenvíe `/auth` y `/carteras` a `http://127.0.0.1:5000` (ver `vite.config.js`). En producción el bundle usa rutas relativas al mismo dominio.

**Móvil**

Abrir `movil_FinanzaApp/` en Android Studio y ejecutar. Por defecto apunta al dominio de producción; para local, cambiar `API_BASE_URL` a `http://10.0.2.2:5000/`.

**Probar la imagen Docker localmente**

```bash
docker build -t finanzapp .
docker run --rm -p 8000:8000 \
  -e DB_SERVER=ci -e DB_NAME=ci -e DB_USER=ci -e DB_PASSWORD=ci \
  finanzapp
```

### Rollback

La forma más simple es revertir el commit en `main` y pushear: el workflow vuelve a construir y desplegar esa versión.

Alternativa: apuntar la Web App a un tag anterior del ACR:

```bash
az webapp config container set -g finanzapp -n finanzapp \
  --container-image-name finanzappacr.azurecr.io/finanzapp:<sha-anterior>
```

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `AADSTS700213: No matching federated identity record` | Subject de la credencial federada no coincide | Verificar `owner.id`/`id` del repo en la API de GitHub y corregir el subject |
| `404` con página “Microsoft Azure Web App” en el subdominio | El `Host` llega con el dominio personalizado | Revisar el Worker `finanzapp-proxy` y su ruta |
| `503` en el health check | BD inaccesible o variables `DB_*` mal | Revisar app settings y firewall de la BD |
| Contenedor no arranca: `SQLALCHEMY_DATABASE_URI` | Faltan variables `DB_*` | Agregarlas en Configuration → Application settings |
| HTTPS del subdominio falla al conectar | Certificado Universal SSL pendiente | Esperar a que Cloudflare lo emita (SSL/TLS → Edge Certificates) |
| El build de Docker falla en GitHub | Cambios en rutas del Dockerfile o dependencias | Correr `docker build .` localmente y revisar el paso que falla |
| Tests de deploy fallan | Mismo CI que `develop` | Correr `pytest` y `npm run lint && npm run build` localmente |

## Limitaciones conocidas

- **Plan F1 Free:** no admite dominios personalizados directos. El subdominio depende del Worker de Cloudflare. Si se quiere independizar de Cloudflare, hay que subir a B1 o superior y agregar el dominio en Azure.
- **Rutas compartidas API/SPA:** `/carteras` y `/carteras/:id` existen en ambos lados. Navegar dentro de la app funciona, pero una recarga directa en esas rutas devuelve el `401` JSON de la API en vez del `index.html`. Pendiente: mover la API a `/api` o usar hash routing.
- **Logs de la Web App deshabilitados:** para depurar en producción hay que habilitar `az webapp log config --docker-container-logging filesystem` y usar `az webapp log tail`.
- **El Worker no está versionado en el repo:** su código está en este documento; si se modifica, actualizarlo aquí.

## Cambios del 9–10/11/2026

| Commit | Cambio |
|---|---|
| `34f90d5` | Corrige rutas del Dockerfile, instala ODBC 18 y sirve el front desde Flask |
| `9a066bf` | Usa los nombres reales de Azure en `ci-deploy.yml` |
| `768ac7f` | Agrega pruebas y smoke test antes del deploy (reutiliza `ci-develop.yml`) |
| `8e9ab85` | Limpia warning de shellcheck en el smoke test |
| `69e8f0d` | Merge a `main`: “primer intento de deploy” |
| `bce3518` | “Segundo intento de deploy” (exitoso) |
| `baf4a00` | App móvil apunta a `https://finanzapp.vellumdigitall.online/` |

Infraestructura creada fuera del repo: app registration `finanzapp-ci` con credencial federada y roles, secretos de GitHub, app settings de la Web App, DNS en Cloudflare y Worker `finanzapp-proxy`.

## Referencias

- [Workflow de deploy](../.github/workflows/ci-deploy.yml)
- [Workflow de pruebas](../.github/workflows/ci-develop.yml)
- [Dockerfile](../Dockerfile)
- [Backend](./backend.md)
- [Web](./web.md)
- [Móvil](./movil.md)
