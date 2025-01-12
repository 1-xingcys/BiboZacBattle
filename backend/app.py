from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room
from flask_cors import CORS
from flask_socketio import emit

from manage.player import generate_verification_code, add_player, get_player, delete_player, authenticationj
from manage.event_info import get_event, add_event
from manage.rounds import get_rounds, get_players, create_single_round, start_round, stop_round, \
                            get_status


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
            round = {}
            for rd in rounds:
                if rd['r_id'] == r_id:
                    round = rd | { 'battling' : True }
                    break    
            emit('inform_event_status', round, to=event_id)

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
            round = {}
            for rd in rounds:
                if rd['r_id'] == r_id:
                    round = rd | { 'battling' : False }
                    break    
            emit('inform_event_status', round, to=event_id)

            
# 同個活動的參賽者會分配到同個 room
@socketio.on('request_join')
def on_join(data):
    sid = request.sid # get frontend session id
    e_id = data['eventId']  # 客戶端傳遞的房間名稱
    join_room(e_id)     # 加入房間
    emit('response_join', f'{sid} joined room {e_id}', broadcast=False)
    print(f"{sid} joined room {e_id}", flush=True)
    
    # Get all clients in this room
    clients = list(socketio.server.manager.rooms.get('/', {}).get(e_id, []))
    print(f"Room {e_id} has clients: {clients}", flush=True)

@socketio.on('request_leave')
def on_leave(data):
    sid = request.sid
    e_id = data['eventId']
    leave_room(e_id)
    emit('response_leave', f'{sid} left room {e_id}', broadcast=False)  # 廣播離開通知
    print(f'{sid} left room {e_id}', flush=True)
    clients = list(socketio.server.manager.rooms.get('/', {}).get(e_id, []))
    print(f"Room {e_id} has clients: {clients}", flush=True)
    
@socketio.on('request_event_status')
def handle_event_status(data):
    e_id = data['eventId']
    res = get_status(e_id)
    print(f"client request event status", flush=True)
    emit('inform_event_status', res, broadcast=False)


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

@socketio.on('get_player')
def get_player_info(data):
    e_id = data.get('eventId')
    res = get_player(e_id)
    if res:
        emit('response_player_info', res, broadcast=False)
    else:
        emit('response_player_info', [], broadcast=False)

@socketio.on('delete_player_info')
def delete_player_info(data):
    e_id = data.get('eventId')
    player_name = data.get('playerName')

    success = delete_player(e_id, player_name)
    if success:
        emit('response_delete_player', {'success': True})
    else:
        emit('response_delete_player', {'success': False, 'message': 'Failed to delete player'})


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
    a_id = data.get('a_id', '')  
    if not a_id:
        return jsonify({"error": "a_id is required"}), 400  # 返回錯誤信息

    res = add_event(name, a_id)
    if res:
        return jsonify(res), 200
    else:
        return jsonify({"error": "Failed to create event"}), 500

@app.route('/player/login', methods=['POST'])
def player_login():
    data = request.json
    e_id = data.get('e_id')
    veri_code = data.get('veri_code')
    name = authentication(veri_code, e_id)
    if name:
        return jsonify({'name': name}), 200
    return jsonify({'error': 'invalid verification code'}), 403

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

