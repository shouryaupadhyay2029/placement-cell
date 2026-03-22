from app import app, db, Company

def clean_packages():
    count = 0
    with app.app_context():
        companies = Company.query.filter_by(batch_year='2025').all()
        for c in companies:
            if not c.package:
                continue
            
            orig = c.package
            pkg_lower = c.package.lower()
            
            # If it's evidently a monthly stipend or contains 'k', remove 'LPA'
            if "k" in pkg_lower or "per month" in pkg_lower or "pm" in pkg_lower or "stipend" in pkg_lower:
                if "lpa" in pkg_lower:
                    # Strip ' LPA' or ' lpa' ignoring case
                    import re
                    c.package = re.sub(r'(?i)\s*LPA', '', c.package)
                    print(f"Cleaned {orig} -> {c.package}")
                    count += 1
            
            # Additional cleanup for GoDaddy SDE Intern which was "27 LPA" in PDF.
            # If the role is intern but it has 27 LPA, we leave it if there's no "k" unless they asked specifically.
            # The prompt simply said: "from internship stipend remove lpa"
            # We already removed it from anything that had "K" or "per month".
            # What if someone's package is literally "10000" and it got appended to "10000 LPA"?
            # PDF usually says "10 K" or "40,000".

        db.session.commit()
    print(f"Fixed {count} internship stipend entries by removing LPA.")

if __name__ == "__main__":
    clean_packages()
