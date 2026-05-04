/**
 * Energy Australia - Main JavaScript File
 * Handles interactive features and data loading
 */

// Wait for the HTML document to finish loading before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize interactive elements
    initializeButtons();
    updatePageInfo();
});

/**
 * Initialize all button interactions
 */
function initializeButtons() {
    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', handleDataLoad);
    }
}

/**
 * Handle data loading button click
 */
function handleDataLoad() {
    const loadDataBtn = document.getElementById('load-data-btn');
    const dataOutput = document.getElementById('data-output');
    
    if (!dataOutput) return;
    
    // Show a message to simulate an interaction
    dataOutput.classList.add('show');
    dataOutput.innerHTML = `
        <strong>✓ Success!</strong> The JavaScript interaction is working correctly. 
        <br><br>
        <em>In Exercise 3, this data will display interactive D3.js visualizations of 170+ television models with comprehensive energy consumption analysis.</em>
    `;
    loadDataBtn.textContent = '✓ Interaction Verified';
    loadDataBtn.disabled = true;
    loadDataBtn.style.backgroundColor = '#95a5a6';
    loadDataBtn.style.cursor = 'not-allowed';
}

/**
 * Display current page information
 */
function updatePageInfo() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageInfo = {
        'index.html': 'Home - Energy Consumption Overview',
        'televisions.html': 'Televisions - Screen Technology & Energy Guide',
        'about.html': 'About Us - Project Information & AI Declaration'
    };
    
    const pageTitle = pageInfo[currentPage] || 'Energy Australia';
    // Can be used for analytics or user feedback
    window.currentPageInfo = pageTitle;
}

/**
 * Utility function for smooth page transitions
 * Optional: Can be enhanced with CSS animations
 */
function smoothPageTransition() {
    // Add fade-in effect to main content
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = '0';
        setTimeout(() => {
            main.style.opacity = '1';
            main.style.transition = 'opacity 0.3s ease-in';
        }, 10);
    }
}

/**
 * Handle navigation link clicks
 */
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Page navigation is handled by href attribute
            // Smooth transition can be added here if needed
        });
    });
});

// Initialize page on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', smoothPageTransition);
} else {
    smoothPageTransition();
}