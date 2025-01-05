import psycopg2
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to the database
def connect_to_database():
    for i in range(5):
        try:
            conn = psycopg2.connect(DATABASE_URL)
            return conn
        except psycopg2.OperationalError:
            print("Database not ready, retrying in 3 seconds...")
            time.sleep(3)
    raise Exception("Database connection failed after retries")