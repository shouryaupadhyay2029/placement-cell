const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\frontend\\html';

const newSidebar = `    <!-- DYNAMIC ISLAND SIDEBAR -->
    <aside class="dynamic-island-sidebar" id="dynamicSidebar">
        <div class="dynamic-island-text" id="dynamicIslandText">EXPLORE</div>
        <ul class="dynamic-icons">
            <li class="dynamic-item" data-section="dashboard" data-label="Dashboard" data-nav="index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            </li>
            <li class="dynamic-item" data-section="companies" data-label="Companies" data-nav="companies.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="1"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    <line x1="6" y1="11" x2="8" y2="11"/><line x1="6" y1="15" x2="8" y2="15"/>
                    <line x1="16" y1="11" x2="18" y2="11"/><line x1="16" y1="15" x2="18" y2="15"/>
                </svg>
            </li>
            <li class="dynamic-item" id="collegeSelectorTrigger" data-label="Select College">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5"></path>
                </svg>
            </li>
            <li class="dynamic-item" data-section="eligibility" data-label="Eligibility" data-nav="eligibility.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M9 14l2 2 4-4"></path>
                </svg>
            </li>
            <li class="dynamic-item" data-section="analytics" data-label="Analytics" data-nav="analytics.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                    <line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
            </li>
        </ul>

        <!-- College Selector Hover Panel -->
        <div class="college-selector-panel" id="collegeSelectorPanel">
            <div class="panel-title">Select College</div>
            <div class="college-option active" data-college="USAR">USAR</div>
            <div class="college-option" data-college="USICT">USICT</div>
        </div>
    </aside>`;

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.html')) return;
    const fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');

    // Replace the entire dynamic island block
    content = content.replace(/<(?:!-- DYNAMIC ISLAND SIDEBAR --)?\n?\s*aside[^>]*class="[^"]*dynamic-island-sidebar[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, newSidebar);

    fs.writeFileSync(fp, content);
});
console.log("Updated HTML sidebars with switched logos and label EXPLORE.");
