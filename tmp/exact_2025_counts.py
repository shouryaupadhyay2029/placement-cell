import sqlite3

db_path = r'c:\Users\Shourya Upadhyay\OneDrive\Documents\ALL CODES\PROJECT\placement-cell\backend\instance\students.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Clear existing 2025 data as per the user's new source of truth
c.execute("DELETE FROM company WHERE batch_year='2025'")
c.execute("DELETE FROM placement_record WHERE year=2025")

# 2. Define companies with counts such that the total equals 110
# (CompName, Package, Count, Role, Type, Loc)
COMPANIES_2025 = [
    ("Capgemini", "5.75 LPA", 22, "Analyst", "Service", "Gurgaon"),
    ("Infosys", "9.50 LPA", 15, "Specialist Programmer", "Service", "Delhi NCR"),
    ("Internzvalley", "7.00 LPA", 12, "Business Development Exec", "EdTech", "Remote"),
    ("Infogain", "6.35 LPA", 7, "Associate Software Engineer", "Service", "Noida"),
    ("High-Technext", "4.50 LPA", 6, "Technical Site Engineer", "Telecom", "Delhi"),
    ("Earth Crust", "6.00 LPA", 5, "Data Analyst Intern", "Product", "Noida"),
    ("Genpact", "6.35 LPA", 5, "DevOps Cloud Consultant", "Service", "Gurgaon"),
    ("RSM USI", "7.70 LPA", 5, "Technical Risk Consultant", "Consulting", "Gurgaon"),
    ("Terafac Technologies", "7.00 LPA", 5, "Jr. AIML & Vision Engineer", "Product", "Noida"),
    ("Cognizant", "6.75 LPA", 4, "Genc Next Select", "Service", "Gurgaon"),
    ("McKinley & Rice", "10.00 LPA", 3, "Business Development Exec", "Consulting", "Noida"),
    ("RT Camp Solutions", "12.00 LPA", 3, "Software Engineer", "Service", "Pune"),
    ("Amar Ujala", "6.50 LPA", 2, "Data Scientist", "Media", "Noida"),
    ("Cloud Techner", "7.00 LPA", 2, "DevOps Intern", "Service", "Delhi NCR"),
    ("TensorGo Software", "6.00 LPA", 2, "Computer Vision Engineer", "Product", "Hyderabad"),
    ("TVS Motors", "8.00 LPA", 2, "Quality Engineer", "Automobile", "Bangalore"),
    ("Atlanta Systems", "6.00 LPA", 2, "Embedded Testing Engineer", "Product", "New Delhi"),
    ("AVL", "6.00 LPA", 1, "Software Developer", "Automobile", "Gurgaon"),
    ("GoDaddy", "27.00 LPA", 1, "SDE Intern", "Product", "Bangalore"),
    ("IndiaMart", "3.50 LPA", 1, "Field Sales Exec. Intern", "Service", "Noida"),
    ("Publicis Sapient", "5.10 LPA", 1, "Quality Engineer", "Consulting", "Gurgaon"),
    ("RTDS", "6.00 LPA", 1, "Cloud Solutions Consultant", "Consulting", "Noida"),
    ("Unthinkable Solutions", "5.00 LPA", 1, "Software Developer", "Product", "Gurgaon"),
    ("Microsoft", "Competitive", 1, "Software Engineer", "Product", "Bangalore"),
    ("The Economic Times", "1.2 LPA", 1, "Delegate Acquisition Intern", "Media", "New Delhi")
]

total_count_calc = sum(c[2] for c in COMPANIES_2025)
print(f"Verified total placements: {total_count_calc}") # 110

# Target Branch counts for 2025 (USAR)
target_branches = {
    "AI-DS": 36,
    "AI-ML": 28,
    "IIOT": 31,
    "A&R": 15
}

# Create a flat pool of branches to assign sequentially to students
branch_pool = []
for b, count in target_branches.items():
    branch_pool.extend([b] * count)

# 3. Insert and Assign
current_branch_idx = 0
for name, pkg, count, role, c_type, loc in COMPANIES_2025:
    # Company Entry
    c.execute("""
        INSERT INTO company (
            batch_year, company_name, role, package, location, 
            eligibility, deadline, status, company_type, students_placed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("2025", name, role, pkg, loc, "B.Tech Graduation", "31-Dec-2025", "Completed", c_type, count))
    
    # Students for this company
    for j in range(count):
        branch = branch_pool[current_branch_idx]
        # Make the student name slightly cleaner
        student_name = f"2025-U{current_branch_idx+1:03d} - {name}"
        c.execute("""
            INSERT INTO placement_record (company_name, student_name, branch, year)
            VALUES (?, ?, ?, ?)
        """, (name, student_name, branch, 2025))
        current_branch_idx += 1

conn.commit()
print(f"✅ SUCCESS: Seeded exact figures: {total_count_calc} Total (AI-DS: 36, AI-ML: 28, IIOT: 31, A&R: 15)")
conn.close()
