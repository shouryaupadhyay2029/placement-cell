import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

print("Wiping all 2025 recruitment data as requested...")
c.execute("DELETE FROM placement_record WHERE year=2025")
c.execute("DELETE FROM company WHERE batch_year='2025'")

conn.commit()
print("Success: 2025 recruitment data removed.")
conn.close()
