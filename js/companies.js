const searchInput = document.getElementById("searchInput");
const rows = document.querySelectorAll("#companyTable tbody tr");
const ctcFilter = document.getElementById("ctcFilter");

searchInput.addEventListener("keyup", function() {
    const value = this.value.toLowerCase();

    rows.forEach(row => {
        const company = row.cells[0].textContent.toLowerCase();
        row.style.display = company.includes(value) ? "" : "none";
    });
});

ctcFilter.addEventListener("change", function() {
    const value = this.value;

    rows.forEach(row => {
        const ctc = parseFloat(row.cells[2].textContent);

        if (value === "high" && ctc <= 15) row.style.display = "none";
        else if (value === "mid" && (ctc < 5 || ctc > 15)) row.style.display = "none";
        else if (value === "low" && ctc >= 5) row.style.display = "none";
        else row.style.display = "";
    });
});