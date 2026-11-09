# ---------- Etapa 1: compilar React ----------
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

COPY web_FinanzaApp/package*.json ./
RUN npm ci

COPY web_FinanzaApp/ ./
RUN npm run build          # genera /frontend/dist


# ---------- Etapa 2: runtime Python ----------
FROM python:3.13-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Driver ODBC 18 que exige config.py para SQL Server
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl gnupg ca-certificates \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
        | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list \
        -o /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 unixodbc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Backend_FinanzaApp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY Backend_FinanzaApp/ .
# El build de React queda en /app/wwwroot
COPY --from=frontend-build /frontend/dist ./wwwroot

RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "--timeout", "120", "--access-logfile", "-", "run:app"]
