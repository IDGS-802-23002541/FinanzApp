"""Rellena los periodos mensuales de las carteras que ya existen.

Uso (desde Backend_FinanzaApp):
    python scripts/rellenar_periodos.py

Es idempotente: solo agrega los meses que falten.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.extensions import db
from app.models import Cartera, Periodo
from app.services import cartera_service


def main():
    app = create_app()
    with app.app_context():
        carteras = db.session.execute(db.select(Cartera)).scalars().all()
        total = 0

        for cartera in carteras:
            total += cartera_service.generar_periodos(cartera)

        db.session.commit()
        periodos = db.session.execute(
            db.select(db.func.count()).select_from(Periodo)
        ).scalar_one()

        print(f"Carteras revisadas: {len(carteras)}")
        print(f"Periodos nuevos: {total}")
        print(f"Periodos totales: {periodos}")


if __name__ == "__main__":
    main()
