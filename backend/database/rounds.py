from database.utils import execute_select_query, execute_query, connect_to_database
from datetime import datetime

"""
For a given event
"""

def get_rounds(event_id):
  query = """
  select r_id, datetime, red_name, blue_name, res, type, status 
  from round where e_id = %s 
  order by datetime asc
  """
  rows = execute_select_query(query, (event_id, ))
  formatted_results = []
  for row in rows:
      r_id, datetime_val, red_name, blue_name, res, type, status = row
      if isinstance(datetime_val, datetime):  # 如果是 datetime，轉為字串
          datetime_val = datetime_val.isoformat()    
      formatted_results.append({
        'r_id' : r_id,
        'datetime' : datetime_val,
        'red_name' : red_name,
        'blue_name' : blue_name,
        'res' : res,
        'type' : type,
        'status' : status
      })
  
  return formatted_results

def get_players(event_id):
    query = """
    SELECT name, veri_code, online
    FROM player
    WHERE e_id = %s
    ORDER BY name ASC
    """
    rows = execute_select_query(query, (event_id,))
    formatted_results = []

    for row in rows:
        name, veri_code, online = row
        formatted_results.append({
            'name': name,
            'veri_code': veri_code,
            'online' : online
        })

    return formatted_results


def get_status(event_id):
  query = """
  SELECT r_id, datetime, red_name, blue_name, res, type, status
  FROM round
  WHERE e_id = %s AND status IN ('inProgress', 'voting', 'checking');
  """
  rows = execute_select_query(query, (event_id,))
  if not rows:
    return { 'battling' : False }
  
  r_id, datetime_val, red_name, blue_name, res, type, status = rows[0]
  if isinstance(datetime_val, datetime):  # 如果是 datetime，轉為字串
          datetime_val = datetime_val.isoformat() 
  return {
        'battling' : True,
        'r_id' : r_id,
        'datetime' : datetime_val,
        'red_name' : red_name,
        'blue_name' : blue_name,
        'res' : res,
        'type' : type,
        'status' : status
      }
  
"""
For a given round
"""

def create_single_round(event_id, red_name, blue_name, type):
  query = """
  INSERT INTO round (e_id, datetime, red_name, blue_name, type, res, status)
  VALUES (%s, CURRENT_TIMESTAMP, %s, %s, %s, 'nan', 'new');
  """
  success, rowcount = execute_query(query, (event_id, red_name, blue_name, type))
  if success:
    return True
  return False

def start_round(event_id, r_id):
  query = """
  UPDATE round
  SET status = 'inProgress'
  WHERE r_id = %s and e_id = %s and status IN ('new', 'end', 'checking');
  """
  success, rowcount = execute_query(query, (r_id, event_id))
  if success and (rowcount > 0):
    print(f"[DATABASE] Start eventId : {event_id}, roundId : {r_id} successfully", flush=True)
    return True
  print(f"[DATABASE] Start eventId : {event_id}, roundId : {r_id} failed", flush=True)
  return False

def stop_round(event_id, r_id):
  query = """
  UPDATE round
  SET status = CASE
      WHEN res != 'nan' THEN 'end'::round_status_enum
      ELSE 'new'::round_status_enum
  END
  WHERE r_id = %s AND e_id = %s AND status = 'inProgress'
  """
  success, rowcount = execute_query(query, (r_id, event_id))
  if success and (rowcount > 0):
    print(f"[DATABASE] Stop eventId : {event_id}, roundId : {r_id} successfully", flush=True)
    return True
  print(f"[DATABASE] Stop eventId : {event_id}, roundId : {r_id} failed", flush=True)
  return False

def vote_round(event_id, r_id):
  clean_query = """
  DELETE FROM vote WHERE r_id = %s AND e_id = %s;
  """
  execute_query(clean_query, (r_id, event_id))
  
  query = """
  UPDATE round
  SET status = 'voting'::round_status_enum
  WHERE r_id = %s AND e_id = %s and status = 'inProgress';
  """
  success, rowcount = execute_query(query, (r_id, event_id))
  if success and (rowcount > 0):
    return True
  return False
  
