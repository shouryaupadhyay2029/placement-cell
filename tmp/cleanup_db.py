import sqlite3
import re

db_path = r'c:\Users\Shourya Upadhyay\OneDrive\Documents\ALL CODES\PROJECT\placement-cell\backend\instance\students.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, package FROM company")
rows = c.fetchall()

for cid, pkg in rows:
    if pkg:
        # 1. Strip extra stuff
        # Matches numbers and potential decimals, then any trailing "LPA" or variation
        match = re.search(r'(\d+\.?\d*)', pkg)
        if match:
            num = match.group(1)
            new_pkg = f"{num} LPA"
            if new_pkg != pkg:
                print(f"Update {cid}: '{pkg}' -> '{new_pkg}'")
                c.execute("UPDATE company SET package = ? WHERE id = ?", (new_pkg, cid))

conn.commit()
print("Database cleanup complete.")
conn.close()
