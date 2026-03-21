// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initSemiSidebar();
    });
} else {
    initSemiSidebar();
}

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        // Add a small delay for premium feel
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 800);
    }
});

// semicircle sidebar positioning
function initSemiSidebar() {
    const items = document.querySelectorAll('.semi-item');
    const sections = document.querySelectorAll('.section');
    const semiSidebar = document.querySelector('.semi-sidebar');

    if (items.length === 0 || !semiSidebar) return;

    // Click logic
    items.forEach((it) => {
        it.addEventListener('click', e => {
            e.preventDefault();
            const nav = it.getAttribute('data-nav');
            const id = it.getAttribute('data-section');

            // 1. PHYSICAL PAGE NAVIGATION
            if (nav) {
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = nav;
                }, 300);
                return;
            }

            // 2. SAME-PAGE SECTION SWITCHING
            items.forEach(i => i.classList.remove('active'));
            it.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));

            const target = document.getElementById(id);
            if (target) target.classList.add('active');
        });
    });

    // Auto-activate sidebar item based on current page URL
    const currentPath = window.location.pathname;
    items.forEach(it => {
        const nav = it.getAttribute('data-nav');
        if (nav && currentPath.includes(nav)) {
            items.forEach(i => i.classList.remove('active'));
            it.classList.add('active');
        }
    });

    // Proximity Reveal Logic
    let hideTimeout;
    const revealRadius = 180; // semicircular trigger distance in px

    let isThrottled = false;
    document.addEventListener('mousemove', (e) => {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Get sidebar rect center
            const rect = semiSidebar.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distanceToCenterY = Math.abs(mouseY - centerY);
            
            // Calculate semicircular physical distance from (0, centerY)
            const distanceToCenter = Math.sqrt(mouseX * mouseX + distanceToCenterY * distanceToCenterY);

            // Reveal if inside the semicircle radius or directly hovering the navigation items
            if (distanceToCenter < revealRadius || semiSidebar.matches(':hover')) {
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                semiSidebar.classList.add('visible');
                document.body.classList.add('sidebar-open');
            } else {
                // Delay disappearing safely without overlapping timer issues
                if (!hideTimeout && semiSidebar.classList.contains('visible')) {
                    hideTimeout = setTimeout(() => {
                        semiSidebar.classList.remove('visible');
                        document.body.classList.remove('sidebar-open');
                        hideTimeout = null;
                    }, 800); // Shorter, crisper delay
                }
            }
            isThrottled = false;
        });
    });

    // Hover Persistence
    semiSidebar.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        hideTimeout = null;
        semiSidebar.classList.add('visible');
        document.body.classList.add('sidebar-open');
    });

    semiSidebar.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            semiSidebar.classList.remove('visible');
            document.body.classList.remove('sidebar-open');
            hideTimeout = null;
        }, 1500);
    });

    // make first active
    items[0]?.classList.add('active');
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
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            e.target.closest("tr").remove();
        }
    });
}

// Generate particles
const particleContainer = document.querySelector(".particles");

if (particleContainer) {
    const blackShinyColors = [
        { bg: "#000000", glow: "rgba(255, 255, 255, 0.9)" },
        { bg: "#1a1a1a", glow: "rgba(230, 230, 230, 1)" },
        { bg: "#080808", glow: "rgba(255, 255, 255, 0.8)" }
    ];

    for (let i = 0; i < 80; i++) {
        const particle = document.createElement("span");
        const colorScheme = blackShinyColors[Math.floor(Math.random() * blackShinyColors.length)];

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
        // Enhanced shiny black effect
        particle.style.boxShadow = `0 0 5px ${colorScheme.glow}, 0 0 10px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.2)`;

        particleContainer.appendChild(particle);
    }
}

