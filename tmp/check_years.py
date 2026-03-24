import sqlite3
db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT DISTINCT year FROM placement_record")
print(f"Years: {c.fetchall()}")
c.execute("SELECT COUNT(*) FROM placement_record")
print(f"Total entries: {c.fetchone()[0]}")
conn.close()
