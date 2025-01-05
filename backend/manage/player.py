import random
import datetime
import json
import os

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
        


DATA_FILE = "verification_codes.json"
def save_to_file(name, unique_number):
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {}

    data[name] = unique_number

    with open(DATA_FILE, "w") as f:
        json.dump(data, f)