from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import uuid

FRONTEND_URL = "http://localhost:5173"

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")


# 初始化投票數據
battles = {}

@socketio.on('vote')
def handle_vote(data):
    option = data.get('option')
    event_id = data.get('event_id')
    if battles[event_id] :
        votes = battles[event_id]['votes']
        votes[option] += 1
        print(f"[Votes] {option}")
        emit('voteUpdate', votes, broadcast=True)
        
@socketio.on('enter')
def handle_enter(data):
    event_id = data.get('event_id')
    if battles[event_id] :
        votes = battles[event_id]['votes']
        print("[Client Enter] sending votes:", votes)
        emit('voteUpdate', votes, broadcast=False)
        
@socketio.on('end')
def handle_end(data):
    event_id = data.get('event_id')
    if battles[event_id] :
        red_side, blue_side = battles[event_id]['red_side'], battles[event_id]['blue_side']
        votes = battles[event_id]['votes']
        res = {'result' : 'Not TIE', 'winner' : blue_side, 'votes' : votes}
        if votes[red_side] > votes[blue_side] :
            res['winner'] = red_side
        if votes[red_side] == votes[blue_side] :
            res['result'] = 'TIE'
        del battles[event_id]
        emit('voteEnd', res, broadcast=True)
        
            

# @socketio.on('connect')
# def handle_connect():
#     # 當用戶連線時，發送當前的投票狀況
#     emit('voteUpdate', votes, broadcast=False)
    
@app.route('/create_battle_event', methods=['POST'])
def create_battle_event():
    data = request.json
    event_name = data.get('name')
    red_side = data.get('red_side')
    blue_side = data.get('blue_side')
    
    event_id = str(uuid.uuid4())  # 生成唯一活動 ID

    battles[event_id] = {
        'event_name': event_name,
        'red_side': red_side,
        'blue_side': blue_side,
        'votes': {f"{red_side}": 0, f"{blue_side}": 0}
    }
    print(f"[create_event]: {red_side} v.s {blue_side}")
    event_url = f"{FRONTEND_URL}/event/{event_id}"  # 前端活動網址
    return jsonify({'success': True, 'event_id': event_id, 'event_url': event_url})

@app.route('/event/<event_id>', methods=['GET'])
def get_battle_events(event_id):
    event = battles.get(event_id)
    print("[events]")
    if not event:
        return jsonify({'success': False, 'message': 'Event not found'}), 404
    return jsonify({'success': True, 'event': event})


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001)
