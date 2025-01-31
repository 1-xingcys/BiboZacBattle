from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_socketio import emit

from database.player import generate_verification_code, add_player, get_player, delete_player, authentication
from database.event_info import get_event, add_event

from api_handler.event_handler import event_handler_bp

FRONTEND_URL = "http://localhost:5173"

app = Flask(__name__)
app.register_blueprint(event_handler_bp)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

import socketio_handlers.event_handler
import socketio_handlers.room_handler
import socketio_handlers.round_handler
import socketio_handlers.vote_handler
import socketio_handlers.utils


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

