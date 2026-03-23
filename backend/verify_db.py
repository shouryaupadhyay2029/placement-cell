from app import app, PlacementRecord

with app.app_context():
    count = PlacementRecord.query.count()
    print(f"Total placement records: {count}")
    
    records = PlacementRecord.query.all()
    for r in records:
        print(f"{r.company_name} | {r.student_name} | {r.branch} | {r.year}")
