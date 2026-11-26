import sys
from pathlib import Path

from sqlalchemy.exc import SQLAlchemyError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import admin_service
from app.utils import validacion


class UsuarioFalso:
    def __init__(self, rol_global):
        self.rolGlobal = rol_global


class ResultadoFalso:
    def __init__(self, valor=None, filas=None):
        self.valor = valor
        self.filas = filas or []

    def scalar_one(self):
        return self.valor

    def scalar_one_or_none(self):
        return self.valor

    def scalars(self):
        return self

    def all(self):
        return self.filas


class SesionFalsa:
    def __init__(self, resultados):
        self.resultados = list(resultados)

    def get(self, _modelo, _id):
        return self.resultados.pop(0).valor

    def execute(self, _consulta):
        return self.resultados.pop(0)

    def rollback(self):
        pass

    def commit(self):
        pass


class SesionConError:
    def execute(self, _consulta):
        raise SQLAlchemyError("fallo de BD")

    def rollback(self):
        pass


def _trabajador(id_usuario, nombre, apaterno, correo, rol="TRABAJADOR"):
    trabajador = UsuarioFalso(rol)
    trabajador.idUsuario = id_usuario
    trabajador.nombreUsuario = nombre
    trabajador.apaterno = apaterno
    trabajador.amaterno = None
    trabajador.correo = correo
    trabajador.estado = "ACTIVO"
    return trabajador


def _app():
    return create_app()


def _como(monkeypatch, rol_global):
    monkeypatch.setattr(admin_service, "current_user", UsuarioFalso(rol_global))


def test_rutas_admin_registradas():
    rutas = {
        (regla.rule, metodo)
        for regla in _app().url_map.iter_rules()
        for metodo in regla.methods
    }
    assert ("/admin/metricas", "GET") in rutas
    assert ("/admin/trabajadores", "GET") in rutas
    assert ("/admin/trabajadores", "POST") in rutas
    assert ("/admin/trabajadores/<int:idTrabajador>", "PUT") in rutas
    assert ("/admin/trabajadores/<int:idTrabajador>", "DELETE") in rutas


def test_admin_requiere_token():
    cliente = _app().test_client()
    assert cliente.get("/admin/metricas").status_code == 401
    assert cliente.get("/admin/trabajadores").status_code == 401
    assert cliente.post("/admin/trabajadores", json={}).status_code == 401


