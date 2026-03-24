import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Clear existing 2025 data
print("Clearing existing 2025 data...")
c.execute("DELETE FROM company WHERE batch_year='2025'")
c.execute("DELETE FROM placement_record WHERE year=2025")

DATA_2025 = [
    # (Company Name, Package, Students Count, Role)
    ("GoDaddy Inc.", "27.00 LPA", 1, "SDE Intern"),
    ("RT Camp Solutions Pvt. Ltd.", "12.00 LPA", 3, "Software Engineer"),
    ("McKinley & Rice Pvt. Ltd.", "10.00 LPA", 1, "Business Development Executive"),
    ("Infosys Ltd.", "9.50 LPA", 5, "Specialist Programmer"),
    ("TVS Motor Company", "8.00 LPA", 2, "Quality Engineer (Mechatronics)"),
    ("RSM USI", "7.70 LPA", 5, "Technical Risk Consultant"),
    ("Terafac Technologies Pvt. Ltd.", "7.00 LPA", 2, "Jr. AIML & Vision Engineer"),
    ("Internzvalley Pvt. Ltd.", "7.00 LPA", 11, "Business Development Executive"),
    ("Cloud Techner Services Pvt. Ltd.", "7.00 LPA", 2, "DevOps Intern"),
    ("Cognizant Corporation", "6.75 LPA", 3, "Genc Next Select"),
    ("Amar Ujala Ltd.", "6.50 LPA", 1, "Data Scientist"),
    ("Infogain Corporation India Ltd.", "6.35 LPA", 7, "Associate Software Engineer"),
    ("Genpact Ltd.", "6.35 LPA", 5, "DevOps Cloud Consultant"),
    ("McKinley & Rice Pvt. Ltd.", "6.00 LPA", 2, "Sales Intern / Accounts Manager"),
    ("TensorGo Software Technologies", "6.00 LPA", 2, "Computer Vision Engineer"),
    ("AVL", "6.00 LPA", 1, "Software Developer"),
    ("RTDS Pvt. Ltd.", "6.00 LPA", 1, "Cloud Solutions Consultant"),
    ("Terafac Technologies Pvt. Ltd.", "6.00 LPA", 2, "Jr. Robotics Engineer"),
    ("Earth Crust - (Lets Try) Pvt. Ltd.", "6.00 LPA", 4, "Data Analyst Intern"),
    ("Earth Crust - (Lets Try) Pvt. Ltd.", "6.00 LPA", 1, "UI-UX Intern"),
    ("Capgemini Technology Services India Ltd.", "5.75 LPA", 2, "Analyst-2"),
    ("Publicis Sapient", "5.10 LPA", 1, "Quality Engineer"),
    ("Unthinkable Solutions", "5.00 LPA", 1, "Software Developer"),
    ("High-Technext Engineering & Telecom", "4.50 LPA", 6, "Technical Site Engineer"),
    ("Capgemini Technology Services India Ltd.", "4.25 LPA", 26, "Analyst"),
    ("Cognizant Corporation", "4.00 LPA", 1, "Genc Select"),
    ("Infosys Ltd.", "3.60 LPA", 9, "Systems Engineer"),
    ("IndiaMart", "3.50 LPA", 1, "Field Sales Exec. Intern"),
    ("Physics Wallah", "Competitive", 1, "Android developer Intern"),
    ("Microsoft", "Competitive", 1, "Software Engineer")
]

total_records = 0
for comp_name, pkg, count, role in DATA_2025:
    # Insert Into Company Table (for job list)
    # We clean up the name a bit for better UI grouping
    clean_name = comp_name.replace(" Pvt. Ltd.", "").replace(" Ltd.", "").replace(" Corporation", "").replace(" Inc.", "").strip()
    
    print(f"Seeding {clean_name}: {count} students...")
    
    c.execute("""
        INSERT INTO company (batch_year, company_name, role, package, location, eligibility, deadline, status, students_placed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("2025", clean_name, role, pkg, "India", "B.Tech Graduation", "31-Dec-2025", "Completed", count))
    
    # Insert individual records into PlacementRecord (for Student Gallery & Analytics Consistency)
    for i in range(count):
        total_records += 1
        student_name = f"{clean_name} Selectee #{i+1}"
        c.execute("""
            INSERT INTO placement_record (company_name, student_name, branch, year)
            VALUES (?, ?, ?, ?)
        """, (clean_name, student_name, "B.Tech", 2025))

conn.commit()
print(f"\n✅ SUCCESS: Seeded 30 Company entries and {total_records} Student Records for 2025 Batch.")
conn.close()
