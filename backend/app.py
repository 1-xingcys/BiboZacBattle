from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS


FRONTEND_URL = "http://localhost:5173"

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

from api_handler.event_handler import event_handler_bp
from api_handler.authentication import authentication_bp
app.register_blueprint(event_handler_bp)
app.register_blueprint(authentication_bp)

import socketio_handlers.event_handler
import socketio_handlers.room_handler
import socketio_handlers.round_handler
import socketio_handlers.vote_handler
import socketio_handlers.utils


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)

