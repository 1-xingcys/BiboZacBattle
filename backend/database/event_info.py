import random
from datetime import date
from database.utils import connect_to_database, execute_select_query, execute_query

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
    query_add = """
    INSERT INTO events (name, date, a_id)
    VALUES (%s, CURRENT_DATE, %s)
    """

    query_select = """
    SELECT name, id
    FROM events
    WHERE name = %s AND a_id = %s
    """
    
    success, rowcount = execute_query(query_add, (name, a_id))
    print(f"[DATABASE] insert events {name} {success}!\n")
    if success and rowcount > 0:
        res = execute_select_query(query_select, (name, a_id))
        if res and len(res) > 0:
            e_name, e_id = res[0]  # 解構第一列資料
            formatted_results = { 'e_name': e_name, 'e_id': e_id }
            return formatted_results
    return False