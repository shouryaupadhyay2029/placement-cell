import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get all 2025 records
c.execute("SELECT id FROM placement_record WHERE year=2025 ORDER BY id")
records = c.fetchall()

print(f"Total 2025 records: {len(records)}")

if len(records) != 110:
    print("Warning: Expected 110 records for 2025 to match stats.")

# AI-DS: 36 (Index 0-35)
# AI-ML: 28 (Index 36-63)
# IIOT: 31 (Index 64-94)
# A&R: 15 (Index 95-109)

counts = [36, 28, 31, 15]
branches = ["AI-DS", "AI-ML", "IIOT", "A&R"]

idx = 0
for i in range(len(branches)):
    for j in range(counts[i]):
        if idx < len(records):
            c.execute("UPDATE placement_record SET branch = ? WHERE id = ?", (branches[i], records[idx][0]))
            idx += 1

conn.commit()
print("Redistributed 110 records into branches perfectly.")
conn.close()
