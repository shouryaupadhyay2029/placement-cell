import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# List of companies to REMOVE (those appearing AFTER TensorGo in the 2025 seating/list)
to_remove = [
    "AVL",
    "RTDS",
    "Terafac Technologies", # The second entry was robotics
    "Earth Crust - (Lets Try)", 
    "Capgemini Technology Services India",
    "Publicis Sapient",
    "Unthinkable Solutions",
    "High-Technext Engineering & Telecom",
    "IndiaMart",
    "Physics Wallah",
    "Microsoft"
]

for company in to_remove:
    print(f"Removing {company} (2025 batch)...")
    # Clean name matching (we used clean names in database)
    # But wait, my script in 1020 used clean_name. I'll match starting with the string.
    c.execute("DELETE FROM company WHERE batch_year='2025' AND (company_name LIKE ? OR company_name = ?)", (f"{company}%", company))
    c.execute("DELETE FROM placement_record WHERE year=2025 AND (company_name LIKE ? OR company_name = ?)", (f"{company}%", company))

conn.commit()

# Re-calculate total from PlacementRecord
c.execute("SELECT COUNT(*) FROM placement_record WHERE year=2025")
total = c.fetchone()[0]
print(f"\nRemaining students in 2025 batch: {total}")

conn.close()
