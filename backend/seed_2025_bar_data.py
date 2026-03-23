from app import app, db, Company

def seed_2025_placements():
    data = {
        "Capgemini (Analyst-1)": 27,
        "Infosys": 15,
        "Internzvalley": 12,
        "Infogain": 7,
        "High Technext Eng.": 6,
        "Earth Crust": 5,
        "Genpact": 5,
        "RSM USI": 5,
        "Terafac (AIML Eng.)": 5,
        "Cognizant": 4,
        "McKinley & Rice": 3,
        "RT Camp Solutions": 3,
        "Amar Ujala": 2,
        "Capgemini (Analyst-2)": 2,
        "Cloud Techner": 2,
        "TensorGo Software": 2,
        "TVS Motors": 2,
        "Atlanta Systems": 2,
        "AVL": 1,
        "GoDaddy": 1,
        "IndiaMart": 1,
        "Publicis Sapient": 1,
        "RTDS": 1,
        "Unthinkable Solutions": 1
    }

    with app.app_context():
        # Reset existing 2025 placements first to avoid duplicates or stale data
        Company.query.filter_by(batch_year='2025').update({'students_placed': 0})
        
        for name, count in data.items():
            company = Company.query.filter_by(company_name=name, batch_year='2025').first()
            if company:
                company.students_placed = count
            else:
                # Create a placeholder entry if it doesn't exist
                new_company = Company(
                    company_name=name,
                    students_placed=count,
                    batch_year='2025',
                    status='Active',
                    company_type='Technology',
                    location='Remote',
                    package='6.11 LPA',
                    role='Associate Engineer',
                    eligibility='7.5+ CGPA',  # Required field
                    deadline='31-Dec-2025'    # Required field
                )
                db.session.add(new_company)
        
        db.session.commit()
        total_seeded = sum(data.values())
        print(f"Successfully updated 2025 placements for {len(data)} companies. Total offers: {total_seeded}")

if __name__ == "__main__":
    seed_2025_placements()
