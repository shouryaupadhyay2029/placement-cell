import pdfplumber
import os
from app import app, db, PlacementRecord

def extract_and_seed(pdf_path, company_name, year):
    with open("seeding_log_file.txt", "a", encoding="utf-8") as log_f:
        log_f.write(f"\nProcessing {pdf_path}...\n")
        if not os.path.exists(pdf_path):
            log_f.write(f"PDF not found at {pdf_path}\n")
            print(f"PDF not found at {pdf_path}")
            return

        print(f"Extracting data from {pdf_path} for {company_name}...")
    
    placements = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Identify data rows: first column should start with a digit (e.g., "1", "1.", "1. 1")
                        s_no = str(row[0] or "").strip()
                        if len(row) >= 5 and s_no and s_no[0].isdigit():
                            try:
                                # Debug: print successfully identified row
                                print(f"  Captured: {row[:3]}")
                                student_name = row[2].replace('\n', ' ').strip()
                                degree_info = row[4].replace('\n', ' ').strip()
                                branch = degree_info.replace("B.Tech", "").replace("(", "").replace(")", "").strip()
                                
                                placements.append({
                                    "company_name": company_name,
                                    "student_name": student_name,
                                    "branch": branch,
                                    "year": year
                                })
                            except Exception as e:
                                print(f"Error parsing row {row}: {e}")

        if not placements:
            with open("seeding_log_file.txt", "a", encoding="utf-8") as log_f:
                log_f.write(f"No records found in {pdf_path}\n")
            print(f"No placement records found in {pdf_path}.")
            return

        print(f"Found {len(placements)} records for {company_name}. Seeding database...")
        
        with app.app_context():
            for p_data in placements:
                # Check if student already exists for this company and year
                existing = PlacementRecord.query.filter_by(
                    company_name=p_data["company_name"],
                    student_name=p_data["student_name"],
                    year=p_data["year"]
                ).first()
                
                if not existing:
                    record = PlacementRecord(
                        company_name=p_data["company_name"],
                        student_name=p_data["student_name"],
                        branch=p_data["branch"],
                        year=p_data["year"]
                    )
                    db.session.add(record)
            
            db.session.commit()
            print(f"Database seeded successfully for {company_name}!")
            with open("seeding_log_file.txt", "a", encoding="utf-8") as log_f:
                log_f.write(f"Success: {len(placements)} records added for {company_name}\n")
    except Exception as e:
        print(f"FATAL ERROR for {pdf_path}: {e}")
        with open("seeding_log_file.txt", "a", encoding="utf-8") as log_f:
            log_f.write(f"FATAL ERROR: {e}\n")

if __name__ == "__main__":
    # PDF 1
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students1.pdf",
        "Genpact",
        2024
    )
    # PDF 2
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students2.pdf",
        "McKinley Rice",
        2024
    )
    # PDF 4
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students4.pdf",
        "Infosys",
        2024
    )
    # PDF 3
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students3.pdf",
        "Infosys",
        2024
    )
    # PDF 5
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students5.pdf",
        "RTDS",
        2024
    )
    # PDF 6
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students6.pdf",
        "RSM USI",
        2024
    )
    # PDF 7
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students7.pdf",
        "Microsoft",
        2024
    )
    # PDF 8
    extract_and_seed(
        r"C:\Users\Shourya Upadhyay\OneDrive\Documents\students8.pdf",
        "TensorGo Software",
        2024
    )
