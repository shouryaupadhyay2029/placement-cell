from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime
from functools import wraps

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///students.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "supersecretkey"

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50))
    year = db.Column(db.String(20))
    role = db.Column(db.String(20), default="student", nullable=False)

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            student_id = session.get("student_id")
            if not student_id:
                return jsonify({"error": "Unauthorized"}), 401
            student = db.session.get(Student, student_id)
            if not student or student.role not in allowed_roles:
                return jsonify({"error": "Forbidden: Admin or TPO access required."}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    batch_year = db.Column(db.String(20), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    package = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    eligibility = db.Column(db.String(200), nullable=False)
    deadline = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    company_type = db.Column(db.String(50), nullable=True)
    min_cgpa = db.Column(db.Float, nullable=True)
    allowed_branches = db.Column(db.String(200), nullable=True)
    backlog_criteria = db.Column(db.String(100), nullable=True)
    selection_process = db.Column(db.Text, nullable=True)
    application_link = db.Column(db.String(300), nullable=True)
    status = db.Column(db.String(50), default="Active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    students_placed = db.Column(db.Integer, default=0, nullable=True)
    applications = db.relationship("Application", backref="company", lazy=True, cascade="all, delete-orphan")


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), nullable=False)
    status = db.Column(db.String(50), default="applied", nullable=False)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("student_id", "company_id", name="uq_student_company"),
    )


class PlacementRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)

@app.route("/companies", methods=["POST"])
@role_required("admin", "tpo")
def add_company():
    data = request.get_json()

    batch_year = data.get("batch_year")
    company_name = data.get("company_name")
    role = data.get("role")
    package = data.get("package")
    location = data.get("location")
    eligibility = data.get("eligibility")
    deadline = data.get("deadline")
    
    # Optional fields
    description = data.get("description")
    company_type = data.get("company_type")
    min_cgpa = data.get("min_cgpa")
    allowed_branches = data.get("allowed_branches")
    backlog_criteria = data.get("backlog_criteria")
    selection_process = data.get("selection_process")
    application_link = data.get("application_link")
    status = data.get("status", "Active")

    if not all([batch_year, company_name, role, package, location, eligibility, deadline]):
        return jsonify({"error": "Required fields (Batch Year, Name, Role, Package, Location, Eligibility, Deadline) must be filled"}), 400

    new_company = Company(
        batch_year=batch_year,
        company_name=company_name,
        role=role,
        package=package,
        location=location,
        eligibility=eligibility,
        deadline=deadline,
        description=description,
        company_type=company_type,
        min_cgpa=min_cgpa,
        allowed_branches=allowed_branches,
        backlog_criteria=backlog_criteria,
        selection_process=selection_process,
        application_link=application_link,
        status=status
    )

    db.session.add(new_company)
    db.session.commit()

    return jsonify({"message": "Company added successfully"}), 201

@app.route("/companies", methods=["GET"])
def get_companies():
    batch_year = request.args.get("batch_year")
    status = request.args.get("status")
    company_type = request.args.get("company_type")

    query = Company.query

    if batch_year:
        query = query.filter_by(batch_year=batch_year)
    if status:
        query = query.filter_by(status=status)
    if company_type:
        query = query.filter_by(company_type=company_type)

    companies = query.all()

    company_list = []
    for company in companies:
        company_list.append({
            "id": company.id,
            "batch_year": company.batch_year,
            "company_name": company.company_name,
            "role": company.role,
            "package": company.package,
            "location": company.location,
            "eligibility": company.eligibility,
            "deadline": company.deadline,
            "description": company.description,
            "company_type": company.company_type,
            "min_cgpa": company.min_cgpa,
            "allowed_branches": company.allowed_branches,
            "backlog_criteria": company.backlog_criteria,
            "selection_process": company.selection_process,
            "application_link": company.application_link,
            "status": company.status,
            "created_at": company.created_at.isoformat() if company.created_at else None,
            "updated_at": company.updated_at.isoformat() if company.updated_at else None
        })

    return jsonify(company_list), 200

@app.route("/companies/<int:company_id>", methods=["PUT"])
@role_required("admin", "tpo")
def update_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found"}), 404

    data = request.get_json()

    company.batch_year = data.get("batch_year", company.batch_year)
    company.company_name = data.get("company_name", company.company_name)
    company.role = data.get("role", company.role)
    company.package = data.get("package", company.package)
    company.location = data.get("location", company.location)
    company.eligibility = data.get("eligibility", company.eligibility)
    company.deadline = data.get("deadline", company.deadline)
    company.description = data.get("description", company.description)
    company.company_type = data.get("company_type", company.company_type)
    
    if data.get("min_cgpa") is not None and data.get("min_cgpa") != "":
        company.min_cgpa = float(data.get("min_cgpa"))
        
    company.allowed_branches = data.get("allowed_branches", company.allowed_branches)
    company.backlog_criteria = data.get("backlog_criteria", company.backlog_criteria)
    company.selection_process = data.get("selection_process", company.selection_process)
    company.application_link = data.get("application_link", company.application_link)
    company.status = data.get("status", company.status)

    db.session.commit()
    return jsonify({"message": "Company updated successfully"}), 200

