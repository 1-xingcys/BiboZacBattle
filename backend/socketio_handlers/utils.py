from flask_socketio import emit

from __main__ import socketio

from database.rounds import get_rounds

# find the round in progress, emitting to every member
def inform_event_status(event_id, r_id, isBattling):
  rounds = get_rounds(event_id)
  if rounds is not None:
      emit('response_round', rounds, broadcast=False)
      round = {}
      for rd in rounds:
          if str(rd['r_id']) == str(r_id):
              round = rd | { 'battling' : isBattling }
              break    
      emit('inform_event_status', round, to=event_id)