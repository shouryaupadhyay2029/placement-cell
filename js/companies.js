document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const ctcFilter = document.getElementById("ctcFilter");
    const tableBody = document.getElementById("companiesTableBody");

    // Modal elements
    const companyModal = document.getElementById("companyModal");
    const addCompanyBtn = document.getElementById("addCompanyBtn");
    const closeCompanyModal = document.getElementById("closeCompanyModal");
    const companyForm = document.getElementById("companyForm");

    // CSV elements
    const csvImportBtn = document.getElementById("csvImportBtn");
    const csvFileInput = document.getElementById("csvFileInput");

    let allCompanies = [];

    async function fetchCompanies() {
        if (!tableBody) return;
        
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Loading companies...</td></tr>`;

        try {
            const response = await fetch("http://127.0.0.1:5000/companies");
            if (!response.ok) throw new Error("Failed to fetch companies");

            allCompanies = await response.json();
            renderCompanies(allCompanies);
        } catch (error) {
            console.error("Fetch error:", error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ff4d4d; padding: 20px;">Error loading companies. Please ensure backend is running at http://127.0.0.1:5000</td></tr>`;
        }
    }

    function renderCompanies(companies) {
        if (!tableBody) return;
        if (companies.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">No companies available yet</td></tr>`;
            return;
        }

        tableBody.innerHTML = companies.map(company => `
            <tr>
                <td>${company.company_name}</td>
                <td>${company.role}</td>
                <td>${company.package}</td>
                <td>${company.location}</td>
                <td>${company.eligibility}</td>
                <td>${company.deadline}</td>
                <td>${company.description || "—"}</td>
            </tr>
        `).join("");
    }

    function filterAndSearch() {
        const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
        const filterValue = ctcFilter ? ctcFilter.value : "all";

        const filtered = allCompanies.filter(company => {
            const name = (company.company_name || "").toLowerCase();
            const role = (company.role || "").toLowerCase();
            const matchesSearch = name.includes(searchValue) || role.includes(searchValue);
            
            const ctc = parseFloat(company.package);
            let matchesFilter = true;
            if (filterValue === "high") matchesFilter = ctc > 15;
            else if (filterValue === "mid") matchesFilter = ctc >= 5 && ctc <= 15;
            else if (filterValue === "low") matchesFilter = ctc < 5;

            return matchesSearch && matchesFilter;
        });

        renderCompanies(filtered);
    }

    // Modal Control
    if (addCompanyBtn) {
        addCompanyBtn.addEventListener("click", () => {
            const container = companyModal.querySelector('.form-container');
            if (container) container.scrollTop = 0;
            companyModal.style.display = "flex";
            setTimeout(() => companyModal.classList.add("show"), 10);
        });
    }

    if (closeCompanyModal) {
        closeCompanyModal.addEventListener("click", () => {
            companyModal.classList.remove("show");
            setTimeout(() => companyModal.style.display = "none", 400);
        });
    }

    // Form Submission
    if (companyForm) {
        companyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(companyForm);
            const data = Object.fromEntries(formData.entries());

            // Simple validation
            if (!data.company_name || !data.role || !data.package) {
                showToast("Please fill all required fields", "error");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:5000/companies", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast("Company added successfully!", "success");
                    companyForm.reset();
                    companyModal.classList.remove("show");
                    setTimeout(() => companyModal.style.display = "none", 400);
                    fetchCompanies(); // Refresh list
                } else {
                    const err = await response.json();
                    showToast(err.error || "Failed to add company", "error");
                }
            } catch (error) {
                showToast("Network error. Please try again.", "error");
            }
        });
    }

    // CSV Import
    if (csvImportBtn) {
        csvImportBtn.addEventListener("click", () => csvFileInput.click());
    }

    if (csvFileInput) {
        csvFileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                showToast("Importing CSV...", "info");
                const response = await fetch("http://127.0.0.1:5000/companies/import", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    showToast(result.message, "success");
                    fetchCompanies(); // Refresh list
                } else {
                    showToast(result.error || "Import failed", "error");
                }
            } catch (error) {
                showToast("Error uploading CSV", "error");
            }
            csvFileInput.value = ""; // Clear input
        });
    }

    // Toast Notification System
    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            padding: 12px 20px;
            border-radius: 8px;
            background: #111;
            color: #fff;
            border-left: 5px solid ${type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#facc15"};
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.3s ease;
            min-width: 250px;
        `;
        toast.textContent = message;

        container.appendChild(toast);
        
        // Appear
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(0)";
        });

        // Disappear after 4s
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    if (searchInput) searchInput.addEventListener("keyup", filterAndSearch);
    if (ctcFilter) ctcFilter.addEventListener("change", filterAndSearch);

    fetchCompanies();
});