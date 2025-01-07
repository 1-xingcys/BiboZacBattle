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