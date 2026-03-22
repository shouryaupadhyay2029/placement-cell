from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS

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

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    package = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    eligibility = db.Column(db.String(200), nullable=False)
    deadline = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # Extra fields
    company_type = db.Column(db.String(50), nullable=True)
    min_cgpa = db.Column(db.Float, nullable=True)
    allowed_branches = db.Column(db.String(200), nullable=True)
    backlog_criteria = db.Column(db.String(100), nullable=True)
    selection_process = db.Column(db.Text, nullable=True)
    application_link = db.Column(db.String(300), nullable=True)

@app.route("/companies", methods=["POST"])
def add_company():
    data = request.get_json()

    company_name = data.get("company_name")
    role = data.get("role")
    package = data.get("package")
    location = data.get("location")
    eligibility = data.get("eligibility")
    deadline = data.get("deadline")
    description = data.get("description")
    
    # Extra fields
    company_type = data.get("company_type")
    min_cgpa = data.get("min_cgpa")
    allowed_branches = data.get("allowed_branches")
    backlog_criteria = data.get("backlog_criteria")
    selection_process = data.get("selection_process")
    application_link = data.get("application_link")

    if not company_name or not role or not package or not location or not eligibility or not deadline:
        return jsonify({"error": "Required fields (Name, Role, Package, Location, Eligibility, Deadline) must be filled"}), 400

    new_company = Company(
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
        application_link=application_link
    )

    db.session.add(new_company)
    db.session.commit()

    return jsonify({"message": "Company added successfully"}), 201

@app.route("/companies", methods=["GET"])
def get_companies():
    companies = Company.query.all()

    company_list = []
    for company in companies:
        company_list.append({
            "id": company.id,
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
            "application_link": company.application_link
        })

    return jsonify(company_list), 200

@app.route("/companies/import", methods=["POST"])
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

    new_student = Student(
        full_name=full_name,
        email=email,
        password=hashed_password,
        branch=branch,
        year=year
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
        session["student_id"] = student.id
        session["student_name"] = student.full_name

        return jsonify({
            "message": "Login successful",
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "branch": student.branch,
                "year": student.year
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
        "year": student.year
    }), 200


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)