from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_socketio import emit

from events.single_battle import create_single_battle, get_single_battle, end_single_battle, \
                                    vote_single_battle, enter_single_battle
from events.seven_to_smoke import create_seven_to_smoke
from events.rounds import get_rounds, get_players, create_single_round, start_round, stop_round
from manage.player import generate_verification_code, add_player
from manage.event_info import get_event, add_event


FRONTEND_URL = "http://localhost:5173"

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

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

@socketio.on('request_create1on1')
def handle_create_1on1(data):
    # 提取前端傳遞的資料
    info1on1 = data.get('info1on1')
    event_id = data.get('eventId')

    # 確認資料是否正確 
    print(f"Received info1on1: {info1on1}")
    print(f"Received eventId: {event_id}", flush=True)

    # 獲取 info1on1 中的具體值
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
        rounds = get_rounds(event_id)
        if rounds is not None:
            emit('response_round', rounds, broadcast=False)

@socketio.on('request_stop_round')
def handle_stop_round(data):
    event_id = data.get('eventId')
    r_id = data.get('r_id')
    res = stop_round(event_id, r_id)
    if res:
        emit('response_stop_round', res, broadcast=False)
        rounds = get_rounds(event_id)
        if rounds is not None:
            emit('response_round', rounds, broadcast=False)

@socketio.on('vote')
def handle_vote(data):
    option = data.get('option')
    event_id = data.get('event_id')
    votes = vote_single_battle(event_id, option)
    if votes is not None:
        emit('voteUpdate', votes, broadcast=True)
        
@socketio.on('enter')
def handle_enter(data):
    event_id = data.get('event_id')
    votes = enter_single_battle(event_id)
    if votes is not None:
        emit('voteUpdate', votes, broadcast=True)
    
@app.route('/event/<event_id>', methods=['GET'])
def get_battle_event(event_id):
    event = get_single_battle(event_id)
    if not event:
        return jsonify({'success': False, 'message': 'Event not found'}), 404
    return jsonify({'success': True, 'event': event})


@socketio.on('end')
def handle_end(data):
    event_id = data.get('event_id')
    result = end_single_battle(event_id)
    if result:
        emit('voteEnd', result, broadcast=True)

@app.route('/create_battle_event', methods=['POST'])
def handle_create_battle_event():
    data = request.json
    event_id, event = create_single_battle(data)
    event_url = f"{FRONTEND_URL}/event/{event_id}"
    return jsonify({'success': True, 'event_id': event_id, 'event_url': event_url})

@app.route('/create_7_to_smoke', methods=['POST'])
def handle_create_7_to_smoke():
    data = request.json
    event_id, event = create_seven_to_smoke(data)
    event_url = f"{FRONTEND_URL}/event/{event_id}"
    return jsonify({'success': True, 'event_id': event_id, 'event_url': event_url})

@app.route('/sign_up', methods=['POST'])
def handle_sign_up():
    # 從請求中取得名字
    data = request.json
    name = data.get('name', '')  # 獲取名字字段，若無則默認為空字串
    e_id = data.get('e_id')
    print(f"Received name: {name}, e_id: {e_id}", flush=True)  # 打印輸入數據

    if not name:
        return jsonify({"error": "Name is required"}), 400  # 返回錯誤信息
    unique_number = generate_verification_code(name) # 生成唯一的五位數字
    add_player(name, unique_number, e_id)
    
    return jsonify({"name": name, "veri_code": unique_number})

# admin check event info
@app.route('/get_event_info', methods=['POST'])
def get_event_info():
    # 從請求中取得名字
    data = request.json
    a_id = data.get('a_id', '')  # 獲取名字字段，若無則默認為空字串
    if not a_id:
        return jsonify({"error": "a_id is required"}), 400  # 返回錯誤信息

    res = get_event(a_id)
    print(res, flush=True)
    return jsonify(res), 200

# admin create new event
@app.route('/create_new_event', methods=['POST'])
def create_new_event():
    # 從請求中取得名字
    data = request.json
    name = data.get('name', '')  # 獲取名字字段，若無則默認為空字串
    a_id = data.get('a_id', '')  # 獲取名字字段，若無則默認為空字串
    if not a_id:
        return jsonify({"error": "a_id is required"}), 400  # 返回錯誤信息

    e_id = add_event(name, a_id)
    if e_id:
        return jsonify({"e_id": e_id}), 200
    else:
        return jsonify({"error": "Failed to create event"}), 500


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

