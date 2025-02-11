from flask import Flask, request, jsonify, Blueprint

from database.player import generate_verification_code, add_player, authentication
from database.event_info import get_event, add_event, delete_event

event_handler_bp = Blueprint('event_handler', __name__)

from flask_socketio import emit
from __main__ import socketio

@event_handler_bp.route('/sign_up', methods=['POST'])
def handle_sign_up():
    # 從請求中取得名字
    data = request.json
    name = data.get('name', '')  # 獲取名字字段，若無則默認為空字串
    e_id = data.get('e_id')
    print(f"[API HANDLER] Received name: {name}, e_id: {e_id}", flush=True)  # 打印輸入數據

    if not name:
        return jsonify({"error": "Name is required"}), 400  # 返回錯誤信息
    unique_number = generate_verification_code(name) # 生成唯一的五位數字
    add_player(name, unique_number, e_id)
    
    return jsonify({"name": name, "veri_code": unique_number})


# admin check event info
@event_handler_bp.route('/get_event_info', methods=['POST'])
def get_event_info():
    # 從請求中取得名字
    data = request.json
    a_id = data.get('a_id', '')  # 獲取名字字段，若無則默認為空字串
    if not a_id:
        return jsonify({"error": "a_id is required"}), 400  # 返回錯誤信息

    res = get_event(a_id)
    print(f"[API HANDLER] {res}", flush=True)
    return jsonify(res), 200

# admin create new event
@event_handler_bp.route('/create_new_event', methods=['POST'])
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
        return jsonify({"error": "Failed to create event"}), 404
      
# admin delete an event
@event_handler_bp.route('/delete_event', methods=['DELETE'])
def handle_delete_event():
  data = request.json
  e_id = data.get('eventId')
  res = delete_event(e_id)
  if res:
    return jsonify(res), 200
  else:
    return jsonify({"error" : "Failed to delete event"}), 404