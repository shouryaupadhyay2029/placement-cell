import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("PRAGMA table_info(company)")
cols = c.fetchall()
for col in cols:
    print(f"Index: {col[0]}, Name: {col[1]}")
conn.close()
