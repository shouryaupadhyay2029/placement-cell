import json
from app import app, db, Company

def clean_text(text):
    if not text or text == "None":
        return ""
    return str(text).strip()

def run_import():
    with open("pdf_tables.json", "r", encoding="utf-8") as f:
        pages = json.load(f)

    companies_to_add = []

    for page_info in pages:
        data = page_info["data"]
        for row in data:
            if not row or len(row) < 4:
                continue
            
            # Identify valid data rows by checking if the first column is a Sr. no (digit)
            sr_no = clean_text(row[0])
            if not sr_no.isdigit():
                continue
            
            company_name = clean_text(row[1])
            package_val = clean_text(row[2])
            role_val = clean_text(row[3])
            
            if not company_name:
                continue

            # Format package safely
            if package_val and not package_val.lower().endswith("lpa"):
                p_lower = package_val.lower()
                # Do not append LPA if it looks like a monthly stipend
                if "k" in p_lower or "per month" in p_lower or "pm" in p_lower or "stipend" in p_lower:
                    package = package_val
                else:
                    package = f"{package_val} LPA"
            else:
                package = package_val or "Not Specified"

            role = role_val or "Not Specified"

            # Create SQLAlchemy Company instance using our agreed mapping
            comp = Company(
                batch_year="2025",
                company_name=company_name,
                role=role,
                package=package,
                location="Not Specified",
                eligibility="B.Tech",
                deadline="Past/Closed",
                description="Imported from official 2025-26 Placement Report.",
                company_type="Not Specified",
                min_cgpa=None,
                allowed_branches="All eligible",
                backlog_criteria="Not Specified",
                selection_process="Not Specified",
                application_link="",
                status="Closed"
            )
            companies_to_add.append(comp)

    with app.app_context():
        # Prevent duplicates by checking name and role
        added_count = 0
        for comp in companies_to_add:
            exists = Company.query.filter_by(
                batch_year="2025", 
                company_name=comp.company_name, 
                role=comp.role
            ).first()
            if not exists:
                db.session.add(comp)
                added_count += 1
        
        db.session.commit()
        print(f"Successfully imported {added_count} new companies into the database!")

if __name__ == "__main__":
    run_import()
