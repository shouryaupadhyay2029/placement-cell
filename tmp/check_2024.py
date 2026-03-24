import sqlite3
db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT company_name, COUNT(*) FROM placement_record WHERE year=2024 GROUP BY company_name")
data = c.fetchall()
for d in data:
    print(f"{d[0]}: {d[1]}")
c.execute("SELECT COUNT(*) FROM placement_record WHERE year=2024")
print(f"Total 2024: {c.fetchone()[0]}")
conn.close()
