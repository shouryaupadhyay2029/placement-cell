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