// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initSemiSidebar();
    });
} else {
    initSemiSidebar();
}

// semicircle sidebar positioning
function initSemiSidebar() {
    const items = document.querySelectorAll('.semi-item');
    const sections = document.querySelectorAll('.section');
    if (items.length === 0) return;

    items.forEach((it, idx) => {
        it.addEventListener('click', e => {
            e.preventDefault();
            items.forEach(i => i.classList.remove('active'));
            it.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            const id = it.getAttribute('data-section');
            const target = document.getElementById(id);
            if (target) target.classList.add('active');
        });
    });
    // make first active
    items[0] ? .classList.add('active');
}

// STUDENT PAGE FUNCTIONALITY

const addBtn = document.getElementById("addStudentBtn");

if (addBtn) {

    const modal = document.getElementById("studentModal");
    const closeModal = document.getElementById("closeModal");
    const saveBtn = document.getElementById("saveStudent");
    const tableBody = document.querySelector("#studentTable tbody");

    addBtn.addEventListener("click", () => {
        modal.classList.add("show");

    });
    closeModal.addEventListener("click", () => {
        modal.classList.remove("show");
    });
    saveBtn.addEventListener("click", () => {
        const name = document.getElementById("nameInput").value;
        const branch = document.getElementById("branchInput").value;
        const company = document.getElementById("companyInput").value;
        const pkg = document.getElementById("packageInput").value;
        if (!name || !branch || !company || !pkg) {
            alert("Please fill all fields");
            return;
        }
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${branch}</td>
            <td>${company}</td>
            <td>${pkg}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
        modal.style.display = "none";
    });
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete-btn")) {
            e.target.closest("tr").remove();
        }
    });
}

// Generate particles
const particleContainer = document.querySelector(".particles");

if (particleContainer) {
    const blueColors = [
        { bg: "#38bdf8", glow: "rgba(56, 189, 248, 1)" },
        { bg: "#60a5fa", glow: "rgba(96, 165, 250, 0.9)" },
        { bg: "#0ea5e9", glow: "rgba(14, 165, 233, 1)" }
    ];

    for (let i = 0; i < 80; i++) {
        const particle = document.createElement("span");
        const colorScheme = blueColors[Math.floor(Math.random() * blueColors.length)];

        // Start from middle region
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = 40 + Math.random() * 20 + "vh";

        particle.style.animationDuration = 8 + Math.random() * 6 + "s";
        particle.style.animationDelay = Math.random() * 5 + "s";

        // Randomize size slightly (larger for more visibility)
        const size = 2.5 + Math.random() * 2.5;
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        // Set color
        particle.style.background = colorScheme.bg;
        // Enhanced triple-layer glow for more shininess
        particle.style.boxShadow = `0 0 8px ${colorScheme.glow}, 0 0 16px rgba(96, 165, 250, 0.6), 0 0 24px ${colorScheme.glow}`;

        particleContainer.appendChild(particle);
    }
}

const glow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

const counters = document.querySelectorAll(".number");

counters.forEach(counter => {
    const updateCounter = () => {
        const target = +counter.getAttribute("data-target");
        const current = +counter.innerText;
        const increment = target / 100;

        if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(updateCounter, 20);
        } else {
            counter.innerText = target;
        }
    };

    updateCounter();
});

document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function(e) {
        const href = this.getAttribute("href");

        if (href && href.endsWith(".html")) {
            e.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });
});

// ===============================
// SMART PROXIMITY SIDEBAR SYSTEM
// ===============================

const sidebar = document.querySelector(".sidebar");
const indicator = document.querySelector(".sidebar-indicator");

if (sidebar) {

    const SIDEBAR_WIDTH = 240; // Full width
    const HIDDEN_OFFSET = -240; // How much to hide
    const APPROACH_ZONE = 200; // Distance from left to start reveal

    let hideTimeout = null;

    const updateIndicatorVisibility = () => {
        if (sidebar.classList.contains("visible")) {
            indicator.classList.add("hidden");
        } else {
            indicator.classList.remove("hidden");
        }
    };

    document.addEventListener("mousemove", (e) => {

        const cursorX = e.clientX;

        clearTimeout(hideTimeout);

        // 1️⃣ If cursor is inside sidebar area → keep fully open
        if (cursorX <= SIDEBAR_WIDTH) {
            sidebar.classList.add("visible");
            updateIndicatorVisibility();
            return;
        }

        // 2️⃣ If cursor is approaching from left → gradual reveal
        if (cursorX <= APPROACH_ZONE) {
            sidebar.classList.add("visible");
            updateIndicatorVisibility();
            return;
        }

        // 3️⃣ If cursor moves far away → hide smoothly (with delay)
        hideTimeout = setTimeout(() => {
            sidebar.classList.remove("visible");
            updateIndicatorVisibility();
        }, 150);
    });

    // Handle indicator click to show sidebar
    if (indicator) {
        indicator.addEventListener("click", () => {
            sidebar.classList.add("visible");
            updateIndicatorVisibility();
        });

        // Hide sidebar when cursor leaves both sidebar and indicator
        sidebar.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                sidebar.classList.remove("visible");
                updateIndicatorVisibility();
            }, 200);
        });

        indicator.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout);
        });
    }
}