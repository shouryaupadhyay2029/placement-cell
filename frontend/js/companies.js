document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const minPackage = document.getElementById("minPackage");
    const minPackageVal = document.getElementById("minPackageVal");
    const sortFilter = document.getElementById("sortFilter");
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

    // DYNAMIC BATCH FILTER SYNC (Independent per College)
    async function updateBatchFilterOptions() {
        if (!batchFilter) return;
        const college = localStorage.getItem("college") || "USAR";
        
        try {
            const res = await window.api.get(`/companies/batches`);
            const batches = res.ok ? await res.json() : [];
            
            // 1. CLEAR & RE-POPULATE
            batchFilter.innerHTML = '<option value="all">All Batches</option>';
            batches.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = `${y} Batch`;
                batchFilter.appendChild(opt);
            });

            // 2. CONTEXT-AWARE RESTORATION
            const currentBatch = localStorage.getItem("selectedBatchYear");
            if (currentBatch && Array.from(batchFilter.options).some(o => o.value === currentBatch)) {
                batchFilter.value = currentBatch;
            } else {
                batchFilter.value = "all";
                localStorage.setItem("selectedBatchYear", "all");
            }
            
            // Refresh list with correct context
            fetchCompanies();

        } catch (e) {
            console.error("Batch sync failed:", e);
            batchFilter.innerHTML = '<option value="all">All Batches</option>';
            fetchCompanies();
        }
    }
    updateBatchFilterOptions();

    let isFetching = false;

    async function fetchCompanies() {
        if (isFetching) return;
        isFetching = true;

        if (!tableBody) {
            isFetching = false;
            return;
        }

        const loader = document.getElementById("loader");
        if (loader) loader.classList.remove("hidden");

        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">Loading companies...</td></tr>`;

        // Fetch applied companies (Mocked for now in Node)
        if (isStudent) {
            try {
                // Using consolidated window.api utility
                const appRes = await window.api.get("/companies/my-applications");
                if (appRes.ok) {
                    const apps = await appRes.json();
                    appliedCompanyIds = new Set(apps.map(a => a.company_id));
                }
            } catch (_) { }
        }

        let url = "/companies";
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
            const response = await window.api.get(url);
            if (!response.ok) throw new Error("Failed to fetch companies");
            const result = await response.json();
            
            // Handle both legacy array and new standardized object format
            allCompanies = result.data || result;
            if (!Array.isArray(allCompanies)) allCompanies = [];
            
            filterAndSearch();
        } catch (error) {
            console.error("Fetch error:", error);
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #ff4d4d; padding: 20px;">Error loading companies. Please ensure backend is running at https://placepro-backend.onrender.com</td></tr>`;
            const loader = document.getElementById("loader");
            if (loader) loader.classList.add("hidden");
        } finally {
            isFetching = false;
        }
    }

    async function renderCompanies(companies) {
        if (!tableBody) return;

        // Start fade out
        tableBody.classList.add("fade-out");

        // Brief delay for transition
        await new Promise(resolve => setTimeout(resolve, 300));

        if (companies.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px;">No companies available yet</td></tr>`;
        } else {
            tableBody.innerHTML = companies.map(company => {
                const alreadyApplied = appliedCompanyIds.has(company.id);
                const isClosed = company.status === 'Closed';

                const applyBtnHtml = isStudent ? `
                <td>
                    <button
                        id="apply-btn-${company.id}"
                        onclick="applyToCompany(${company.id})"
                        class="apply-btn-student"
                        ${alreadyApplied || isClosed ? 'disabled' : ''}
                    >${alreadyApplied ? '✓ Applied' : isClosed ? 'Closed' : 'Apply'}</button>
                </td>` : '';

                const actionsBtnHtml = isPrivileged ? `
                <td>
                    <div style="display:flex; gap: 10px;">
                        <button class="edit-btn" onclick="editCompany(${company.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteCompany(${company.id})">Delete</button>
                    </div>
                </td>` : '';

                const statusClass = company.status === 'Active' ? 'status-active' : company.status === 'Upcoming' ? 'status-upcoming' : 'status-closed';

                return `
            <tr>
                <td>${company.company_name}</td>
                <td style="color: rgba(255,255,255,0.6); font-size: 13px;">${company.batch_year || '—'}</td>
                <td>${company.role}</td>
                <td style="color: var(--primary); font-weight: 700;">${company.package.toString().toLowerCase().includes('lpa') || company.package.toString().includes('—') || company.package.toString().includes('PM') ? company.package : (company.package + ' LPA')}</td>
                <td style="font-weight: 500; opacity: 0.9;">${company.students_placed || (company.college === 'USICT' ? 0 : '—')}</td>
                <td>${company.location || '—'}</td>
                <td style="font-size: 13px; opacity: 0.8;">${company.eligibility || '—'}</td>
                <td style="font-size: 13px; color: #888;">${company.deadline || '—'}</td>
                <td>
                    <span class="status-pill ${statusClass}">
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
            if (loader) loader.classList.add("hidden");
        }, 300);
    }

    // Global Apply function
    window.applyToCompany = async function (companyId) {
        const btn = document.getElementById(`apply-btn-${companyId}`);
        if (btn) { btn.disabled = true; btn.textContent = 'Applying...'; }
        try {
            // Using consolidated window.api utility
            const res = await window.api.post(`/companies/apply/${companyId}`, {});
            const data = await res.json();
            if (res.ok) {
                appliedCompanyIds.add(companyId);
                showToast("Application submitted successfully!", "success");
                if (btn) {
                    btn.textContent = '✓ Applied';
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                    btn.style.filter = 'grayscale(0.5)';
                }
            } else {
                showToast(data.message || "Failed to apply", "error");
                if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
            }
        } catch (_) {
            showToast("Network error. Please try again.", "error");
            if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
        }
    };

    window.deleteCompany = async function (id) {
        if (!confirm("Are you sure you want to delete this company?")) return;
        try {
            const response = await window.api.fetch(`/companies/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                showToast("Company removed from database", "success");
                fetchCompanies();
            } else {
                const err = await response.json();
                showToast(err.message || "Failed to remove company", "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        }
    };

    // Global edit function so it can be called from onclick
    window.editCompany = function (id) {
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
        if (modalTitle) modalTitle.textContent = "Edit Company";

        const submitBtn = document.querySelector("#companyForm button[type='submit']");
        if (submitBtn) submitBtn.textContent = "Update Company";

        // Show modal
        const container = companyModal.querySelector('.form-container');
        if (container) container.scrollTop = 0;
        companyModal.style.display = "flex";
        setTimeout(() => companyModal.classList.add("show"), 10);
    };

    function filterAndSearch() {
        if (!allCompanies) return;

        const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
        const minPkgValue = minPackage ? parseFloat(minPackage.value) : 0;
        const sortBy = sortFilter ? sortFilter.value : "default";

        // 1. FILTERING
        let filtered = allCompanies.filter(company => {
            const name = (company.company_name || "").toLowerCase();
            const role = (company.role || "").toLowerCase();
            const matchesSearch = name.includes(searchValue) || role.includes(searchValue);

            // Extract numeric package (handling "12 LPA" -> 12)
            const pkgStr = company.package ? company.package.toString() : "0";
            const pkgValue = parseFloat(pkgStr.replace(/[^\d.]/g, '')) || 0;
            const matchesPackage = pkgValue >= minPkgValue;

            return matchesSearch && matchesPackage;
        });

        // 2. SORTING
        if (sortBy === "high-pkg") {
            filtered.sort((a, b) => {
                const valA = parseFloat(a.package.toString().replace(/[^\d.]/g, '')) || 0;
                const valB = parseFloat(b.package.toString().replace(/[^\d.]/g, '')) || 0;
                return valB - valA;
            });
        } else if (sortBy === "low-pkg") {
            filtered.sort((a, b) => {
                const valA = parseFloat(a.package.toString().replace(/[^\d.]/g, '')) || 0;
                const valB = parseFloat(b.package.toString().replace(/[^\d.]/g, '')) || 0;
                return valA - valB;
            });
        } else if (sortBy === "most-offers") {
            filtered.sort((a, b) => {
                const valA = parseInt(a.students_placed) || 0;
                const valB = parseInt(b.students_placed) || 0;
                return valB - valA;
            });
        }

        renderCompanies(filtered);
    }

    // Modal Control
    if (addCompanyBtn) {
        addCompanyBtn.addEventListener("click", () => {
            editingCompanyId = null;
            companyForm.reset();

            // Revert modal UI for Add
            const modalTitle = document.getElementById("modalTitle");
            if (modalTitle) modalTitle.textContent = "Add New Company";

            const submitBtn = document.querySelector("#companyForm button[type='submit']");
            if (submitBtn) submitBtn.textContent = "Save Company";

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
                const endpoint = editingCompanyId
                    ? `/companies/${editingCompanyId}`
                    : "/companies";

                let response;
                if (editingCompanyId) {
                    response = await window.api.fetch(endpoint, {
                        method: "PUT",
                        body: JSON.stringify(data)
                    });
                } else {
                    response = await window.api.post(endpoint, data);
                }

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
                // Use window.api.fetch for multipart if needed, or just standard fetch with X-College head
                const token = localStorage.getItem("token");
                const importHeaders = {
                    "X-College-Context": localStorage.getItem("college") || "USAR"
                };
                if (token) importHeaders["Authorization"] = `Bearer ${token}`;

                const response = await fetch(`${window.API_BASE_URL}/companies/import`, {
                    method: "POST",
                    headers: importHeaders,
                    body: formData
                });

                const result = await response.json();
                
                console.log("API RESPONSE:", result);
                console.log("STATUS:", response.status);
                if (!response.ok) {
                    console.error("API failed:", response.status);
                }

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

    if (searchInput) searchInput.addEventListener("input", filterAndSearch);
    if (minPackage) {
        minPackage.addEventListener("input", () => {
            if (minPackageVal) minPackageVal.textContent = minPackage.value;
            filterAndSearch();
        });
    }
    if (sortFilter) sortFilter.addEventListener("change", filterAndSearch);
    if (batchFilter) batchFilter.addEventListener("change", fetchCompanies);

    fetchCompanies();
});