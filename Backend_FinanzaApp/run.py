from app import create_app

app = create_app()

@app.route('/')
def inicio():
    return {
        "mensaje": "API de FinanzApp funcionando correctamente"
    }, 200


if __name__ == "__main__":
    app.run(debug=True)
