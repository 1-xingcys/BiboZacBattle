from flask_socketio import emit

from __main__ import socketio
from manage.rounds import vote_round, get_rounds, compute_result, check_round, get_status, \
                            player_vote

# 開始開放投票
@socketio.on('request_vote_round')
def handle_start_vote_round(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    res = vote_round(event_id, r_id)
    if res:
        emit('response_vote_round', res, broadcast=False)
        rounds = get_rounds(event_id)
        if rounds is not None:
            round = {}
            for rd in rounds:
                if str(rd['r_id']) == str(r_id):
                    print(f"find round {r_id}", flush=True)
                    round = rd | { 'battling' : True }
                    break    
            emit('inform_event_status', round, to=event_id)
            print(f"emit from start vote to inform : {round}", flush=True)
   
# 結算投票     
@socketio.on('request_compute_vote')
def handle_compute_vote(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    isSuccess, res = compute_result(event_id, r_id)
    emit('response_compute_vote', {'isSuccess' : True, 'result' : res} if isSuccess else {'isSuccess' : False}, broadcast=False)
    rounds = get_rounds(event_id)
    if rounds is not None:
        round = {}
        for rd in rounds:
            if str(rd['r_id']) == str(r_id):
                round = rd | { 'battling' : True }
                break    
        emit('inform_event_status', round, to=event_id)
        print(f"emit from compute vote to inform : {round}", flush=True)
    
@socketio.on('request_check_round_result')
def handle_check_round_result(data):
    event_id = data.get('eventId')
    r_id = data.get('roundId')
    res = check_round(event_id, r_id)
    if res:
        emit('response_check_round_result', res, broadcast=False)
        round = get_status(event_id)
        emit('inform_event_status', round, to=event_id)
        print(f"emit from check round to inform : {round}", flush=True)

@socketio.on('reqest_player_vote')
def handle_player_vote(data):
    event_id = data.get('eventId')
    roundId = data.get('roundId')
    p_name = data.get('username')
    vote_side = data.get('side')
    isSuccess = player_vote(event_id, roundId, p_name, vote_side)
    emit('response_player_vote', isSuccess, broadcast=False)