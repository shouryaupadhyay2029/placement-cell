import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Delete redundant "GoDaddy Inc." (the one with 0)
print("DELETING redundant GoDaddy Inc...")
c.execute("DELETE FROM company WHERE company_name='GoDaddy Inc.' AND batch_year='2025'")

# 2. Add some missing Infosys records to bridge the gap if needed?
# Actually, I already have 45 records in PlacementRecord for 2024.
# My API now sums them. So Infosys 2024 is now 45.

conn.commit()
print("DONE CLEANUP.")
conn.close()
