import sqlite3
db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT company_name, students_placed FROM company WHERE batch_year='2025'")
rows = c.fetchall()
total = 0
for row in rows:
    print(f"{row[0]}: {row[1]}")
    total += (row[1] or 0)
print(f"Total Companies sum: {total}")
conn.close()
