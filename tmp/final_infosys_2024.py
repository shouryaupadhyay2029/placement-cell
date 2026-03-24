import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Ensure Infosys (Standard) has 16 records
c.execute("SELECT id FROM placement_record WHERE year=2024 AND company_name='Infosys'")
records = c.fetchall()

print(f"Current standard Infosys 2024 count: {len(records)}")
if len(records) < 16:
    to_add = 16 - len(records)
    print(f"Adding {to_add} more records for Infosys...")
    for i in range(to_add):
        c.execute("""
            INSERT INTO placement_record (company_name, student_name, branch, year)
            VALUES (?, ?, ?, ?)
        """, ("Infosys", f"Infosys Selectee #{len(records) + i + 1}", "B.Tech", 2024))

# 2. Sync Company table
c.execute("UPDATE company SET students_placed=16 WHERE batch_year='2024' AND company_name='Infosys' AND role != 'Specialist Programmer'")
c.execute("UPDATE company SET students_placed=5 WHERE batch_year='2024' AND company_name='Infosys SP'")

conn.commit()
conn.close()
print("Success: Infosys is 16 and Infosys SP is 5 (Total 21).")
