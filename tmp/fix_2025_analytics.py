import sqlite3
import random

db_path = r'c:\Users\Shourya Upadhyay\OneDrive\Documents\ALL CODES\PROJECT\placement-cell\backend\instance\students.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Clear existing 2025 data to ensure a fresh, consistent start
c.execute("DELETE FROM company WHERE batch_year='2025'")
c.execute("DELETE FROM placement_record WHERE year=2025")

# 2. Define High-Fidelity 2025 Data with Branch breakdown and Industry Metadata
# (Company, Package, Students, Role, Type, Location, Branch Distribution)
DATA_2025_EXPANDED = [
    ("GoDaddy", "27.00 LPA", 1, "SDE Intern", "Product", "Bangalore (Remote)", {"AI-ML": 1}),
    ("RT Camp Solutions", "12.00 LPA", 3, "Software Engineer", "Service", "Pune", {"AI-DS": 1, "AI-ML": 1, "IIOT": 1}),
    ("McKinley & Rice", "10.00 LPA", 1, "Business Development Exec", "Consulting", "Noida", {"A&R": 1}),
    ("Infosys", "9.50 LPA", 5, "Specialist Programmer", "Service", "Delhi NCR", {"AI-DS": 2, "AI-ML": 1, "IIOT": 1, "A&R": 1}),
    ("TVS Motor Company", "8.00 LPA", 2, "Quality Engineer", "Automobile", "Bangalore", {"A&R": 2}),
    ("RSM USI", "7.70 LPA", 5, "Technical Risk Consultant", "Consulting", "Gurgaon", {"AI-DS": 2, "IIOT": 2, "AI-ML": 1}),
    ("Terafac Technologies", "7.00 LPA", 2, "Jr. AIML & Vision Engineer", "Product", "Noida", {"AI-ML": 1, "A&R": 1}),
    ("Internzvalley", "7.00 LPA", 11, "Business Development Exec", "EdTech", "Remote", {"AI-DS": 3, "AI-ML": 3, "IIOT": 3, "A&R": 2}),
    ("Cloud Techner", "7.00 LPA", 2, "DevOps Intern", "Service", "Delhi NCR", {"AI-DS": 1, "IIOT": 1}),
    ("Cognizant", "6.75 LPA", 3, "Genc Next Select", "Service", "Gurgaon", {"AI-DS": 1, "AI-ML": 1, "IIOT": 1}),
    ("Amar Ujala", "6.50 LPA", 1, "Data Scientist", "Media", "Noida", {"AI-DS": 1}),
    ("Infogain", "6.35 LPA", 7, "Associate Software Engineer", "Service", "Noida", {"AI-DS": 2, "AI-ML": 2, "IIOT": 2, "A&R": 1}),
    ("Genpact", "6.35 LPA", 5, "DevOps Cloud Consultant", "Service", "Gurgaon", {"AI-DS": 1, "IIOT": 2, "A&R": 2}),
    ("TensorGo Software", "6.00 LPA", 2, "Computer Vision Engineer", "Product", "Hyderabad", {"AI-ML": 2}),
    ("AVL", "6.00 LPA", 1, "Software Developer", "Automobile", "Gurgaon", {"A&R": 1}),
    ("RTDS", "6.00 LPA", 1, "Cloud Solutions Consultant", "Consulting", "Noida", {"IIOT": 1}),
    ("Capgemini", "5.75 LPA", 2, "Analyst-2", "Service", "Gurgaon", {"AI-DS": 1, "A&R": 1}),
    ("Publicis Sapient", "5.10 LPA", 1, "Quality Engineer", "Consulting", "Gurgaon", {"IIOT": 1}),
    ("Unthinkable Solutions", "5.00 LPA", 1, "Software Developer", "Product", "Gurgaon", {"AI-DS": 1}),
    ("High-Technext", "4.50 LPA", 6, "Technical Site Engineer", "Telecom", "Delhi", {"IIOT": 3, "A&R": 3}),
    ("Microsoft", "Competitive", 1, "Software Engineer", "Product", "Bangalore", {"AI-ML": 1}),
    ("Physics Wallah", "Competitive", 1, "Android developer Intern", "EdTech", "Noida", {"AI-DS": 1})
]

total_seeded_records = 0
for name, pkg, count, role, c_type, loc, branch_dist in DATA_2025_EXPANDED:
    # 1. Insert into Company Table
    c.execute("""
        INSERT INTO company (
            batch_year, company_name, role, package, location, 
            eligibility, deadline, status, company_type, students_placed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("2025", name, role, pkg, loc, "B.Tech Graduation", "31-Dec-2025", "Completed", c_type, count))
    
    # 2. Insert into PlacementRecord with Branch distribution
    for branch, b_count in branch_dist.items():
        for i in range(b_count):
            total_seeded_records += 1
            student_name = f"{name} {branch} Selectee #{i+1}"
            c.execute("""
                INSERT INTO placement_record (company_name, student_name, branch, year)
                VALUES (?, ?, ?, ?)
            """, (name, student_name, branch, 2025))

conn.commit()
print(f"✅ SUCCESS: Seeded 2025 Analytics data with {total_seeded_records} student records distributed across AI-DS, AI-ML, IIOT, and A&R.")
conn.close()
