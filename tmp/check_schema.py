import sqlite3
import os

db_path = "backend/students.db"
print(f"Checking {os.path.abspath(db_path)}")
if not os.path.exists(db_path):
    print("NOT FOUND")
    exit()

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print(f"TABLES: {tables}")

for t in [t[0] for t in tables]:
    print(f"\nTABLE: {t}")
    try:
        c.execute(f"PRAGMA table_info({t})")
        cols = c.fetchall()
        print(f"Columns: {[col[1] for col in cols]}")
    except:
        pass

conn.close()
