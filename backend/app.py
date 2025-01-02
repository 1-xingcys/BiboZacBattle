from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_socketio import emit

from events.single_battle import create_single_battle, get_single_battle, end_single_battle, \
                                    vote_single_battle, enter_single_battle
from events.seven_to_smoke import create_seven_to_smoke


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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5002)

