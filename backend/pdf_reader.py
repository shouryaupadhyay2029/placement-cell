import pdfplumber

pdf_path = r"C:\Users\Shourya Upadhyay\OneDrive\Documents\usarplcrep2025260725.pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        for i in range(min(3, len(pdf.pages))):
            page = pdf.pages[i]
            print(f"--- Page {i+1} ---")
            
            tables = page.extract_tables()
            if tables:
                print("Found tables:")
                for j, table in enumerate(tables):
                    print(f"Table {j+1}:")
                    for row in table[:10]:
                        print(row)
            else:
                print("No tables found, extracting text:")
                text = page.extract_text()
                print(text[:1000] if text else "No text")
except Exception as e:
    print(f"Error reading PDF: {e}")
