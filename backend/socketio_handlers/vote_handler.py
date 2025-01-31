from flask_socketio import emit

from __main__ import socketio
from database.rounds import vote_round, compute_result, check_round, get_status, \
                            player_vote, vote_status, is_player_voted
from socketio_handlers.utils import inform_event_status
    
# 與管理員同步進行中活動的狀態                    
@socketio.on('request_event_status')
def handle_event_status(data):
    e_id = data['eventId']
    res = get_status(e_id)
    emit('inform_event_status', res, broadcast=False)
    print(f"[ROUND SOCKETIO HANDLER] emit from request status to inform : {res}", flush=True)

# 開始開放投票
@socketio.on('request_vote_round')
def handle_start_vote_round(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    res = vote_round(event_id, r_id)
    if res:
        emit('response_vote_round', res, broadcast=False)
        inform_event_status(event_id, r_id, True)
        print(f"[ROUND SOCKETIO HANDLER] emit from start vote to inform : {round}", flush=True)
   
# 結算投票     
@socketio.on('request_compute_vote')
def handle_compute_vote(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    isSuccess, res = compute_result(event_id, r_id)
    emit('response_compute_vote', {'isSuccess' : True, 'result' : res} if isSuccess else {'isSuccess' : False}, broadcast=False)
    inform_event_status(event_id, r_id, True)
    print(f"[ROUND SOCKETIO HANDLER] emit from compute vote to inform : {round}", flush=True)
    
@socketio.on('request_check_round_result')
def handle_check_round_result(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    res = check_round(event_id, r_id)
    if res:
        emit('response_check_round_result', res, broadcast=False)
        round = get_status(event_id)
        emit('inform_event_status', round, to=event_id)
        print(f"[ROUND SOCKETIO HANDLER] emit from check round to inform : {round}", flush=True)

@socketio.on('reqest_player_vote')
def handle_player_vote(data):
    event_id = data.get('eventId')
    roundId = data.get('roundId')
    p_name = data.get('username')
    vote_side = data.get('side')
    isSuccess = player_vote(event_id, roundId, p_name, vote_side)
    emit('response_player_vote', isSuccess, broadcast=False)
    
    votes = vote_status(event_id, roundId)
    emit('response_vote_status', votes, to=event_id)
    
@socketio.on('request_vote_status')
def handle_vote_status(data):
    event_id = data.get('eventId')
    roundId = data.get('roundId')
    res = vote_status(event_id, roundId)
    emit('response_vote_status', res, broadcast=False)
    
@socketio.on('request_is_player_voted')
def handle_vote_status(data):
    event_id = data.get('eventId')
    roundId = data.get('roundId')
    p_name = data.get('p_name')
    res = is_player_voted(event_id, roundId, p_name)
    emit('response_is_player_voted', res, broadcast=False)
    
    
