#Para qué sirve: Es un script que sirve para poblar la base de datos con los datos mínimos esenciales 
# o iniciales que tu aplicación necesita para funcionar desde el día uno.   
# Qué hace en tu proyecto: Se encarga de insertar las categorías base del sistema 
# (como Alimentos, Transporte, Servicios, etc.).  
#  Por qué es útil: Es un script idempotente; si lo ejecutas una vez, crea los registros, 
# y si lo vuelves a ejecutar, detecta que ya existen y no los duplica ni causa errores 
# de clave única. Así evitas tener que registrar las categorías manualmente desde SQL

from app import create_app
from app.extensions import db
from app.models import Categoria

CATEGORIAS_INICIALES = [
    {"nombre": "Aportación", "tipo": "INGRESO", "tipoCartera": None, "orden": 0},
    {"nombre": "Alimentos", "tipo": "GASTO", "tipoCartera": None, "orden": 1},
    {"nombre": "Transporte", "tipo": "GASTO", "tipoCartera": None, "orden": 2},
    {"nombre": "Servicios", "tipo": "GASTO", "tipoCartera": None, "orden": 3},
    {"nombre": "Vivienda", "tipo": "GASTO", "tipoCartera": None, "orden": 4},
    {"nombre": "Salud", "tipo": "GASTO", "tipoCartera": None, "orden": 5},
    {"nombre": "Educación", "tipo": "GASTO", "tipoCartera": None, "orden": 6},
    {"nombre": "Ocio", "tipo": "GASTO", "tipoCartera": None, "orden": 7},
    {"nombre": "Compras", "tipo": "GASTO", "tipoCartera": None, "orden": 8},
    {"nombre": "Otros", "tipo": "AMBOS", "tipoCartera": None, "orden": 9},
]


def cargar_categorias():
    creadas = 0
    for datos in CATEGORIAS_INICIALES:
        existe = db.session.execute(
            db.select(Categoria).where(
                Categoria.carteraId.is_(None),
                Categoria.nombre == datos["nombre"],
                Categoria.tipoCartera.is_(None),
            )
        ).scalar_one_or_none()
        if existe:
            continue

        db.session.add(
            Categoria(
                carteraId=None,
                nombre=datos["nombre"],
                tipo=datos["tipo"],
                tipoCartera=None,
                orden=datos["orden"],
                estado="ACTIVA",
            )
        )
        creadas += 1

    db.session.commit()
    return creadas


def main():
    app = create_app()
    with app.app_context():
        creadas = cargar_categorias()
        print(f"Categorías nuevas: {creadas}.")


if __name__ == "__main__":
    main()
