from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_socketio import emit

from events.single_battle import create_single_battle, get_single_battle, end_single_battle, \
                                    vote_single_battle, enter_single_battle
from events.seven_to_smoke import create_seven_to_smoke
from manage.player import generate_verification_code, save_to_file


FRONTEND_URL = "http://localhost:5173"

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

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
    if not name:
        return jsonify({"error": "Name is required"}), 400  # 返回錯誤信息
    unique_number = generate_verification_code(name) # 生成唯一的五位數字
    save_to_file(name, unique_number)
    
    return jsonify({"name": name, "veri_code": unique_number})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5002)

