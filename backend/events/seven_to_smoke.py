from models.enums import EventType, EventStatus
from .shared import events
import uuid
import random

def create_seven_to_smoke(data):
    participants = data.get('participants')
    event_id = str(uuid.uuid4())
    queue = random.sample(participants, len(participants))

    events[event_id] = {
        'type': EventType.SEVEN_TO_SMOKE,
        'participants': participants,
        'points': {p: 0 for p in participants}, # 每個人的積分
        'status': EventStatus.NEW,
        'queue': queue,
        'red_side': queue[0],
        'blue_side': queue[1],
        'all_votes': {} # 每一場的投票
    }

    print(f"[Create 7 To Smoke] {participants}")
    return event_id, events[event_id]
