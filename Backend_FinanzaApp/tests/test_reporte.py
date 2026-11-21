import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import reporte_service


def _cliente():
    return create_app().test_client()


def test_ruta_registrada():
    rutas = {regla.rule for regla in create_app().url_map.iter_rules()}
    assert "/reportes" in rutas
    assert "/reportes/exportar" in rutas


def test_exportar_sin_token():
    respuesta = _cliente().get("/reportes/exportar")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_exportar_formato_no_soportado():
    payload, status = reporte_service.exportar(formato="XLSX")
    assert status == 400
    assert payload["ok"] is False


def test_pdf_basico_valido():
    pdf = reporte_service._pdf_bytes(["Reporte", "Linea de prueba"])
    assert pdf.startswith(b"%PDF-1.4")
    assert pdf.rstrip().endswith(b"%%EOF")


def test_vista_previa_sin_token():
    respuesta = _cliente().get("/reportes")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_tipo_invalido():
    payload, status = reporte_service.vista_previa(tipo="CASA")
    assert status == 400
    assert payload["ok"] is False


def test_cantidad_no_numerica():
    _, status = reporte_service.vista_previa(cantidad="muchos")
    assert status == 400


def test_cantidad_fuera_de_rango():
    assert reporte_service.vista_previa(cantidad="0")[1] == 400
    assert reporte_service.vista_previa(cantidad="51")[1] == 400


def test_cartera_no_numerica():
    assert reporte_service.vista_previa(cartera_id="abc")[1] == 400


def test_periodo_no_numerico():
    _, status = reporte_service.vista_previa(cartera_id="1", periodo_id="abc")
    assert status == 400


def test_periodo_sin_cartera():
    payload, status = reporte_service.vista_previa(periodo_id="3")
    assert status == 400
    assert "cartera" in payload["mensaje"].lower()


def test_fecha_mal_formada():
    assert reporte_service.vista_previa(fecha_inicio="2026-13-01")[1] == 400
    assert reporte_service.vista_previa(fecha_fin="01/12/2026")[1] == 400


def test_rango_de_fechas_invertido():
    payload, status = reporte_service.vista_previa(
        fecha_inicio="2026-12-01", fecha_fin="2026-11-01"
    )
    assert status == 400
    assert "anterior" in payload["mensaje"].lower()
