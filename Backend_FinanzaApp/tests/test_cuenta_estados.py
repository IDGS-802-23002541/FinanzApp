import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from werkzeug.security import generate_password_hash

from app.services import auth_service, email_service


class ResultadoFalso:
    def __init__(self, valor=None, filas=None):
        self.valor = valor
        self.filas = filas or []

    def scalar_one_or_none(self):
        return self.valor

    def scalar_one(self):
        return self.valor

    def scalars(self):
        return self

    def first(self):
        return self.valor

    def all(self):
        return self.filas


class SesionFalsa:
    def __init__(self, resultados=None):
        self.resultados = list(resultados or [])
        self.agregados = []
        self.eliminados = []
        self.committed = False

    def execute(self, _sentencia):
        if self.resultados:
            return self.resultados.pop(0)
        return ResultadoFalso()

    def add(self, objeto):
        self.agregados.append(objeto)

    def delete(self, objeto):
        self.eliminados.append(objeto)

    def commit(self):
        self.committed = True

    def rollback(self):
        pass

    def remove(self):
        pass


class UsuarioFalso:
    def __init__(self, estado="ACTIVO", id_usuario=3, correo="ana@ejemplo.com"):
        self.idUsuario = id_usuario
        self.estado = estado
        self.correo = correo
        self.nombreUsuario = "Ana"
        self.apaterno = "Pérez"
        self.amaterno = "López"
        self.rolGlobal = "CLIENTE"
        self.contrasenia = generate_password_hash("NuevaClave1")
        self.debeCambiarContrasenia = False
        self.fechaActualizacion = None


def _app():
    app = create_app()
    app.config.update(EMAIL_CONNECTION_STRING=None, EMAIL_REMITENTE=None)
    return app


def _con_db(monkeypatch, resultados):
    sesion = SesionFalsa(resultados)
    monkeypatch.setattr(auth_service.db, "session", sesion)
    return sesion


def _con_correo(monkeypatch):
    enviados = []

    def enviar(destinatario, asunto, texto, html=None):
        enviados.append((destinatario, asunto, texto))
        return True

    monkeypatch.setattr(email_service, "enviar", enviar)
    return enviados


DATOS_REGISTRO = {
    "nombreUsuario": "Ana",
    "apaterno": "Pérez",
    "amaterno": "López",
    "correo": "ana@ejemplo.com",
    "contrasenia": "NuevaClave1",
}


def test_registro_con_cuenta_desactivada_Avisa_que_esta_inactiva(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="INACTIVO"))])
    with _app().app_context():
        payload, status = auth_service.registrar(dict(DATOS_REGISTRO))
    assert status == 409
    assert "desactivada" in payload["mensaje"].lower()


def test_registro_con_cuenta_ya_registrada(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ACTIVO"))])
    with _app().app_context():
        payload, status = auth_service.registrar(dict(DATOS_REGISTRO))
    assert status == 409
    assert "ya está registrado" in payload["mensaje"]


def test_registro_con_cuenta_eliminada_no_se_puede_reactivar(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ELIMINADO"))])
    with _app().app_context():
        payload, status = auth_service.registrar(dict(DATOS_REGISTRO))
    assert status == 409
    assert "eliminada" in payload["mensaje"].lower()


def test_recuperacion_envia_el_codigo_por_correo(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ACTIVO"))])
    enviados = _con_correo(monkeypatch)
    with _app().app_context():
        payload, status = auth_service.solicitar_recuperacion("ana@ejemplo.com")
    assert status == 200
    assert payload["ok"] is True
    assert len(enviados) == 1
    assert "código de recuperación" in enviados[0][2]


def test_recuperacion_envia_codigo_que_tambien_reactiva(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="INACTIVO"))])
    enviados = _con_correo(monkeypatch)
    with _app().app_context():
        payload, status = auth_service.solicitar_recuperacion("ana@ejemplo.com")
    assert status == 200
    assert payload["ok"] is True
    assert len(enviados) == 1
    assert "reactivada" in enviados[0][2]


