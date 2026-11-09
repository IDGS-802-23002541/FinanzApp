from flask import jsonify


def ok(data, mensaje, status=200):
    return jsonify({"ok": True, "data": data, "mensaje": mensaje}), status


def error(mensaje, status=400):
    return jsonify({"ok": False, "mensaje": mensaje}), status
