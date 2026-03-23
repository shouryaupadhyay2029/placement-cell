document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const ctcFilter = document.getElementById("ctcFilter");
    const batchFilter = document.getElementById("batchFilter");
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
    let editingCompanyId = null;

    // RBAC logic
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;
    const isPrivileged = user && (user.role === 'admin' || user.role === 'tpo');

    const actionsHeader = document.getElementById("actionsHeader");

    // Determine if student is logged in (not guest, not privileged)
    const isLoggedIn = !!user;
    const isStudent = isLoggedIn && !isPrivileged;

    // Track which company IDs the student already applied to
    let appliedCompanyIds = new Set();

    if (!isPrivileged) {
        if (addCompanyBtn) addCompanyBtn.style.display = 'none';
        if (csvImportBtn) csvImportBtn.style.display = 'none';
        if (actionsHeader) actionsHeader.style.display = 'none';
    }

    // Show or hide the Apply column header
    const applyHeader = document.getElementById("applyHeader");
    if (!isStudent && applyHeader) applyHeader.style.display = 'none';

    async function fetchCompanies() {
        if (!tableBody) return;

        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">Loading companies...</td></tr>`;

        // Fetch applied companies for this student first (so buttons render correctly)
        if (isStudent) {
            try {
                const appRes = await fetch("http://127.0.0.1:5000/my-applications", { credentials: "include" });
                if (appRes.ok) {
                    const apps = await appRes.json();
                    appliedCompanyIds = new Set(apps.map(a => a.company_id));
                }
            } catch (_) {}
        }

        let url = "http://127.0.0.1:5000/companies";
        const header = document.getElementById("companiesHeader");
        const batchValue = batchFilter ? batchFilter.value : "all";

        if (batchValue !== "all") {
            url += `?batch_year=${batchValue}`;
            if (header) header.textContent = `Companies Visited - ${batchValue} Batch`;
        } else {
            // Find year range for "All Batches"
            const options = Array.from(batchFilter.options)
                                 .map(o => parseInt(o.value))
                                 .filter(v => !isNaN(v));
            if (options.length > 0 && header) {
                const minYear = Math.min(...options);
                const maxYear = Math.max(...options);
                header.textContent = `Companies Visited: ${minYear} - ${maxYear} Academic Years`;
            } else if (header) {
                header.textContent = "Companies Visited Till Now";
            }
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch companies");
            allCompanies = await response.json();
            filterAndSearch();
        } catch (error) {
            console.error("Fetch error:", error);
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #ff4d4d; padding: 20px;">Error loading companies. Please ensure backend is running at http://127.0.0.1:5000</td></tr>`;
        }
    }

    async function renderCompanies(companies) {
        if (!tableBody) return;
        
        // Start fade out
        tableBody.classList.add("fade-out");
        
        // Brief delay for transition
        await new Promise(resolve => setTimeout(resolve, 300));

        if (companies.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">No companies available yet</td></tr>`;
        } else {
            tableBody.innerHTML = companies.map(company => {
                const alreadyApplied = appliedCompanyIds.has(company.id);
            const isClosed = company.status === 'Closed';

            const applyBtnHtml = isStudent ? `
                <td>
                    <button
                        id="apply-btn-${company.id}"
                        onclick="applyToCompany(${company.id})"
                        ${alreadyApplied || isClosed ? 'disabled' : ''}
                        style="padding: 5px 12px; border-radius: 4px; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 12px; cursor: ${alreadyApplied || isClosed ? 'not-allowed' : 'pointer'}; border: none;
                               background: ${alreadyApplied ? 'rgba(34, 197, 94, 0.15)' : isClosed ? 'rgba(100,100,100,0.15)' : '#22c55e'};
                               color: ${alreadyApplied ? '#22c55e' : isClosed ? '#888' : '#000'};
                               border: 1px solid ${alreadyApplied ? '#22c55e' : isClosed ? '#555' : '#16a34a'};
                               opacity: ${alreadyApplied || isClosed ? '0.8' : '1'};"
                    >${alreadyApplied ? '✓ Applied' : isClosed ? 'Closed' : 'Apply'}</button>
                </td>` : '';

            const actionsBtnHtml = isPrivileged ? `
                <td>
                    <div style="display:flex; gap: 8px;">
                        <button class="edit-btn" onclick="editCompany(${company.id})" style="background: #facc15; border: 1px solid #ca8a04; color: #000; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 600;">Edit</button>
                        <button class="delete-btn" onclick="deleteCompany(${company.id})" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-family: 'Poppins', sans-serif;">Del</button>
                    </div>
                </td>` : '';

            return `
            <tr>
                <td>${company.company_name}</td>
                <td>${company.batch_year || '—'}</td>
                <td>${company.role}</td>
                <td>${company.package}</td>
                <td>${company.location}</td>
                <td>${company.eligibility}</td>
                <td>${company.deadline}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
                        background: ${company.status === 'Active' ? 'rgba(34, 197, 94, 0.2)' : company.status === 'Upcoming' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                        color: ${company.status === 'Active' ? '#22c55e' : company.status === 'Upcoming' ? '#eab308' : '#ef4444'};">
                        ${company.status || 'Active'}
                    </span>
                </td>
                ${applyBtnHtml}
                ${actionsBtnHtml}
            </tr>`;
            }).join('');
        }
        
        // Remove fade out and trigger fade in
        tableBody.classList.remove("fade-out");
        tableBody.classList.add("fade-in");
        
        setTimeout(() => {
            if (tableBody) tableBody.classList.remove("fade-in");
        }, 300);
    }

    // Global Apply function
    window.applyToCompany = async function(companyId) {
        const btn = document.getElementById(`apply-btn-${companyId}`);
        if (btn) { btn.disabled = true; btn.textContent = 'Applying...'; }
        try {
            const res = await fetch(`http://127.0.0.1:5000/apply/${companyId}`, {
                method: "POST",
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                appliedCompanyIds.add(companyId);
                showToast("Application submitted! ✓", "success");
                if (btn) {
                    btn.textContent = '✓ Applied';
                    btn.style.background = 'rgba(34, 197, 94, 0.15)';
                    btn.style.color = '#22c55e';
                    btn.style.border = '1px solid #22c55e';
                    btn.style.cursor = 'not-allowed';
                }
            } else {
                showToast(data.error || "Failed to apply", "error");
                if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
            }
        } catch(_) {
            showToast("Network error. Please try again.", "error");
            if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
        }
    };

    // Global delete function
    window.deleteCompany = async function(id) {
        if (!confirm("Are you sure you want to delete this company?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/companies/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                showToast("Company deleted successfully", "success");
                fetchCompanies();
            } else {
                const err = await response.json();
                showToast(err.error || "Failed to delete company", "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        }
    };

    // Global edit function so it can be called from onclick
    window.editCompany = function(id) {
        const company = allCompanies.find(c => c.id === id);
        if (!company) return;

        editingCompanyId = id;
        
        // Fill form fields
        companyForm.company_name.value = company.company_name || "";
        companyForm.batch_year.value = company.batch_year || "";
        companyForm.role.value = company.role || "";
        companyForm.package.value = company.package || "";
        companyForm.location.value = company.location || "";
        companyForm.eligibility.value = company.eligibility || "";
        companyForm.deadline.value = company.deadline || "";
        companyForm.status.value = company.status || "Active";
        companyForm.company_type.value = company.company_type || "";
        companyForm.min_cgpa.value = company.min_cgpa || "";
        companyForm.allowed_branches.value = company.allowed_branches || "";
        companyForm.backlog_criteria.value = company.backlog_criteria || "";
        companyForm.application_link.value = company.application_link || "";
        companyForm.selection_process.value = company.selection_process || "";
        companyForm.description.value = company.description || "";

        // Update modal UI
        const modalTitle = document.getElementById("modalTitle");
        if(modalTitle) modalTitle.textContent = "Edit Company";
        
        const submitBtn = document.querySelector("#companyForm button[type='submit']");
        if(submitBtn) submitBtn.textContent = "Update Company";

        // Show modal
        const container = companyModal.querySelector('.form-container');
        if (container) container.scrollTop = 0;
        companyModal.style.display = "flex";
        setTimeout(() => companyModal.classList.add("show"), 10);
    };

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
            editingCompanyId = null;
            companyForm.reset();
            
            // Revert modal UI for Add
            const modalTitle = document.getElementById("modalTitle");
            if(modalTitle) modalTitle.textContent = "Add New Company";
            
            const submitBtn = document.querySelector("#companyForm button[type='submit']");
            if(submitBtn) submitBtn.textContent = "Save Company";

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
            if (!data.company_name || !data.role || !data.package || !data.batch_year) {
                showToast("Please fill all required fields", "error");
                return;
            }

            try {
                const url = editingCompanyId 
                    ? `http://127.0.0.1:5000/companies/${editingCompanyId}`
                    : "http://127.0.0.1:5000/companies";
                
                const method = editingCompanyId ? "PUT" : "POST";

                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast(editingCompanyId ? "Company updated successfully!" : "Company added successfully!", "success");
                    companyForm.reset();
                    editingCompanyId = null;
                    companyModal.classList.remove("show");
                    setTimeout(() => companyModal.style.display = "none", 400);
                    fetchCompanies(); // Refresh list
                } else {
                    const err = await response.json();
                    showToast(err.error || (editingCompanyId ? "Failed to update company" : "Failed to add company"), "error");
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
    if (batchFilter) batchFilter.addEventListener("change", fetchCompanies);

    fetchCompanies();
});