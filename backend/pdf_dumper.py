import pdfplumber
import json

pdf_path = r"C:\Users\Shourya Upadhyay\OneDrive\Documents\usarplcrep2025260725.pdf"

all_tables = []
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if tables:
            for j, table in enumerate(tables):
                # Clean up newlines and None
                clean_table = [[str(cell).replace('\n', ' ').strip() for cell in row] if row else [] for row in table]
                all_tables.append({
                    "page": i + 1,
                    "table_index": j + 1,
                    "data": clean_table
                })

with open("pdf_tables.json", "w", encoding="utf-8") as f:
    json.dump(all_tables, f, indent=2)
print("Saved to pdf_tables.json")
