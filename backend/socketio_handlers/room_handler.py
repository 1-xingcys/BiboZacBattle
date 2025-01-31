from flask import request
from flask_socketio import join_room, leave_room, emit

from __main__ import socketio

# 同個活動的參賽者會分配到同個 room
@socketio.on('request_join')
def on_join(data):
    sid = request.sid # get frontend session id
    e_id = data['eventId']  # 客戶端傳遞的房間名稱
    join_room(e_id)     # 加入房間
    emit('response_join', f'{sid} joined room {e_id}', broadcast=False)
    print(f"[ROOM SOCKETIO HANDLER] {sid} joined room {e_id}", flush=True)
    
    # Get all clients in this room
    clients = list(socketio.server.manager.rooms.get('/', {}).get(e_id, []))
    print(f"[ROOM SOCKETIO HANDLER] Room {e_id} has clients: {clients}", flush=True)

@socketio.on('request_leave')
def on_leave(data):
    sid = request.sid
    e_id = data['eventId']
    leave_room(e_id)
    emit('response_leave', f'{sid} left room {e_id}', broadcast=False)  # 廣播離開通知
    print(f'[ROOM SOCKETIO HANDLER] {sid} left room {e_id}', flush=True)
    clients = list(socketio.server.manager.rooms.get('/', {}).get(e_id, []))
    print(f"[ROOM SOCKETIO HANDLER] Room {e_id} has clients: {clients}", flush=True)