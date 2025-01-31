from flask_socketio import emit

from __main__ import socketio

from database.rounds import get_rounds, create_single_round, start_round, stop_round
from socketio_handlers.utils import inform_event_status

@socketio.on('request_create1on1')
def handle_create_1on1(data):
    info1on1 = data.get('info1on1')
    event_id = data.get('eventId')
    
    red_name = info1on1.get('red_name')
    blue_name = info1on1.get('blue_name')
    match_type = info1on1.get('type')
    
    res = create_single_round(event_id, red_name, blue_name, match_type)
    emit('response_create1on1', res, broadcast=False)
    if res :
        rounds = get_rounds(event_id)
        if rounds is not None:
            emit('response_round', rounds, broadcast=False)
              
@socketio.on('request_start_round')
def handle_start_round(data):
    event_id = data.get('eventId')
    r_id = data.get('r_id')
    res = start_round(event_id, r_id)
    if res:
        emit('response_start_round', res, broadcast=False)
        inform_event_status(event_id, r_id, True)
        print(f"[ROUND SOCKETIO HANDLER] emit from start round to inform : {round}", flush=True)

@socketio.on('request_stop_round')
def handle_stop_round(data):
    event_id = data.get('eventId')
    r_id = data.get('r_id')
    res = stop_round(event_id, r_id)
    if res:
        emit('response_stop_round', res, broadcast=False)
        inform_event_status(event_id, r_id, False)
        print(f"[ROUND SOCKETIO HANDLER] emit from stop round to inform : {round}", flush=True)