def test_solicitar_reactivacion_envia_codigo(monkeypatch):
    sesion = _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="INACTIVO"))])
    enviados = _con_correo(monkeypatch)
    with _app().app_context():
        payload, status = auth_service.solicitar_reactivacion("ana@ejemplo.com")
    assert status == 200
    assert payload["ok"] is True
    assert len(enviados) == 1
    assert sesion.agregados
    assert sesion.committed is True


def test_solicitar_reactivacion_es_neutra_para_cuenta_activa(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ACTIVO"))])
    enviados = _con_correo(monkeypatch)
    with _app().app_context():
        payload, status = auth_service.solicitar_reactivacion("ana@ejemplo.com")
    assert status == 200
    assert payload["ok"] is True
    assert enviados == []


def test_confirmar_reactivacion_activa_la_cuenta(monkeypatch):
    usuario = UsuarioFalso(estado="INACTIVO")
    token = type("Token", (), {"fechaUso": None})()
    _con_db(
        monkeypatch,
        [ResultadoFalso(usuario), ResultadoFalso(token), ResultadoFalso(filas=[])],
    )
    with _app().app_context():
        payload, status = auth_service.confirmar_reactivacion(
            "ana@ejemplo.com", "123456"
        )
    assert status == 200
    assert payload["ok"] is True
    assert usuario.estado == "ACTIVO"


def test_confirmar_reactivacion_con_codigo_invalido(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="INACTIVO"))])
    with _app().app_context():
        payload, status = auth_service.confirmar_reactivacion(
            "ana@ejemplo.com", "000000"
        )
    assert status == 400
    assert payload["ok"] is False


def test_eliminar_cuenta_anonimiza_y_cambia_estado(monkeypatch):
    usuario = UsuarioFalso(estado="ACTIVO")
    monkeypatch.setattr(auth_service, "current_user", usuario)
    sesion = _con_db(monkeypatch, [])
    with _app().app_context():
        payload, status = auth_service.eliminar("NuevaClave1")
    assert status == 200
    assert usuario.estado == "ELIMINADO"
    assert usuario.correo.startswith("elim+")
    assert sesion.committed is True


def test_eliminar_cuenta_exige_contrasena(monkeypatch):
    monkeypatch.setattr(auth_service, "current_user", UsuarioFalso())
    _con_db(monkeypatch, [])
    with _app().app_context():
        payload, status = auth_service.eliminar("")
    assert status == 400
    assert payload["ok"] is False


def test_restablecer_con_cuenta_desactivada_reactiva_y_cambia_clave(monkeypatch):
    usuario = UsuarioFalso(estado="INACTIVO")
    token = type("Token", (), {"fechaUso": None})()
    _con_db(
        monkeypatch,
        [ResultadoFalso(usuario), ResultadoFalso(token), ResultadoFalso(filas=[])],
    )
    with _app().app_context():
        payload, status = auth_service.restablecer(
            "ana@ejemplo.com", "123456", "NuevaClave1"
        )
    assert status == 200
    assert usuario.estado == "ACTIVO"
    assert "reactivada" in payload["mensaje"].lower()


def test_restablecer_con_cuenta_eliminada_no_procede(monkeypatch):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ELIMINADO"))])
    with _app().app_context():
        payload, status = auth_service.restablecer(
            "ana@ejemplo.com", "123456", "NuevaClave1"
        )
    assert status == 400
    assert payload["ok"] is False


def test_recuperacion_en_debug_expone_y_registra_codigo(monkeypatch, caplog):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ACTIVO"))])
    _con_correo(monkeypatch)
    app = _app()
    app.debug = True

    with app.app_context(), caplog.at_level("INFO"):
        payload, status = auth_service.solicitar_recuperacion("ana@ejemplo.com")

    codigo = payload["data"]["codigo"]
    assert status == 200
    assert codigo is not None
    assert codigo in caplog.text


def test_recuperacion_sin_debug_no_expone_codigo(monkeypatch, caplog):
    _con_db(monkeypatch, [ResultadoFalso(UsuarioFalso(estado="ACTIVO"))])
    _con_correo(monkeypatch)
    app = _app()
    app.debug = False

    with app.app_context(), caplog.at_level("INFO"):
        payload, status = auth_service.solicitar_recuperacion("ana@ejemplo.com")

    assert status == 200
    assert payload["data"] is None
    assert "Código de recuperación" not in caplog.text
