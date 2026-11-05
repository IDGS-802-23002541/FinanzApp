import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import categoria_service


def test_ruta_categorias_registrada():
    app = create_app()
    rutas = {regla.rule for regla in app.url_map.iter_rules()}
    assert "/carteras/<int:idCartera>/categorias" in rutas


def test_crear_categoria_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.post("/carteras/1/categorias", json={"nombre": "Ocio"})
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_listar_categorias_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.get("/carteras/1/categorias?tipo=GASTO")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_nombre_valido_normaliza_espacios():
    assert categoria_service._validar_nombre("  Servicio   de internet ") == (
        "Servicio de internet",
        None,
    )


def test_nombre_invalido():
    assert categoria_service._validar_nombre("Ocio!")[1] is not None
    assert categoria_service._validar_nombre("Casa <script>")[1] is not None
    assert categoria_service._validar_nombre("   ")[1] is not None
    assert categoria_service._validar_nombre("x" * 81)[1] is not None
    assert categoria_service._validar_nombre(None)[1] is not None
