import sqlite3
import os

db_path = "backend/instance/students.db"
if not os.path.exists(db_path):
    print("NOT FOUND AT instance")
    exit()

conn = sqlite3.connect(db_path)
c = conn.cursor()

print("COMPANIES:")
for row in c.execute("SELECT company_name, batch_year, students_placed FROM company WHERE company_name LIKE '%GoDaddy%'").fetchall():
    print(row)

print("\nRECORDS:")
try:
    for row in c.execute("SELECT company_name, student_name, year FROM placement_record WHERE company_name LIKE '%GoDaddy%'").fetchall():
        print(row)
except:
    print("PlacementRecord Table Error")

conn.close()
