from models.db_utils import connect_to_database

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

CREATE TABLE admin (
    id VARCHAR(10) PRIMARY KEY,
    pwd VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    a_id VARCHAR(10) NOT NULL,
    champ_name VARCHAR(255),
    FOREIGN KEY (a_id) REFERENCES admin(id)
);

CREATE TABLE player (
    name VARCHAR(255) PRIMARY KEY,
    veri_code INT NOT NULL,
    e_id INT NOT NULL,
    audience BOOLEAN NOT NULL,
    FOREIGN KEY (e_id) REFERENCES events(id)
);

CREATE TYPE result_enum AS ENUM ('red', 'blue', 'tie', 'nan');
CREATE TABLE round (
    r_id SERIAL PRIMARY KEY,
    e_id INT NOT NULL,
    datetime TIMESTAMP NOT NULL,
    red_name VARCHAR(255) NOT NULL,
    blue_name VARCHAR(255) NOT NULL,
    res result_enum NOT NULL,
    type VARCHAR(255) NOT NULL,
    FOREIGN KEY (e_id) REFERENCES events(id),
    FOREIGN KEY (red_name) REFERENCES player(name),
    FOREIGN KEY (blue_name) REFERENCES player(name)
);

CREATE TABLE vote (
    p_name VARCHAR(255) NOT NULL,
    r_id INT NOT NULL,
    side result_enum NOT NULL,
    PRIMARY KEY (p_name, r_id),
    FOREIGN KEY (p_name) REFERENCES player(name),
    FOREIGN KEY (r_id) REFERENCES round(r_id)
);

INSERT INTO admin (id, pwd) 
VALUES ('admin', 'admin');
'''


if __name__ == "__main__":
  create_tables(create_table_query)