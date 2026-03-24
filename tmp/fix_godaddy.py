import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update Company package and count
print("UPDATING Company table...")
c.execute("UPDATE company SET package='27.00 LPA', students_placed=1 WHERE company_name='GoDaddy' AND batch_year='2025'")

# 2. Add student record to PlacementRecord
print("ADDING record to placement_record...")
c.execute("INSERT INTO placement_record (company_name, student_name, branch, year) VALUES ('GoDaddy', 'Selected Student', 'AI & DS', 2025)")

conn.commit()
print("DONE.")
conn.close()
