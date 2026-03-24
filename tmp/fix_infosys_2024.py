import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Find the 2024 Infosys records
c.execute("SELECT id FROM placement_record WHERE year=2024 AND (company_name LIKE '%Infosys%' OR company_name = 'Infosys') ORDER BY id DESC")
records = c.fetchall()

print(f"Current Infosys 2024 count: {len(records)}")

if len(records) > 16:
    num_to_delete = len(records) - 16
    print(f"Deleting {num_to_delete} excess records...")
    to_delete = records[:num_to_delete]
    for r in to_delete:
        c.execute("DELETE FROM placement_record WHERE id=?", (r[0],))
    print(f"Success: Remaining count is 16.")
else:
    print("Infosys 2024 already has 16 or fewer records.")
    
# Update Company table students_placed count if present
c.execute("UPDATE company SET students_placed=16 WHERE batch_year='2024' AND (company_name LIKE '%Infosys%' OR company_name = 'Infosys')")

conn.commit()
conn.close()