def player_vote(event_id, r_id, p_name, side):
  if side != 'red' and side != 'blue' and side != 'tie':
    print("[DATABASE] Invalid value of side:", side, flush=True)
    return False
    
  query = """
  INSERT INTO vote (p_name, r_id, e_id, side)
  VALUES (%s, %s, %s, %s);
  """
  success, rowcount = execute_query(query, (p_name, r_id, event_id, side))
  if success and (rowcount > 0):
    print(f"[DATABASE] Player {p_name} vote {side} at eventId : {event_id}, roundId : {r_id} successfully", flush=True)
    return True
  print(f"[DATABASE] Player {p_name} vote {side} at eventId : {event_id}, roundId : {r_id} failed", flush=True)
  return False

def is_player_voted(event_id, r_id, p_name):
  query = """
  SELECT p_name
  FROM vote
  WHERE e_id = %s AND r_id = %s AND p_name = %s
  """
  rows = execute_select_query(query, (event_id, r_id, p_name))
  if rows:
    return True
  return False

def vote_status(event_id, r_id):
  query = """
  SELECT name, online, COALESCE(side, 'empty')
  FROM (
    SELECT pl.name AS name, pl.online AS online, COALESCE(v.r_id, -1) AS r_id, v.side AS side
    FROM player AS pl
    LEFT JOIN vote AS v ON v.p_name = pl.name AND v.r_id = %s
    WHERE pl.e_id = %s 
  )
  WHERE r_id IN (%s, -1)
  """
  rows = execute_select_query(query, (r_id, event_id, r_id))
  formatted_results = []
  for row in rows:
      p_name, online, side = row
      formatted_results.append({
        'p_name' : p_name,
        'online' : online,
        'side' : side
      })
  
  return formatted_results
  
def compute_result(event_id, r_id):
  query = """
  SELECT 
    r_id,
    e_id,
    SUM(CASE WHEN side = 'red' THEN 1 ELSE 0 END) AS red_votes,
    SUM(CASE WHEN side = 'blue' THEN 1 ELSE 0 END) AS blue_votes,
    SUM(CASE WHEN side = 'tie' THEN 1 ELSE 0 END) AS tie_votes
  FROM vote
  WHERE r_id = %s AND e_id = %s
  GROUP BY r_id, e_id;
  """
  rows = execute_select_query(query, (r_id, event_id))
  print(f"[DATABASE] From compute_result: rows = {rows}", flush=True)
  if rows:
    _, __, red_votes, blue_votes, tie_votes = rows[0]
  else :
    red_votes, blue_votes, tie_votes = 0,0,0
    
  print(f"[DATABASE] Compute Result e_id = {event_id}, r_id = {r_id}\n red : {red_votes}, blue : {blue_votes}, tie : {tie_votes}", flush=True)
  
  res = ''
  if tie_votes * 1.25 > (red_votes + blue_votes + tie_votes):
    res = 'tie'
  elif blue_votes > red_votes:
    res = 'blue'
  elif red_votes > blue_votes:
    res = 'red'
  else:
    res = 'tie'
  
  query = """
  UPDATE round
  SET res = %s::round_result_enum, status = 'checking'::round_status_enum
  WHERE r_id = %s AND e_id = %s
  """
  success, rowcount = execute_query(query, (res, r_id, event_id))
  if success and (rowcount > 0):
    return True, res
  return False, ''

def check_round(event_id, r_id):
  query = """
  UPDATE round
  SET status = 'end'::round_status_enum
  WHERE r_id = %s AND e_id = %s and status = 'checking';
  """
  success, rowcount = execute_query(query, (r_id, event_id))
  if success and (rowcount > 0):
    print(f"[DATABASE] Checking eventId : {event_id}, roundId : {r_id} successfully", flush=True)
    return True
  print(f"[DATABASE] Checking eventId : {event_id}, roundId : {r_id} failed", flush=True)
  return False