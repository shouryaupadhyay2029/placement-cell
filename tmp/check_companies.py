import sqlite3
import os

db_path = r'c:\Users\Shourya Upadhyay\OneDrive\Documents\ALL CODES\PROJECT\placement-cell\backend\instance\students.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('SELECT company_name, package FROM company WHERE batch_year="2024" LIMIT 5')
for row in cursor.fetchall():
    print(f"[{row[0]}] -> '{row[1]}'")
conn.close()
