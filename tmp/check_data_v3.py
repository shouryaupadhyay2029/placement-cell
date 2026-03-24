import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

print("COMPANIES Infosys 2024:")
for row in c.execute("SELECT company_name, batch_year, students_placed FROM company WHERE company_name LIKE '%Infosys%' AND batch_year='2024'").fetchall():
    print(row)

print("\nRECORDS Infosys 2024:")
for row in c.execute("SELECT COUNT(*) FROM placement_record WHERE company_name LIKE '%Infosys%' AND year=2024").fetchall():
    print(f"Record Count: {row[0]}")

print("\nGO-DADDY 2025:")
for row in c.execute("SELECT id, company_name, student_name, year FROM placement_record WHERE company_name LIKE '%GoDaddy%' AND year=2025").fetchall():
    print(row)

conn.close()