def test_solo_admin_consulta_metricas(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.metricas()
    assert status == 403
    assert payload["ok"] is False


def test_solo_staff_lista_trabajadores(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.listar_trabajadores()
    assert status == 403
    assert payload["ok"] is False


def test_serializar_trabajador_expone_datos_minimos():
    trabajador = UsuarioFalso("TRABAJADOR")
    trabajador.idUsuario = 7
    trabajador.nombreUsuario = "Diego"
    trabajador.apaterno = "Borja"
    trabajador.correo = "diego@finanzapp.com"
    trabajador.estado = "ACTIVO"

    datos = admin_service._serializar_trabajador(
        trabajador,
        [{"idTicket": 3, "asunto": "No puedo entrar", "estado": "ABIERTO"}],
    )

    assert datos == {
        "idUsuario": 7,
        "nombreUsuario": "Diego",
        "apaterno": "Borja",
        "amaterno": None,
        "nombre": "Diego Borja",
        "nombreUsuario": "Diego",
        "apaterno": "Borja",
        "amaterno": None,
        "correo": "diego@finanzapp.com",
        "rolGlobal": "TRABAJADOR",
        "estatus": "ACTIVO",
        "tickets": [{"idTicket": 3, "asunto": "No puedo entrar", "estado": "ABIERTO"}],
    }


def test_serializar_trabajador_sin_tickets():
    trabajador = UsuarioFalso("TRABAJADOR")
    trabajador.idUsuario = 8
    trabajador.nombreUsuario = "Ana"
    trabajador.apaterno = "Ruiz"
    trabajador.correo = "ana@finanzapp.com"
    trabajador.estado = "ACTIVO"

    datos = admin_service._serializar_trabajador(trabajador)

    assert datos["tickets"] == []


def test_listar_trabajadores_rechaza_pagina_invalida(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.listar_trabajadores(pagina="x")
    assert status == 400
    assert payload["ok"] is False


def test_listar_trabajadores_rechaza_por_pagina_fuera_de_rango(monkeypatch):
    _como(monkeypatch, "ADMIN")
    payload, status = admin_service.listar_trabajadores(por_pagina="500")
    assert status == 400
    assert payload["ok"] is False


def test_tickets_actuales_sin_trabajadores():
    assert admin_service._tickets_actuales([]) == {}


def test_listar_trabajadores_incluye_tickets_y_paginacion(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajadores = [
        _trabajador(7, "Diego", "Borja", "diego@finanzapp.com"),
        _trabajador(8, "Ana", "Ruiz", "ana@finanzapp.com"),
    ]
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa(
            [
                ResultadoFalso(valor=2),
                ResultadoFalso(filas=trabajadores),
                ResultadoFalso(
                    filas=[
                        (7, 101, "No puedo entrar", "ABIERTO"),
                        (7, 102, "Pago duplicado", "EN_PROCESO"),
                    ]
                ),
            ]
        ),
    )

    payload, status = admin_service.listar_trabajadores(pagina="1", por_pagina="2")

    assert status == 200
    assert payload["ok"] is True
    assert payload["paginacion"] == {
        "pagina": 1,
        "porPagina": 2,
        "total": 2,
        "totalPaginas": 1,
    }
    assert payload["data"]["trabajadores"][0]["tickets"] == [
        {"idTicket": 101, "asunto": "No puedo entrar", "estado": "ABIERTO"},
        {"idTicket": 102, "asunto": "Pago duplicado", "estado": "EN_PROCESO"},
    ]
    assert payload["data"]["trabajadores"][1]["tickets"] == []


def test_listar_trabajadores_vacio(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa([ResultadoFalso(valor=0), ResultadoFalso(filas=[])]),
    )

    payload, status = admin_service.listar_trabajadores()

    assert status == 200
    assert payload["data"]["trabajadores"] == []
    assert payload["paginacion"]["total"] == 0
    assert payload["paginacion"]["totalPaginas"] == 0


def test_listar_trabajadores_error_bd_devuelve_503(monkeypatch):
    _como(monkeypatch, "ADMIN")
    monkeypatch.setattr(admin_service.db, "session", SesionConError())

    payload, status = admin_service.listar_trabajadores()

    assert status == 503
    assert payload["ok"] is False


def test_tickets_actuales_agrupa_por_trabajador(monkeypatch):
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa(
            [
                ResultadoFalso(
                    filas=[
                        (7, 101, "Ticket A", "ABIERTO"),
                        (7, 102, "Ticket B", "EN_PROCESO"),
                        (8, 103, "Ticket C", "ESPERA"),
                    ]
                )
            ]
        ),
    )

    datos = admin_service._tickets_actuales([7, 8])

    assert len(datos[7]) == 2
    assert datos[8] == [{"idTicket": 103, "asunto": "Ticket C", "estado": "ESPERA"}]


def test_solo_admin_crea_trabajadores(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.crear_trabajador(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "a@b.mx"}
    )
    assert status == 403
    assert payload["ok"] is False


def test_cliente_no_consulta_metricas(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.metricas()
    assert status == 403
    assert payload["ok"] is False


def test_trabajador_no_crea_trabajadores(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.crear_trabajador(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "a@b.mx"}
    )
    assert status == 403
    assert payload["ok"] is False


def test_solo_admin_edita_trabajadores(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.editar_trabajador(7, {})
    assert status == 403
    assert payload["ok"] is False


def test_solo_admin_elimina_trabajadores(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.eliminar_trabajador(7)
    assert status == 403
    assert payload["ok"] is False


def test_editar_trabajador_inexistente_devuelve_404(monkeypatch):
    _como(monkeypatch, "ADMIN")
    monkeypatch.setattr(
        admin_service.db, "session", SesionFalsa([ResultadoFalso(valor=None)])
    )

    payload, status = admin_service.editar_trabajador(99, {})

    assert status == 404
    assert payload["ok"] is False


def test_editar_trabajador_rechaza_datos_invalidos(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Diego", "Borja", "diego@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa([ResultadoFalso(valor=trabajador)]),
    )

    payload, status = admin_service.editar_trabajador(
        7, {"nombreUsuario": "Diego", "apaterno": "", "correo": "diego@"}
    )

    assert status == 400
    assert payload["ok"] is False


def test_editar_trabajador_rechaza_correo_repetido(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Diego", "Borja", "diego@finanzapp.com")
    otro = _trabajador(8, "Ana", "Ruiz", "ana@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa([ResultadoFalso(valor=trabajador), ResultadoFalso(valor=otro)]),
    )

    payload, status = admin_service.editar_trabajador(
        7,
        {
            "nombreUsuario": "Diego",
            "apaterno": "Borja",
            "correo": "ana@finanzapp.com",
        },
    )

    assert status == 409
    assert payload["ok"] is False


def test_editar_trabajador_actualiza_campos(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Diego", "Borja", "diego@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa([ResultadoFalso(valor=trabajador), ResultadoFalso(valor=None)]),
    )

    payload, status = admin_service.editar_trabajador(
        7,
        {
            "nombreUsuario": "Diego",
            "apaterno": "Borja",
            "amaterno": "Romero",
            "correo": "nuevo@finanzapp.com",
        },
    )

    assert status == 200
    assert payload["ok"] is True
    assert trabajador.correo == "nuevo@finanzapp.com"
    assert trabajador.amaterno == "Romero"
    assert trabajador.fechaActualizacion is not None


def test_eliminar_trabajador_lo_inactiva_y_libera_tickets(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Diego", "Borja", "diego@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionFalsa(
            [
                ResultadoFalso(valor=trabajador),
                ResultadoFalso(valor=None),
                ResultadoFalso(valor=None),
            ]
        ),
    )

    payload, status = admin_service.eliminar_trabajador(7)

    assert status == 200
    assert payload["ok"] is True
    assert trabajador.estado == "INACTIVO"


def test_resumen_tickets_mapea_estados():
    resumen = admin_service._resumen_tickets(
        {"ABIERTO": 2, "EN_PROCESO": 1, "CERRADO": 3, "ELIMINADO": 9}
    )
    assert resumen == {
        "abiertos": 2,
        "enProceso": 1,
        "enEspera": 0,
        "resueltos": 0,
        "cerrados": 3,
        "total": 6,
    }


def test_contrasenia_temporal_cumple_requisitos():
    assert (
        validacion.requisitos_contrasenia(admin_service._contrasenia_temporal()) == []
    )


def test_datos_usuario_rechaza_campos_faltantes():
    campos, error = validacion.datos_usuario({"nombreUsuario": "Ana"})
    assert campos is None
    assert "Faltan campos" in error


def test_datos_usuario_normaliza_correo_y_apellidos():
    campos, error = validacion.datos_usuario(
        {
            "nombreUsuario": " Ana ",
            "apaterno": " Ruiz ",
            "correo": " ANA@Ejemplo.MX ",
        }
    )
    assert error is None
    assert campos["correo"] == "ana@ejemplo.mx"
    assert campos["amaterno"] is None


def test_datos_usuario_rechaza_correo_invalido():
    campos, error = validacion.datos_usuario(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "ana"}
    )
    assert campos is None
    assert "formato" in error


class SesionTrabajadorFalsa:
    def __init__(self, trabajador, repetido=None):
        self.trabajador = trabajador
        self.repetido = repetido
        self.commits = 0

    def get(self, _modelo, _id):
        return self.trabajador

    def execute(self, _consulta):
        return ResultadoFalso(valor=self.repetido)

    def commit(self):
        self.commits += 1

    def rollback(self):
        pass


def _datos_trabajador(correo="ana@finanzapp.com"):
    return {
        "nombreUsuario": "Ana",
        "apaterno": "Ruiz",
        "amaterno": "",
        "correo": correo,
    }


def test_solo_admin_edita_trabajadores(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.editar_trabajador(7, _datos_trabajador())
    assert status == 403
    assert payload["ok"] is False


def test_solo_admin_elimina_trabajadores(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.eliminar_trabajador(7)
    assert status == 403
    assert payload["ok"] is False


def test_editar_trabajador_actualiza_datos(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Ana", "Ruiz", "vieja@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db, "session", SesionTrabajadorFalsa(trabajador)
    )

    payload, status = admin_service.editar_trabajador(7, _datos_trabajador())

    assert status == 200
    assert payload["ok"] is True
    assert trabajador.nombreUsuario == "Ana"
    assert trabajador.correo == "ana@finanzapp.com"


def test_editar_trabajador_rechaza_correo_duplicado(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Ana", "Ruiz", "vieja@finanzapp.com")
    monkeypatch.setattr(
        admin_service.db,
        "session",
        SesionTrabajadorFalsa(trabajador, repetido=99),
    )

    payload, status = admin_service.editar_trabajador(7, _datos_trabajador())

    assert status == 409
    assert payload["ok"] is False


def test_eliminar_trabajador_lo_marca_inactivo(monkeypatch):
    _como(monkeypatch, "ADMIN")
    trabajador = _trabajador(7, "Ana", "Ruiz", "ana@finanzapp.com")
    sesion = SesionTrabajadorFalsa(trabajador)
    monkeypatch.setattr(admin_service.db, "session", sesion)

    payload, status = admin_service.eliminar_trabajador(7)

    assert status == 200
    assert payload["data"]["estatus"] == "INACTIVO"
    assert trabajador.estado == "INACTIVO"
    assert sesion.commits == 1
