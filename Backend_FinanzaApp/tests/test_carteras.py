import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import cartera_service


class CarteraFalsa:
    fechaInicio = date(2026, 1, 1)
    fechaFin = date(2026, 1, 31)


def test_rutas_edicion_e_inactivacion_registradas():
    app = create_app()
    rutas = {(regla.rule, metodo) for regla in app.url_map.iter_rules() for metodo in regla.methods}
    assert ("/carteras/<int:idCartera>", "PUT") in rutas
    assert ("/carteras/<int:idCartera>/inactivar", "POST") in rutas
    assert ("/carteras/<int:idCartera>/reactivar", "POST") in rutas


def test_editar_e_inactivar_requieren_token():
    app = create_app()
    cliente = app.test_client()
    editar = cliente.put("/carteras/1", json={"nombre": "Nueva"})
    inactivar = cliente.post("/carteras/1/inactivar")
    reactivar = cliente.post("/carteras/1/reactivar")
    assert editar.status_code == 401
    assert inactivar.status_code == 401
    assert reactivar.status_code == 401
    assert editar.is_json


def test_validar_edicion_sin_campos_falla():
    cambios, error = cartera_service._validar_edicion({}, CarteraFalsa())
    assert cambios is None
    assert error[0]["ok"] is False


def test_validar_edicion_nombre_vacio_falla():
    cambios, error = cartera_service._validar_edicion(
        {"nombre": "   "}, CarteraFalsa()
    )
    assert cambios is None
    assert error[1] == 400


def test_validar_edicion_tipo_invalido_falla():
    cambios, error = cartera_service._validar_edicion(
        {"tipo": "INVALIDO"}, CarteraFalsa()
    )
    assert cambios is None
    assert error[1] == 400


def test_validar_edicion_presupuesto_negativo_falla():
    cambios, error = cartera_service._validar_edicion(
        {"presupuestoInicial": -1}, CarteraFalsa()
    )
    assert cambios is None
    assert error[1] == 400


def test_validar_edicion_fechas_invertidas_falla():
    cambios, error = cartera_service._validar_edicion(
        {"fechaFin": "2025-12-31"}, CarteraFalsa()
    )
    assert cambios is None
    assert error[1] == 400


def test_validar_edicion_mapea_tipo_y_conserva_fechas():
    cambios, error = cartera_service._validar_edicion(
        {"nombre": " Casa ", "tipo": "OTRO", "fechaInicio": "2026-01-05"},
        CarteraFalsa(),
    )
    assert error is None
    assert cambios["nombre"] == "Casa"
    assert cambios["tipo"] == "OTRA"
    assert cambios["fechaInicio"] == date(2026, 1, 5)
