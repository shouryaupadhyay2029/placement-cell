import sqlite3
import os

db_path = os.path.join("backend", "students.db")
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("COMPANIES:")
for row in c.execute("SELECT company_name, batch_year, students_placed FROM company WHERE company_name LIKE '%GoDaddy%'").fetchall():
    print(row)

print("\nRECORDS:")
for row in c.execute("SELECT company_name, student_name, year FROM placement_record WHERE company_name LIKE '%GoDaddy%'").fetchall():
    print(row)

conn.close()