// Generate stars for the upper region
if (particleContainer) {
    for (let i = 0; i < 40; i++) {
        const star = document.createElement("span");
        star.classList.add("star");

        // Position below the midpoint so they emerge from behind the lower region
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = (66 + Math.random() * 29) + "vh";

        const duration = 12 + Math.random() * 8;
        star.style.animationDuration = duration + "s";
        star.style.animationDelay = Math.random() * 5 + "s";

        const size = 1.5 + Math.random() * 2.5;
        star.style.width = size + "px";
        star.style.height = size + "px";

        particleContainer.appendChild(star);
    }
}

const glow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
    if (glow) {
        requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });
    }
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
    link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        if (href && href.endsWith(".html")) {
            e.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });
}
);
// AUTH MODAL LOGIC
const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeAuthModal = document.getElementById("closeAuthModal");
const authToggle = document.getElementById("authToggle");

if (authModal && loginBtn && signupBtn && closeAuthModal) {
    const showModal = (isSignup = false) => {
        authModal.style.display = "flex";
        setTimeout(() => {
            authModal.classList.add("show");
        }, 10);
        authToggle.checked = isSignup;
    };

    const hideModal = () => {
        authModal.classList.remove("show");
        setTimeout(() => {
            authModal.style.display = "none";
        }, 400);
    };

    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(false);
    });

    signupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(true);
    });

    closeAuthModal.addEventListener("click", hideModal);

    authModal.addEventListener("click", (e) => {
        if (e.target === authModal) {
            hideModal();
        }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            hideModal();
        }
    });
}

// Helper: create a single star element
function createStar(extraClass) {
    const star = document.createElement("span");
    star.classList.add("star");
    if (extraClass) star.classList.add(extraClass);

    star.style.left = Math.random() * 100 + "vw";
    star.style.top = (66 + Math.random() * 29) + "vh";

    const duration = 10 + Math.random() * 10;
    star.style.animationDuration = duration + "s";
    star.style.animationDelay = Math.random() * 6 + "s";

    const size = 1.5 + Math.random() * 2.5;
    star.style.width = size + "px";
    star.style.height = size + "px";

    return star;
}

// Inject extra yellow stars for dark mode
function addDarkStars() {
    const container = document.querySelector(".particles");
    if (!container) return;
    for (let i = 0; i < 35; i++) {
        container.appendChild(createStar("dark-extra-star"));
    }
}

// Remove extra dark-mode stars
function removeDarkStars() {
    document.querySelectorAll(".dark-extra-star").forEach(el => el.remove());
}

// THEME SWITCHER LOGIC
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // Initial sync
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
        // Don't call addDarkStars directly to avoid potential race conditions
        // Wait for DOM or call it with a check
        setTimeout(addDarkStars, 0); 
    } else {
        body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
        localStorage.setItem('theme', 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                addDarkStars();
            } else {
                body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                removeDarkStars();
            }
        });
    }
}

// Call theme init correctly
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
} else {
    initTheme();
}

// HAMBURGER AUTO-CLOSE LOGIC
document.addEventListener("DOMContentLoaded", () => {
    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const hamburgerContainer = document.querySelector(".hamburger-container");
    
    if (hamburgerToggle && hamburgerContainer) {
        let closeTimeout;

        const startCloseTimer = () => {
            if (hamburgerToggle.checked) {
                clearTimeout(closeTimeout);
                closeTimeout = setTimeout(() => {
                    hamburgerToggle.checked = false;
                }, 2500); // 2.5 seconds auto-close delay
            }
        };

        const stopCloseTimer = () => {
            clearTimeout(closeTimeout);
        };

        hamburgerToggle.addEventListener("change", () => {
            if (hamburgerToggle.checked) {
                if (!hamburgerContainer.matches(':hover')) {
                    startCloseTimer();
                }
            } else {
                stopCloseTimer();
            }
        });

        hamburgerContainer.addEventListener("mouseenter", stopCloseTimer);
        hamburgerContainer.addEventListener("mouseleave", () => {
            if (hamburgerToggle.checked) {
                startCloseTimer();
            }
        });
    }
});
