import random
import datetime
from database.utils import connect_to_database, execute_select_query, execute_query

# 全局變量存儲當天生成的數字集合
generated_numbers = set()

def generate_verification_code(name):
    global generated_numbers
    today = datetime.date.today().strftime('%Y-%m-%d')  # 取得今天日期
    seed = name + today  # 結合名字和日期作為種子
    random.seed(seed)  # 設置隨機數生成器的種子
    
    while True:
        number = random.randint(10000, 99999)  # 生成五位數字
        if number not in generated_numbers:  # 確保不重複
            generated_numbers.add(number)  # 加入集合
            return number


def add_player(p_name, veri_code, e_id):
    query = """
    INSERT INTO player (name, veri_code, e_id, online)
    VALUES (%s, %s, %s, false)
    """
    success, rowcount = execute_query(query, (p_name, veri_code, e_id))
    if success and rowcount > 0:
        print(f"[DATABASE] {p_name} player added successfully")
        return True
    return False



def delete_player(e_id, p_name):
    query = """
    DELETE FROM player
    WHERE e_id = %s AND name = %s
    """
    success, rowcount = execute_query(query, (e_id, p_name))
    if success and rowcount > 0:
        print(f"[DATABASE] {p_name} player deleted successfully")
        return True
    return False

def get_online_player(e_id):
    query = """
    SELECT name, online
    FROM player
    WHERE e_id = %s
    """
    res = execute_select_query(query, (e_id, ))

    formatted_results = []
    for row in res:
        p_name, online = row
        formatted_results.append({ 'p_name': p_name, 'online' : online })
    return formatted_results

def authentication(veri_code, e_id):
    query = """
    SELECT name
    FROM player
    WHERE veri_code = %s AND e_id = %s
    """
    rows = execute_select_query(query, (veri_code, e_id))
    if rows:
        print(f"[DATABASE] Player {rows[0][0]} in event {e_id} login")
        return rows[0][0]
    return ""

def set_online_status(status, name, e_id):
    query = """
    UPDATE player
    SET online = %s
    WHERE name = %s AND e_id = %s
    """
    success, rowcount = execute_query(query, (status, name, e_id))
    if success and (rowcount > 0):
        print(f"[DATABASE] {name} {'online' if status else 'offline'}", flush=True)
        return True
    print(f"[DATABASE] {name} online FAIL", flush=True)
    return False