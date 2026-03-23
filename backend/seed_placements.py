"""
Seed script: Insert 2024-2025 USAR placement records (scraped from usar-placement-track.vercel.app)
into the local PlacePro database.

Run this script once from the `backend/` directory:
    python seed_placements.py
"""

import sys
import os

# Make sure app context is available
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, Company

# ---------------------------------------------------------------------------
# Scraped placement records from usar-placement-track.vercel.app
# Fields: company_name, package, students_placed, date, batch_year
# We map date → batch_year:  2024 → "2024",  2025 → "2025"
# ---------------------------------------------------------------------------
PLACEMENT_DATA = [
    # 2024 records
    {"company_name": "AVL",                           "role": "Software Engineer", "package": "6.00",  "students_placed": 1,  "location": "India", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    {"company_name": "Infosys",                       "role": "Systems Engineer",  "package": "3.50",  "students_placed": 16, "location": "Bengaluru", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Lakshmikumaran Sridharan",      "role": "Associate",         "package": "5.40",  "students_placed": 1,  "location": "Delhi", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Legal"},
    {"company_name": "Mckinley Rice",                 "role": "Software Engineer", "package": "6.00",  "students_placed": 2,  "location": "Noida", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Publicis Sapient",              "role": "Analyst",           "package": "5.10",  "students_placed": 1,  "location": "Gurugram", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Consulting"},
    {"company_name": "RSM USI",                       "role": "Consultant",        "package": "7.70",  "students_placed": 5,  "location": "Delhi", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Consulting"},
    {"company_name": "RTDS",                          "role": "Engineer",          "package": "6.00",  "students_placed": 2,  "location": "India", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    {"company_name": "TensorGo Software",             "role": "ML Engineer",       "package": "6.00",  "students_placed": 2,  "location": "India", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    {"company_name": "Unthinkable Solutions",         "role": "Associate",         "package": "5.00",  "students_placed": 1,  "location": "Delhi", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Mckinley Rice (Senior)",        "role": "Senior Engineer",   "package": "10.00", "students_placed": 1,  "location": "Noida", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "RT Camp",                       "role": "Software Engineer", "package": "12.00", "students_placed": 3,  "location": "Remote", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    {"company_name": "Infogain",                      "role": "Software Engineer", "package": "6.35",  "students_placed": 7,  "location": "Noida", "deadline": "11/08/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Genpact",                       "role": "Process Associate", "package": "6.30",  "students_placed": 5,  "location": "Gurugram", "deadline": "11/08/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Infosys SP",                    "role": "Specialist Program","package": "9.50",  "students_placed": 5,  "location": "Bengaluru", "deadline": "10/24/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Capgemini",                     "role": "Analyst",           "package": "4.25",  "students_placed": 28, "location": "Mumbai", "deadline": "12/03/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Capgemini (Senior)",            "role": "Senior Analyst",    "package": "5.75",  "students_placed": 3,  "location": "Mumbai", "deadline": "12/03/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "IT Services"},
    {"company_name": "Terafac",                       "role": "Engineer",          "package": "7.00",  "students_placed": 3,  "location": "Delhi", "deadline": "12/03/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    {"company_name": "Terafac (Junior)",              "role": "Junior Engineer",   "package": "6.00",  "students_placed": 2,  "location": "Delhi", "deadline": "12/03/2024", "eligibility": "B.Tech", "batch_year": "2024", "company_type": "Product"},
    # 2025 records
    {"company_name": "Cognizant",                     "role": "Programmer Analyst","package": "6.75",  "students_placed": 3,  "location": "Chennai", "deadline": "04/10/2025", "eligibility": "B.Tech", "batch_year": "2025", "company_type": "IT Services"},
    {"company_name": "Cognizant (Junior)",            "role": "Junior Analyst",    "package": "4.00",  "students_placed": 1,  "location": "Chennai", "deadline": "04/10/2025", "eligibility": "B.Tech", "batch_year": "2025", "company_type": "IT Services"},
    {"company_name": "TVS",                           "role": "Engineer",          "package": "8.00",  "students_placed": 2,  "location": "Chennai", "deadline": "05/12/2025", "eligibility": "B.Tech", "batch_year": "2025", "company_type": "Manufacturing"},
    {"company_name": "Amar Ujala",                    "role": "Software Engineer", "package": "6.50",  "students_placed": 1,  "location": "Noida", "deadline": "05/12/2025", "eligibility": "B.Tech", "batch_year": "2025", "company_type": "Media"},
    {"company_name": "Earth Crust (Let's Try)",       "role": "Associate",         "package": "6.00",  "students_placed": 5,  "location": "Delhi", "deadline": "05/12/2025", "eligibility": "B.Tech", "batch_year": "2025", "company_type": "Startup"},
]

def seed():
    with app.app_context():
        # Ensure DB tables exist
        db.create_all()

        inserted = 0
        skipped = 0

        for record in PLACEMENT_DATA:
            # Check if record already exists (by company_name + deadline)
            existing = Company.query.filter_by(
                company_name=record["company_name"],
                deadline=record["deadline"]
            ).first()

            if existing:
                print(f"  [SKIP] Already exists: {record['company_name']} ({record['deadline']})")
                skipped += 1
                continue

            pkg_str = f"{record['package']} LPA"
            company = Company(
                batch_year   = record["batch_year"],
                company_name = record["company_name"],
                role         = record["role"],
                package      = pkg_str,
                location     = record["location"],
                eligibility  = record["eligibility"],
                deadline     = record["deadline"],
                description  = f"Recruited {record['students_placed']} student(s) from USAR GGSIPU batch {record['batch_year']}.",
                company_type = record["company_type"],
                status       = "Completed",
                allowed_branches = "All",
                students_placed  = record["students_placed"],
            )
            db.session.add(company)
            inserted += 1
            print(f"  [ADD]  {record['company_name']} — {record['students_placed']} student(s) @ {pkg_str}")

        db.session.commit()
        print(f"\n✅  Done! Inserted {inserted} records, skipped {skipped} existing records.")

if __name__ == "__main__":
    seed()
