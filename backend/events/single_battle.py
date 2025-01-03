from models.enums import EventType
from .shared import events
import uuid

def create_single_battle(data):
    event_name = data.get('name')
    red_side = data.get('red_side')
    blue_side = data.get('blue_side')

    event_id = str(uuid.uuid4())

    events[event_id] = {
        'type': EventType.SINGLE_BATTLE,
        'event_name': event_name,
        'red_side': red_side,
        'blue_side': blue_side,
        'votes': {red_side: 0, blue_side: 0},
    }

    print(f"[Create Single Battle]: {red_side} v.s {blue_side}")
    return event_id, events[event_id]

def enter_single_battle(event_id):
    if events[event_id] :
        votes = events[event_id]['votes']
        print("[Client Enter] sending votes:", votes)
        return votes
    return None

def vote_single_battle(event_id, option):
    if events[event_id] :
        votes = events[event_id]['votes']
        votes[option] += 1
        print(f"[Votes] {option}")
        return votes
    return None


def get_single_battle(event_id):
    event = events.get(event_id)
    if not event:
        return None
    return event

def end_single_battle(event_id):
    if event_id not in events:
        return None

    red_side = events[event_id]['red_side']
    blue_side = events[event_id]['blue_side']
    votes = events[event_id]['votes']

    result = {
        'result': 'Not TIE',
        'winner': blue_side,
        'votes': votes,
    }
    if votes[red_side] > votes[blue_side]:
        result['winner'] = red_side
    elif votes[red_side] == votes[blue_side]:
        result['result'] = 'TIE'

    del events[event_id]
    return result
