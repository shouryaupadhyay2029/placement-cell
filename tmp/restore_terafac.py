import sqlite3
db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Terafac Technologies (AIML) - 2 Students
c.execute("""
    INSERT INTO company (batch_year, company_name, role, package, location, eligibility, deadline, status, students_placed, company_type, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ("2025", "Terafac Technologies", "Jr. AIML & Vision Engineer", "7.00 LPA", "Delhi", "B.Tech Graduation", "31-Dec-2025", "Completed", 2, "Product", "Recruited 2 students."))

for i in range(2):
    c.execute("""
        INSERT INTO placement_record (company_name, student_name, branch, year)
        VALUES (?, ?, ?, ?)
    """, ("Terafac Technologies", f"Terafac Selectee #{i+1}", "AI-DS", 2025))

conn.commit()
conn.close()
print("Re-added Terafac (2 students) to 2025 batch.")