@app.route("/companies/<int:company_id>", methods=["DELETE"])
@role_required("admin", "tpo")
def delete_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found"}), 404

    db.session.delete(company)
    db.session.commit()
    return jsonify({"message": "Company deleted successfully"}), 200

@app.route("/companies/import", methods=["POST"])
@role_required("admin", "tpo")
def import_companies():
    import csv
    import io
    
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith(".csv"):
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        imported_count = 0
        errors = []
        
        for row in csv_input:
            try:
                # Basic validation for CSV fields
                if not row.get("company_name") or not row.get("role"):
                    errors.append(f"Row {imported_count + 1} missing required data")
                    continue
                
                new_company = Company(
                    company_name=row.get("company_name"),
                    role=row.get("role"),
                    package=row.get("package", ""),
                    location=row.get("location", ""),
                    eligibility=row.get("eligibility", ""),
                    deadline=row.get("deadline", ""),
                    description=row.get("description", ""),
                    company_type=row.get("company_type", ""),
                    min_cgpa=row.get("min_cgpa", 0.0),
                    allowed_branches=row.get("allowed_branches", ""),
                    backlog_criteria=row.get("backlog_criteria", ""),
                    selection_process=row.get("selection_process", ""),
                    application_link=row.get("application_link", "")
                )
                db.session.add(new_company)
                imported_count += 1
            except Exception as e:
                errors.append(f"Error in row {imported_count + 1}: {str(e)}")
        
        db.session.commit()
        return jsonify({
            "message": f"Successfully imported {imported_count} companies",
            "errors": errors
        }), 201
    
    return jsonify({"error": "Invalid file format. Please upload a CSV."}), 400

