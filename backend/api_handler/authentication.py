from flask import Flask, request, jsonify, Blueprint
from database.player import authentication, set_online_status
from database.rounds import get_players

from flask_socketio import emit

authentication_bp = Blueprint('authentication', __name__)
from __main__ import socketio


@authentication_bp.route('/player/login', methods=['POST'])
def player_login():
    data = request.json
    e_id = data.get('e_id')
    veri_code = data.get('veri_code')
    name = authentication(veri_code, e_id)
    if name:
        set_online_status(True, name, e_id)
        players = get_players(e_id)
        socketio.emit('response_players', players, to=e_id)
        return jsonify({'name': name}), 200
    return jsonify({'error': 'invalid verification code'}), 403
  
@authentication_bp.route('/player/logout', methods=['POST'])
def player_logout():
    data = request.json
    e_id = data.get('e_id')
    name = data.get('name')
    if set_online_status(False, name, e_id):
        players = get_players(e_id)
        socketio.emit('response_players', players, to=e_id)
        return jsonify({'result' : 'success'}), 200
    return jsonify({'error': 'logout FAIL'}), 403
    