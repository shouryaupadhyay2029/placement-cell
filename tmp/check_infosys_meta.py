import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, company_name, role, students_placed FROM company WHERE batch_year='2024' AND (company_name LIKE '%Infosys%' OR company_name = 'Infosys')")
rows = c.fetchall()

print("Infosys 2024 Company entries:")
for r in rows:
    print(f"ID: {r[0]}, Name: {r[1]}, Role: {r[2]}, Placed: {r[3]}")

conn.close()