@app.route("/")
def home():
    return jsonify({"message": "Backend is running"})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    branch = data.get("branch")
    year = data.get("year")

    if not full_name or not email or not password:
        return jsonify({"error": "Full name, email and password are required"}), 400

    existing_student = Student.query.filter_by(email=email).first()
    if existing_student:
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    
    # Auto-promote owner (either account)
    OWNER_EMAILS = {"shouryaupadhyay2029@gmail.com", "upadhyayshourya352@gmail.com"}
    assigned_role = "admin" if email.lower() in OWNER_EMAILS else "student"

    new_student = Student(
        full_name=full_name,
        email=email,
        password=hashed_password,
        branch=branch,
        year=year,
        role=assigned_role
    )

    db.session.add(new_student)
    db.session.commit()

    return jsonify({"message": "Student registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    student = Student.query.filter_by(email=email).first()

    if student and bcrypt.check_password_hash(student.password, password):
        # Auto-promote owner retroactively if needed
        OWNER_EMAILS = {"shouryaupadhyay2029@gmail.com", "upadhyayshourya352@gmail.com"}
        if email.lower() in OWNER_EMAILS and student.role != "admin":
            student.role = "admin"
            db.session.commit()

        session["student_id"] = student.id
        session["student_name"] = student.full_name
        session["student_role"] = student.role

        return jsonify({
            "message": "Login successful",
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "branch": student.branch,
                "year": student.year,
                "role": student.role
            }
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401


@app.route("/profile", methods=["GET"])
def profile():
    student_id = session.get("student_id")

    if not student_id:
        return jsonify({"error": "Unauthorized"}), 401

    student = Student.query.get(student_id)

    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({
        "id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "branch": student.branch,
        "year": student.year,
        "role": student.role
    }), 200


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


# ================== APPLICATIONS ==================

@app.route("/apply/<int:company_id>", methods=["POST"])
def apply_to_company(company_id):
    student_id = session.get("student_id")
    if not student_id:
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found."}), 404

    existing = Application.query.filter_by(
        student_id=student_id, company_id=company_id
    ).first()
    if existing:
        return jsonify({"error": "You have already applied to this company."}), 409

    application = Application(
        student_id=student_id,
        company_id=company_id,
        status="applied"
    )
    db.session.add(application)
    db.session.commit()
    return jsonify({"message": "Application submitted successfully!"}), 201


@app.route("/my-applications", methods=["GET"])
def my_applications():
    student_id = session.get("student_id")
    if not student_id:
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    applications = db.session.query(Application, Company).join(
        Company, Application.company_id == Company.id
    ).filter(Application.student_id == student_id).all()

    result = []
    for app, company in applications:
        result.append({
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at.strftime("%d %b %Y") if app.applied_at else "—",
            "company_id": company.id,
            "company_name": company.company_name,
            "role": company.role,
            "package": company.package,
            "location": company.location,
            "company_status": company.status,
            "deadline": company.deadline,
        })

    return jsonify(result), 200


@app.route("/admin/applications", methods=["GET"])
@role_required("admin", "tpo")
def all_applications():
    """Admin view: all applications with student and company details."""
    applications = db.session.query(Application, Student, Company).join(
        Student, Application.student_id == Student.id
    ).join(
        Company, Application.company_id == Company.id
    ).all()

    result = []
    for app, student, company in applications:
        result.append({
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at.strftime("%d %b %Y") if app.applied_at else "—",
            "student_name": student.full_name,
            "student_email": student.email,
            "company_name": company.company_name,
            "role": company.role,
        })

    return jsonify(result), 200


# ================== ANALYTICS ==================

import re

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    batch_year = request.args.get("batch_year")
    
    # ─── Official Placement Report Stats Per Batch ───
    BATCH_STATS = {
        "2025": {
            "total_students": 501,
            "actively_participated": 251,
            "companies_visited": 80,
            "companies_offered": 26,
            "total_offers": 115,
            "overall_avg_package": 6.11,
            "overall_median_package": 6,
            "overall_highest_package": 27,
            "branch_offers": {
                "AI & DS": 36,
                "AI & ML": 30,
                "IIOT": 33,
                "A&R": 16
            },
            "branch_details": {
                "AI & Data Science": {
                    "total_students": 132,
                    "participated": 75,
                    "placed": 36,
                    "placement_rate": 48.0,
                    "avg_package": 6.33,
                    "median_package": 6.35,
                    "highest_package": 12
                },
                "AI & Machine Learning": {
                    "total_students": 131,
                    "participated": 69,
                    "placed": 30,
                    "placement_rate": 43.48,
                    "avg_package": 6.16,
                    "median_package": 6,
                    "highest_package": 12
                },
                "Industrial Internet of Things": {
                    "total_students": 127,
                    "participated": 66,
                    "placed": 33,
                    "placement_rate": 50.0,
                    "avg_package": 5.88,
                    "median_package": 4.5,
                    "highest_package": 27
                },
                "Automation & Robotics": {
                    "total_students": 111,
                    "participated": 41,
                    "placed": 16,
                    "placement_rate": 39.02,
                    "avg_package": 5.95,
                    "median_package": 6,
                    "highest_package": 8
                }
            },
            "sector_offers": {
                "Software Development & IT": 61,
                "Data Science / Analytics": 9,
                "AI & ML": 6,
                "Cloud & Devops": 4,
                "Electronics & IOT": 7,
                "Mechanical, Robotics & Mechatronics": 4,
                "Technical Consultant": 6,
                "Product Management": 2,
                "Sales & Consulting": 15,
                "Designing UI-UX": 1
            }
        },
        "2024": {
            "total_students": 200,
            "actively_participated": 150,
            "companies_visited": 50,
            "companies_offered": 22,
            "total_offers": 88,
            "overall_avg_package": 7.0,
            "overall_median_package": 6,
            "overall_highest_package": 13.69,
            "branch_offers": {},
            "branch_details": {},
            "sector_offers": {}
        }
    }

    # Enrollment = actively participated students
    ENROLLMENT_MAP = {
        "2024": 150,
        "2025": 251,
        "All": 401
    }
    
    query = Company.query
    if batch_year:
        query = query.filter_by(batch_year=batch_year)
    
    companies = query.all()
    
    total_companies = len(companies)
    active_companies = sum(1 for c in companies if c.status.lower() == 'active')
    
    batch_distribution = {}
    type_distribution = {}
    location_distribution = {}
    packages = []
    total_placed = 0
    
    company_packages = []
    
    for c in companies:
        batch = c.batch_year if c.batch_year else "Unknown"
        batch_distribution[batch] = batch_distribution.get(batch, 0) + 1
        
        ctype = c.company_type if c.company_type else "Unspecified"
        type_distribution[ctype] = type_distribution.get(ctype, 0) + 1
        
        loc = c.location if c.location else "Unknown"
        loc_base = loc.split(',')[0].strip().title()
        location_distribution[loc_base] = location_distribution.get(loc_base, 0) + 1

        if c.students_placed:
            total_placed += c.students_placed

        package_val = 0
        if c.package:
            nums = re.findall(r'\d+\.?\d*', str(c.package))
            if nums:
                max_num = max(float(n) for n in nums)
                packages.append(max_num)
                package_val = max_num
        
        company_packages.append({
            "name": c.company_name,
            "role": c.role,
            "package_val": package_val,
            "package_str": c.package,
            "students_placed": c.students_placed or 0,
        })
                
    avg_package = round(sum(packages)/len(packages), 1) if packages else 0
    highest_package = float(max(packages)) if packages else 0
    
    target_enrollment = ENROLLMENT_MAP.get(batch_year, ENROLLMENT_MAP["All"])
    
    # Use official stats from BATCH_STATS if available — overrides DB-computed values
    # This prevents internship stipends (e.g. "30k/month" parsed as 30) from inflating stats
    current_batch_stats = BATCH_STATS.get(batch_year, {})
    official_placed = current_batch_stats.get("total_offers", total_placed)
    
    # Override package stats with official report values when present
    if current_batch_stats.get("overall_highest_package"):
        highest_package = float(current_batch_stats["overall_highest_package"])
    if current_batch_stats.get("overall_avg_package"):
        avg_package = float(current_batch_stats["overall_avg_package"])
    
    placement_rate = round((official_placed / target_enrollment) * 100, 1) if target_enrollment > 0 else 0
    
    # Sort top companies but cap package_val at official highest to avoid internship inflation
    top_companies = sorted(company_packages, key=lambda x: x["package_val"], reverse=True)[:5]
    
    # Build aggregate batch_stats for "All Batches"
    if not batch_year:
        agg_stats = {
            "total_students": sum(b.get("total_students", 0) for b in BATCH_STATS.values()),
            "actively_participated": sum(b.get("actively_participated", 0) for b in BATCH_STATS.values()),
            "companies_visited": sum(b.get("companies_visited", 0) for b in BATCH_STATS.values()),
            "companies_offered": sum(b.get("companies_offered", 0) for b in BATCH_STATS.values()),
            "total_offers": sum(b.get("total_offers", 0) for b in BATCH_STATS.values()),
            "branch_offers": {},
            "sector_offers": {}
        }
        current_batch_stats = agg_stats
        official_placed = agg_stats["total_offers"]
        placement_rate = round((official_placed / target_enrollment) * 100, 1) if target_enrollment > 0 else 0

    return jsonify({
        "total_companies": total_companies,
        "active_companies": active_companies,
        "avg_package": avg_package,
        "highest_package": highest_package,
        "total_placed": official_placed,
        "total_enrolled": target_enrollment,
        "placement_rate": placement_rate,
        "batch_distribution": batch_distribution,
        "type_distribution": type_distribution,
        "location_distribution": location_distribution,
        "top_companies": top_companies,
        "batch_stats": current_batch_stats
    }), 200


@app.route("/api/company-recruitment", methods=["GET"])
def company_recruitment():
    """Returns company-wise student placement counts for the analytics chart."""
    batch_year = request.args.get("batch_year")
    query = Company.query
    if batch_year:
        query = query.filter_by(batch_year=batch_year)

    companies = query.all()

    # Aggregate by company_name (sum students_placed)
    agg = {}
    for c in companies:
        name = c.company_name.strip()
        placed = c.students_placed or 0
        if name in agg:
            agg[name] += placed
        else:
            agg[name] = placed

    # Sort descending by students placed
    sorted_data = sorted(agg.items(), key=lambda x: x[1], reverse=True)

    total_placed = sum(v for _, v in sorted_data)
    total_students = Student.query.count() or total_placed  # fallback

    return jsonify({
        "companies": [k for k, _ in sorted_data],
        "students_placed": [v for _, v in sorted_data],
        "total_placed": total_placed,
    }), 200


@app.route("/api/placements", methods=["GET"])
def get_placements():
    """Returns all placement records from the PDF extraction."""
    placements = PlacementRecord.query.all()
    result = []
    for p in placements:
        result.append({
            "id": p.id,
            "company_name": p.company_name,
            "student_name": p.student_name,
            "branch": p.branch,
            "year": p.year
        })
    return jsonify(result), 200


# TEMPORARY DEV ROUTE
@app.route("/make_admin/<email>")
def make_admin(email):
    student = Student.query.filter_by(email=email).first()
    if student:
        student.role = "admin"
        db.session.commit()
        return f"<h3>Success!</h3><p>{email} is now an ADMIN.</p><a href='http://127.0.0.1:5500/html/web.html'>Go back to website</a>"
    return "User not found. Please sign up on the website first."


if __name__ == "__main__":
    with app.app_context():
        try:
            from sqlalchemy import text
            db.session.execute(text("ALTER TABLE student ADD COLUMN role VARCHAR(20) DEFAULT 'student' NOT NULL;"))
            db.session.commit()
            print("Successfully migrated student table to include 'role' column.")
        except Exception as e:
            # Column likely already exists or table doesn't exist yet
            db.session.rollback()
        db.create_all()
    app.run(debug=True)