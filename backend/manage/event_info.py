import random
from datetime import date
from models.db_utils import connect_to_database, execute_select_query, execute_query

def get_event(a_id):
    query = """
    SELECT e.id, e.name, e.date, e.champ_name
    FROM events AS e
    WHERE e.a_id = %s
    ORDER BY id DESC
    """
    res = execute_select_query(query, (a_id, ))
    formatted_results = []
    for row in res:
        e_id, e_name, date_val, champ_name = row
        if isinstance(date_val, date):  # 如果是 date 類型，轉為字串
            date_val = date_val.strftime('%Y-%m-%d')  # 格式化為 'YYYY-MM-DD'  
        formatted_results.append({
            'e_id' : e_id,
            'name' : e_name,
            'date' : date_val,
            'champ_name' : champ_name
        })
    return formatted_results


def add_event(name, a_id):
    query = """
    INSERT INTO events (name, date, a_id)
    VALUES (%s, CURRENT_DATE, %s)
    RETURNING id
    """
    values = (name, a_id)

    try:
        conn = connect_to_database()
        cursor = conn.cursor()
        cursor.execute(query, values)
        res = cursor.fetchone()  # 獲取返回的 id
        conn.commit()
        return res[0]  # 返回 id
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()
    # res = execute_select_query(query, values)
    # return res[0]['id'] if res else None  # 確保返回的結果有 id