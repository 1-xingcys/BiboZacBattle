from database.utils import connect_to_database

# Create tables using a SQL string
def create_tables(create_table_query):
    conn = connect_to_database()
    cur = conn.cursor()
    try:
        cur.execute(create_table_query)
        conn.commit()
        print("Successfully created tables")
    except Exception as e:
        conn.rollback()
        print(f"Failed to create tables: {e}")
    finally:
        cur.close()
        conn.close()
       
# ========================= query strings =========================# 
create_table_query = '''
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE admin (
    id VARCHAR(10) PRIMARY KEY,
    pwd VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    a_id VARCHAR(10) NOT NULL,
    champ_name VARCHAR(255),
    FOREIGN KEY (a_id) REFERENCES admin(id) ON DELETE CASCADE
);

CREATE TABLE player (
    name VARCHAR(255) NOT NULL,
    veri_code INT NOT NULL,
    e_id UUID NOT NULL,
    PRIMARY KEY (name, e_id),
    FOREIGN KEY (e_id) REFERENCES events(id) ON DELETE CASCADE,
    online BOOLEAN NOT NULL
);

CREATE TYPE round_result_enum AS ENUM ('red', 'blue', 'tie', 'nan');
CREATE TYPE round_status_enum AS ENUM ('inProgress', 'voting', 'checking', 'end', 'new');
CREATE TABLE round (
    r_id SERIAL NOT NULL,
    e_id UUID NOT NULL,
    datetime TIMESTAMP NOT NULL,
    red_name VARCHAR(255) NOT NULL,
    blue_name VARCHAR(255) NOT NULL,
    res round_result_enum,
    status round_status_enum DEFAULT 'new',
    type VARCHAR(255) NOT NULL,
    PRIMARY KEY (r_id, e_id),
    FOREIGN KEY (e_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TYPE vote_result_enum AS ENUM ('red', 'blue', 'tie', 'empty');
CREATE TABLE vote (
    p_name VARCHAR(255) NOT NULL,
    r_id INT NOT NULL,
    e_id UUID NOT NULL,
    side vote_result_enum NOT NULL,
    PRIMARY KEY (p_name, r_id, e_id), -- 主鍵更新為包含 e_id
    FOREIGN KEY (p_name, e_id) REFERENCES player(name, e_id) ON DELETE CASCADE,
    FOREIGN KEY (r_id, e_id) REFERENCES round(r_id, e_id) ON DELETE CASCADE -- 設置複合外鍵
);

INSERT INTO admin (id, pwd) 
VALUES ('admin', 'admin');

-- temp

-- INSERT INTO events (name, date, a_id, champ_name)
-- VALUES ('Annual Dance Battle', '2025-01-06', 'admin', null);
-- 
-- INSERT INTO player (name, veri_code, e_id, online)
-- VALUES 
--     ('Player1', 1234, 1, FALSE),
--     ('Player2', 5678, 1, FALSE),
--     ('Player3', 9101, 1, FALSE),
--     ('Player4', 1121, 1, FALSE),
--     ('Player5', 3141, 1, FALSE),
--     ('Player6', 5161, 1, FALSE);
-- INSERT INTO round (e_id, datetime, red_name, blue_name, res, type)
-- VALUES 
--     (1, '2025-01-06 14:00:00', 'Player1', 'Player2', 'red', 'Best16'),
--     (1, '2025-01-06 15:00:00', 'Player3', 'Player4', 'blue', 'Best16'),
--     (1, '2025-01-06 16:00:00', 'Player1', 'Player3', 'tie', 'Best16'),
--     (1, '2025-01-06 17:00:00', 'Player2', 'Player4', 'nan', 'Best8'),
--     (1, '2025-01-06 18:00:00', 'Player1', 'Player4', 'nan', 'Best4'),
--     (1, '2025-01-06 19:00:00', 'Player3', 'Player2', 'nan', 'Final');

'''


if __name__ == "__main__":
  create_tables(create_table_query)