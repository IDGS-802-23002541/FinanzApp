import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest

from app import create_app
from app.routes.pagos import pagos_bp
from app.services import pago_service


class MiembroFalso:
    def __init__(self, rol="ADMIN"):
        self.rol = rol
        self.idUsuario = 7


class PagoFalso:
    def __init__(self):
        self.idPagoRecurrente = 4
        self.carteraId = 1
        self.categoriaId = None
        self.nombre = "Renta"
        self.descripcion = None
        self.monto = 4500
        self.frecuencia = "MENSUAL"
        self.fechaInicio = date(2026, 12, 1)
        self.fechaFin = None
        self.proximaEjecucion = date(2026, 11, 1)
        self.estado = "ACTIVO"


class PagoFuturoFalso(PagoFalso):
    def __init__(self):
        super().__init__()
        self.proximaEjecucion = date(2099, 1, 1)


class FilaFalsa:
    def __init__(self, resultado):
        self._resultado = resultado

    def first(self):
        return self._resultado


def _app():
    app = create_app()
    if "pagos" not in app.blueprints:
        app.register_blueprint(pagos_bp)
    return app


def _pago_valido():
    return {
        "nombre": "Renta",
        "monto": 4500,
        "frecuencia": "MENSUAL",
        "fechaInicio": "2026-12-01",
    }


def test_rutas_pagos_registradas():
    app = _app()
    rutas = {
        (regla.rule, metodo)
        for regla in app.url_map.iter_rules()
        for metodo in regla.methods
    }
    assert ("/pagos-recurrentes", "POST") in rutas
    assert ("/pagos-recurrentes", "GET") in rutas
    assert ("/pagos-recurrentes/<int:idPago>", "PUT") in rutas
    assert ("/pagos-recurrentes/<int:idPago>", "DELETE") in rutas
    assert ("/pagos-recurrentes/<int:idPago>/hecho", "POST") in rutas


def test_pagos_requieren_token():
    app = _app()
    cliente = app.test_client()
    assert cliente.post("/pagos-recurrentes").status_code == 401
    assert cliente.get("/pagos-recurrentes").status_code == 401
    assert cliente.put("/pagos-recurrentes/1").status_code == 401
    assert cliente.delete("/pagos-recurrentes/1").status_code == 401
    assert cliente.post("/pagos-recurrentes/1/hecho").status_code == 401


def test_validar_rechaza_nombre_vacio():
    datos = _pago_valido()
    datos["nombre"] = "   "
    cambios, error = pago_service._validar(datos)
    assert cambios is None
    assert error


def test_validar_rechaza_monto_no_positivo():
    datos = _pago_valido()
    datos["monto"] = 0
    cambios, error = pago_service._validar(datos)
    assert cambios is None
    assert error


def test_validar_rechaza_frecuencia_invalida():
    datos = _pago_valido()
    datos["frecuencia"] = "BIMESTRAL"
    cambios, error = pago_service._validar(datos)
    assert cambios is None
    assert error


def test_validar_rechaza_fecha_fin_anterior():
    datos = _pago_valido()
    datos["fechaFin"] = "2026-11-01"
    cambios, error = pago_service._validar(datos)
    assert cambios is None
    assert error


def test_validar_rechaza_fecha_con_formato_incorrecto():
    datos = _pago_valido()
    datos["fechaInicio"] = "01-12-2026"
    cambios, error = pago_service._validar(datos)
    assert cambios is None
    assert error


@pytest.mark.parametrize(
    ("frecuencia", "esperada"),
    [
        ("DIARIO", date(2026, 12, 2)),
        ("SEMANAL", date(2026, 12, 8)),
        ("QUINCENAL", date(2026, 12, 16)),
        ("MENSUAL", date(2027, 1, 1)),
        ("ANUAL", date(2027, 12, 1)),
    ],
)
def test_calcular_proxima_ejecucion_por_frecuencia(frecuencia, esperada):
    assert (
        pago_service.calcular_proxima_ejecucion(date(2026, 12, 1), frecuencia)
        == esperada
    )


def test_calcular_proxima_ejecucion_usa_ultimo_dia_del_mes():
    assert pago_service.calcular_proxima_ejecucion(
        date(2026, 1, 31), "MENSUAL"
    ) == date(2026, 2, 28)


def test_calcular_proxima_ejecucion_rechaza_frecuencia_desconocida():
    with pytest.raises(ValueError):
        pago_service.calcular_proxima_ejecucion(date(2026, 12, 1), "BIMESTRAL")


def test_colaborador_puede_editar(monkeypatch):
    monkeypatch.setattr(
        pago_service,
        "_pago_y_membresia",
        lambda id_pago: (PagoFalso(), MiembroFalso(rol="COLABORADOR"), None),
    )
    # Con un cuerpo vacío el permiso se pasa y falla la validacion, no el rol.
    payload, status = pago_service.editar(4, {})
    assert status == 400
    assert payload["ok"] is False


def test_propietario_puede_editar(monkeypatch):
    monkeypatch.setattr(
        pago_service,
        "_pago_y_membresia",
        lambda id_pago: (PagoFalso(), MiembroFalso(rol="ADMIN"), None),
    )
    # Con un cuerpo vacío el permiso se pasa y falla la validacion, no el rol.
    payload, status = pago_service.editar(4, {})
    assert status == 400
    assert payload["ok"] is False


def test_no_se_puede_marcar_dos_veces_el_mismo_periodo(monkeypatch):
    monkeypatch.setattr(
        pago_service,
        "_pago_y_membresia",
        lambda id_pago: (PagoFalso(), MiembroFalso(rol="ADMIN"), None),
    )
    monkeypatch.setattr(
        pago_service.db.session,
        "execute",
        lambda *args, **kwargs: FilaFalsa((1,)),
    )
    payload, status = pago_service.marcar_hecho(4, {})
    assert status == 409
    assert payload["ok"] is False


def test_colaborador_tambien_puede_marcar_hecho(monkeypatch):
    """El RBAC permite marcar como hecho a cualquier miembro de la cartera."""
    monkeypatch.setattr(
        pago_service,
        "_pago_y_membresia",
        lambda id_pago: (PagoFalso(), MiembroFalso(rol="COLABORADOR"), None),
    )
    # Llega a la validación de duplicado (409), no a un 403 por rol.
    monkeypatch.setattr(
        pago_service.db.session,
        "execute",
        lambda *args, **kwargs: FilaFalsa((1,)),
    )
    payload, status = pago_service.marcar_hecho(4, {})
    assert status == 409
    assert payload["ok"] is False


def test_no_se_puede_marcar_un_pago_que_aun_no_vence(monkeypatch):
    monkeypatch.setattr(
        pago_service,
        "_pago_y_membresia",
        lambda id_pago: (PagoFuturoFalso(), MiembroFalso(rol="COLABORADOR"), None),
    )
    payload, status = pago_service.marcar_hecho(4, {})
    assert status == 409
    assert "no vence" in payload["mensaje"]

