from models.db_utils import execute_select_query, execute_query, connect_to_database
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
    SELECT name, veri_code
    FROM player
    WHERE e_id = %s
    ORDER BY name ASC
    """
    rows = execute_select_query(query, (event_id,))
    formatted_results = []

    for row in rows:
        name, veri_code = row
        formatted_results.append({
            'name': name,
            'veri_code': veri_code,
        })

    return formatted_results
  
  
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
  WHERE r_id = %s and e_id = %s and status IN ('new', 'end');
  """
  success, rowcount = execute_query(query, (r_id, event_id))
  if success and (rowcount > 0):
    print(f"Start round {r_id} successfully", flush=True)
    return True
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
    print(f"Stop round {r_id} successfully", flush=True)
    return True
  return False

def vote_round(event_id, r_id):
  query = """
  UPDATE round
  SET status = 'voting'
  WHERE r_id = %s and e_id = %s and status = 'inProgress';
  """
  success, rowcount = execute_query(query, (event_id, r_id))
  if success and (rowcount > 0):
    return True
  return False
  
def player_vote(event_id, r_id, p_name, side):
  if side != 'red' and side != 'blue' and side != 'tie':
    print("Invalid value of side:", side, flush=True)
    return False
    
  query = """
  INSERT INTO vote (p_name, r_id, e_id, side)
  VALUES (%s, %s, %s, %s);
  """
  success, rowcount = execute_query(query, (p_name, r_id, event_id, side))
  if success and (rowcount > 0):
    return True
  return False
  
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
  _, __, red_votes, blue_votes, tie_votes = rows[0]
  
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
  SET res = %s, status = 'end'
  WHERE r_id = %s AND e_id = %s
  """
  success, rowcount = execute_query(query, (res, r_id, event_id))
  if success and (rowcount > 0):
    return True, res
  return False, ''