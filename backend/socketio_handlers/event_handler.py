from flask_socketio import emit

from database.rounds import get_rounds, get_players
from database.player import delete_player

from __main__ import socketio

@socketio.on('request_rounds')
def handle_get_rounds(data):
    event_id = data.get('eventId')
    rounds = get_rounds(event_id)
    if rounds is not None:
        emit('response_round', rounds, broadcast=False)
        
@socketio.on('request_players')
def handle_get_players(data):
    event_id = data.get('eventId')
    players = get_players(event_id)
    if players is not None:
        emit('response_players', players, broadcast=False)

@socketio.on('delete_player_info')
def delete_player_info(data):
    e_id = data.get('eventId')
    player_name = data.get('playerName')

    success = delete_player(e_id, player_name)
    if success:
        emit('response_delete_player', {'success': True})
    else:
        emit('response_delete_player', {'success': False, 'message': 'Failed to delete player'})