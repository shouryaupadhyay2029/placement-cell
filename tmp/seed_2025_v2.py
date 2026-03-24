import sqlite3
import os

db_path = "backend/instance/students.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Clear existing 2025 data
print("Clearing existing 2025 data...")
c.execute("DELETE FROM company WHERE batch_year='2025'")
c.execute("DELETE FROM placement_record WHERE year=2025")

# (Company, Package, Count, Role, Type, Location)
DATA_2025 = [
    ("GoDaddy Inc.", "27.00 LPA", 1, "SDE Intern", "Product", "Gurugram"),
    ("RT Camp Solutions Pvt. Ltd.", "12.00 LPA", 3, "Software Engineer", "Product", "Pune"),
    ("McKinley & Rice Pvt. Ltd.", "10.00 LPA", 1, "Business Development Executive", "Consulting", "Noida"),
    ("Infosys Ltd.", "9.50 LPA", 5, "Specialist Programmer", "IT Services", "Noida"),
    ("TVS Motor Company", "8.00 LPA", 2, "Quality Engineer (Mechatronics)", "Manufacturing", "Chennai"),
    ("RSM USI", "7.70 LPA", 5, "Technical Risk Consultant", "Consulting", "Gurugram"),
    ("Terafac Technologies Pvt. Ltd.", "7.00 LPA", 2, "Jr. AIML & Vision Engineer", "Product", "Delhi"),
    ("Internzvalley Pvt. Ltd.", "7.00 LPA", 11, "Business Development Executive", "EdTech", "Remote"),
    ("Cloud Techner Services Pvt. Ltd.", "7.00 LPA", 2, "DevOps Intern", "IT Services", "Hyderabad"),
    ("Cognizant Corporation", "6.75 LPA", 3, "Genc Next Select", "IT Services", "Noida"),
    ("Amar Ujala Ltd.", "6.50 LPA", 1, "Data Scientist", "Media", "Noida"),
    ("Infogain Corporation India Ltd.", "6.35 LPA", 7, "Associate Software Engineer", "IT Services", "Noida"),
    ("Genpact Ltd.", "6.35 LPA", 5, "DevOps Cloud Consultant", "IT Services", "Gurugram"),
    ("McKinley & Rice Pvt. Ltd.", "6.00 LPA", 2, "Sales Intern / Accounts Manager", "Consulting", "Noida"),
    ("TensorGo Software Technologies", "6.00 LPA", 2, "Computer Vision Engineer", "Product", "Hyderabad"),
    ("AVL", "6.00 LPA", 1, "Software Developer", "Automotive", "Gurugram"),
    ("RTDS Pvt. Ltd.", "6.00 LPA", 1, "Cloud Solutions Consultant", "Consulting", "Delhi"),
    ("Terafac Technologies Pvt. Ltd.", "6.00 LPA", 2, "Jr. Robotics Engineer", "Product", "Delhi"),
    ("Earth Crust - (Lets Try) Pvt. Ltd.", "6.00 LPA", 4, "Data Analyst Intern", "Startup", "Delhi"),
    ("Earth Crust - (Lets Try) Pvt. Ltd.", "6.00 LPA", 1, "UI-UX Intern", "Startup", "Delhi"),
    ("Capgemini Technology Services India Ltd.", "5.75 LPA", 2, "Analyst-2", "IT Services", "Mumbai"),
    ("Publicis Sapient", "5.10 LPA", 1, "Quality Engineer", "Consulting", "Gurugram"),
    ("Unthinkable Solutions", "5.00 LPA", 1, "Software Developer", "IT Services", "Delhi"),
    ("High-Technext Engineering & Telecom", "4.50 LPA", 6, "Technical Site Engineer", "Telecom", "Kolkata"),
    ("Capgemini Technology Services India Ltd.", "4.25 LPA", 26, "Analyst", "IT Services", "Mumbai"),
    ("Cognizant Corporation", "4.00 LPA", 1, "Genc Select", "IT Services", "Noida"),
    ("Infosys Ltd.", "3.60 LPA", 9, "Systems Engineer", "IT Services", "Noida"),
    ("IndiaMart", "3.50 LPA", 1, "Field Sales Exec. Intern", "E-commerce", "Noida"),
    ("Physics Wallah", "Competitive", 1, "Android developer Intern", "EdTech", "Noida"),
    ("Microsoft", "Competitive", 1, "Software Engineer", "Product", "Hyderabad")
]

total_records = 0
for comp_name, pkg, count, role, comp_type, location in DATA_2025:
    clean_name = comp_name.replace(" Pvt. Ltd.", "").replace(" Ltd.", "").replace(" Corporation", "").replace(" Inc.", "").strip()
    
    print(f"Seeding {clean_name}: {count} students...")
    
    c.execute("""
        INSERT INTO company (batch_year, company_name, role, package, location, eligibility, deadline, status, students_placed, company_type, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("2025", clean_name, role, pkg, location, "B.Tech Graduation", "31-Dec-2025", "Completed", count, comp_type, f"Recruited {count} students."))
    
    # Insert individual records into PlacementRecord
    for i in range(count):
        total_records += 1
        student_name = f"{clean_name} Selectee #{i+1}"
        c.execute("""
            INSERT INTO placement_record (company_name, student_name, branch, year)
            VALUES (?, ?, ?, ?)
        """, (clean_name, student_name, "B.Tech", 2025))

conn.commit()
print(f"\n✅ SUCCESS: Seeded 30 Company entries with Types & Locations.")
conn.close()
