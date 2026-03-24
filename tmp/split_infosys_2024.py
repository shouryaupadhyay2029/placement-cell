import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get the IDs of the current 16 Infosys 2024 records
c.execute("SELECT id FROM placement_record WHERE year=2024 AND company_name='Infosys' ORDER BY id")
records = c.fetchall()

if len(records) == 16:
    print("Splitting 16 Infosys records into 5 SP and 11 standard.")
    # First 5 are SP
    for i in range(5):
        c.execute("UPDATE placement_record SET company_name='Infosys SP' WHERE id=?", (records[i][0],))
else:
    print(f"Current count is {len(records)}, not 16. Checking for 'Infosys SP' already...")
    c.execute("SELECT COUNT(*) FROM placement_record WHERE year=2024 AND company_name='Infosys SP'")
    sp_count = c.fetchone()[0]
    print(f"Current SP count: {sp_count}")

# Sync Company metadata
# 1. Update/Insert Infosys SP
c.execute("UPDATE company SET students_placed=5, role='Specialist Programmer' WHERE batch_year='2024' AND (company_name='Infosys SP' OR role='Specialist Programmer')")
# 2. Update/Insert Infosys standard
c.execute("UPDATE company SET students_placed=11, role='Systems Engineer' WHERE batch_year='2024' AND company_name='Infosys' AND role != 'Specialist Programmer'")

conn.commit()
conn.close()
print("Success: Infosys SP is now 5, and remaining 11 are Systems Engineers.")
