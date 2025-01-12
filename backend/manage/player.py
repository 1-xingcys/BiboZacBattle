import random
import datetime
from models.db_utils import connect_to_database, execute_select_query, execute_query

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
    INSERT INTO player (name, veri_code, e_id)
    VALUES (%s, %s, %s)
    """
    success, rowcount = execute_query(query, (p_name, veri_code, e_id))
    if success and rowcount > 0:
        print(f"{p_name} player added successfully")
        return True
    return False


def get_player(e_id):
    query = """
    SELECT name, veri_code
    FROM player
    WHERE e_id = %s
    """
    res = execute_select_query(query, (e_id, ))

    formatted_results = []
    for row in res:
        p_name, veri_code = row
        formatted_results.append({ 'p_name': p_name, 'veri_code': veri_code })
    return formatted_results


def delete_player(e_id, p_name):
    query = """
    DELETE FROM player
    WHERE e_id = %s AND name = %s
    """
    success, rowcount = execute_query(query, (e_id, p_name))
    if success and rowcount > 0:
        print(f"{p_name} player deleted successfully")
        return True
    return False

def authentication(veri_code, e_id):
    query = """
    SELECT name
    FROM player
    WHERE veri_code = %s AND e_id = %s
    """
    rows = execute_select_query(query, (veri_code, e_id))
    if rows:
        print(f"Player {rows[0][0]} in event {e_id} login")
        return rows[0][0]
    return ""