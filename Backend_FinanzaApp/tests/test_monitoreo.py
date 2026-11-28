import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import admin_service, monitoreo_service


class UsuarioFalso:
    def __init__(self, rol_global):
        self.rolGlobal = rol_global


class ResultadoFalso:
    def __init__(self, valor):
        self.valor = valor

    def scalar_one(self):
        return self.valor


class SesionSondaFalsa:
    def __init__(self, base="FINANZAPP"):
        self.base = base
        self.consultas = 0

    def execute(self, _consulta):
        self.consultas += 1
        if self.consultas == 1:
            return ResultadoFalso(self.base)
        return ResultadoFalso(1)

    def rollback(self):
        pass


class SesionCaida:
    def execute(self, _consulta):
        from sqlalchemy.exc import SQLAlchemyError

        raise SQLAlchemyError("BD caída")

    def rollback(self):
        pass


def _app():
    return create_app()


def _limpiar():
    admin_service.limpiar_cache_metricas()
    monitoreo_service.limpiar_cache_monitoreo()


def _como(monkeypatch, rol_global):
    monkeypatch.setattr(monitoreo_service, "current_user", UsuarioFalso(rol_global))


def test_rutas_monitoreo_registradas():
    rutas = {
        (regla.rule, metodo)
        for regla in _app().url_map.iter_rules()
        for metodo in regla.methods
    }
    assert ("/monitoreo/sli", "GET") in rutas
    assert ("/monitoreo/sli/actualizar", "POST") in rutas


def test_monitoreo_requiere_token():
    _limpiar()
    cliente = _app().test_client()
    assert cliente.get("/monitoreo/sli").status_code == 401
    assert cliente.post("/monitoreo/sli/actualizar").status_code == 401


def test_no_admin_no_consulta_sli(monkeypatch):
    _limpiar()
    _como(monkeypatch, "CLIENTE")
    payload, status = monitoreo_service.obtener_sli()
    assert status == 403
    assert payload["ok"] is False


def test_sli_usa_cache_y_forzar_refresca(monkeypatch):
    _limpiar()
    _como(monkeypatch, "ADMIN")
    sesion = SesionSondaFalsa()
    monkeypatch.setattr(monitoreo_service.db, "session", sesion)
    monkeypatch.setattr(monitoreo_service, "historial", lambda: [])
    guardadas = {"n": 0}
    monkeypatch.setattr(
        monitoreo_service,
        "registrar_sonda",
        lambda sonda, base: guardadas.__setitem__("n", guardadas["n"] + 1),
    )
    llamadas = {"n": 0}

    def metricas_falsa():
        llamadas["n"] += 1
        return {"ok": True, "data": {"clientes": {}}}, 200

    monkeypatch.setattr(monitoreo_service.admin_service, "metricas", metricas_falsa)

    payload1, status1 = monitoreo_service.obtener_sli()
    assert status1 == 200
    assert payload1["data"]["cacheado"] is False
    assert payload1["data"]["sonda"]["ok"] is True
    consultas_primera = sesion.consultas

    payload2, status2 = monitoreo_service.obtener_sli()
    assert status2 == 200
    assert payload2["data"]["cacheado"] is True
    assert sesion.consultas == consultas_primera
    assert llamadas["n"] == 1

    payload3, status3 = monitoreo_service.obtener_sli(forzar=True)
    assert status3 == 200
    assert payload3["data"]["cacheado"] is False
    assert llamadas["n"] == 2
    _limpiar()
    monkeypatch.undo()


def test_sli_sonda_caida_devuelve_503(monkeypatch):
    _limpiar()
    _como(monkeypatch, "ADMIN")
    monkeypatch.setattr(monitoreo_service.db, "session", SesionCaida())
    monkeypatch.setattr(monitoreo_service, "historial", lambda: [])
    payload, status = monitoreo_service.obtener_sli(forzar=True)
    assert status == 503
    assert payload["ok"] is False
    _limpiar()


def test_historial_serializa_muestras(monkeypatch):
    class MuestraFalsa:
        minuto = __import__("datetime").datetime(2026, 11, 28, 10, 5)
        ok = True
        duracionMs = 12.5
        base = "db71911"

    class ResultadoHistorial:
        def scalars(self):
            return self

        def all(self):
            return [MuestraFalsa()]

    class SesionHistorial:
        def execute(self, _consulta):
            return ResultadoHistorial()

    monkeypatch.setattr(monitoreo_service.db, "session", SesionHistorial())
    datos = monitoreo_service.historial()
    assert datos[0]["ok"] is True
    assert datos[0]["duracion_ms"] == 12.5
    assert datos[0]["base"] == "db71911"


def test_metricas_cache_evita_segundo_golpe(monkeypatch):
    _limpiar()
    monkeypatch.setattr(admin_service, "current_user", UsuarioFalso("ADMIN"))
    conteos = {"n": 0}

    class SesionConteos:
        def execute(self, _consulta):
            conteos["n"] += 1

            class R:
                def scalar_one(self):
                    return 0

                def scalar_one_or_none(self):
                    return 0

                def scalars(self):
                    return self

                def all(self):
                    return []

            return R()

        def rollback(self):
            pass

    monkeypatch.setattr(admin_service.db, "session", SesionConteos())
    payload1, status1 = admin_service.metricas()
    assert status1 == 200
    primero = conteos["n"]
    assert primero == 3

    payload2, status2 = admin_service.metricas()
    assert status2 == 200
    assert conteos["n"] == primero
    assert payload2 == payload1

    admin_service.metricas(forzar=True)
    assert conteos["n"] == primero + 3
    _limpiar()
