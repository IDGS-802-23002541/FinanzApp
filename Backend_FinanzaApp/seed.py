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
    {"nombre": "Aportación", "tipo": "INGRESO"},
    {"nombre": "Alimentos", "tipo": "GASTO"},
    {"nombre": "Transporte", "tipo": "GASTO"},
    {"nombre": "Servicios", "tipo": "GASTO"},
    {"nombre": "Vivienda", "tipo": "GASTO"},
    {"nombre": "Salud", "tipo": "GASTO"},
    {"nombre": "Educación", "tipo": "GASTO"},
    {"nombre": "Ocio", "tipo": "GASTO"},
    {"nombre": "Compras", "tipo": "GASTO"},
    {"nombre": "Otros", "tipo": "AMBOS"},
]


def cargar_categorias():
    creadas = 0
    for datos in CATEGORIAS_INICIALES:
        existe = db.session.execute(
            db.select(Categoria).where(
                Categoria.carteraId.is_(None),
                Categoria.nombre == datos["nombre"],
            )
        ).scalar_one_or_none()
        if existe:
            continue

        db.session.add(
            Categoria(
                carteraId=None,
                nombre=datos["nombre"],
                tipo=datos["tipo"],
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
