import sys
from datetime import date
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import transaccion_service


def test_ruta_transacciones_registrada():
    app = create_app()
    rutas = {regla.rule for regla in app.url_map.iter_rules()}
    assert "/carteras/<int:idCartera>/transacciones" in rutas


def test_crear_transaccion_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.post("/carteras/1/transacciones", json={"monto": 10})
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_listar_transacciones_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.get("/carteras/1/transacciones?pagina=1")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_ruta_edicion_transaccion_registrada():
    app = create_app()
    rutas = {regla.rule for regla in app.url_map.iter_rules()}
    assert "/transacciones/<int:idTransaccion>" in rutas


def test_editar_y_eliminar_requieren_token():
    app = create_app()
    cliente = app.test_client()
    editar = cliente.put("/transacciones/1", json={"monto": 10})
    eliminar = cliente.delete("/transacciones/1")
    assert editar.status_code == 401
    assert eliminar.status_code == 401
    assert editar.is_json
    assert eliminar.is_json


def test_entero_parametro():
    assert transaccion_service._entero_parametro("pagina", "2", 1) == (2, None)
    assert transaccion_service._entero_parametro("pagina", "0", 1)[1] is not None
    assert transaccion_service._entero_parametro("pagina", "abc", 1)[1] is not None
    assert transaccion_service._entero_parametro("porPagina", "101", 1, 100)[1] is not None
    assert transaccion_service._entero_parametro("porPagina", "100", 1, 100) == (
        100,
        None,
    )


def test_monto_debe_ser_mayor_a_cero():
    assert transaccion_service._validar_monto(0)[1] is not None
    assert transaccion_service._validar_monto(-5)[1] is not None
    assert transaccion_service._validar_monto("10")[1] is not None
    assert transaccion_service._validar_monto(True)[1] is not None


def test_monto_valido_se_redondea():
    monto, error = transaccion_service._validar_monto(10.5)
    assert error is None
    assert monto == Decimal("10.50")


def test_fecha_por_defecto_y_formato_iso():
    assert transaccion_service._validar_fecha(None) == (date.today(), None)
    assert transaccion_service._validar_fecha("2026-11-03") == (
        date(2026, 11, 3),
        None,
    )
    assert transaccion_service._validar_fecha("03/11/2026")[1] is not None
