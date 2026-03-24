import sqlite3
import os

db_path = os.path.join("backend", "students.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()
print("TABLES:")
for row in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    print(row)
conn.close()
