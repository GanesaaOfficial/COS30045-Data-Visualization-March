/**
 * Navigation Script for Energy Australia Website
 * Handles page navigation and active menu highlighting
 * Features:
 * - Smooth page transitions
 * - Active navigation highlighting
 * - Logo click returns to home
 * - Responsive navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});

/**
 * Update navigation based on current page
 */
function updateNavigation() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (href === 'index.html' && currentPage === '')) {
            link.classList.add('active');
        }
    });
}

/**
 * Handle logo click - navigate to home
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
        
        logoLink.addEventListener('mouseenter', function() {
            console.log('Logo: Click to return to home');
        });
    }
});

/**
 * Add hover feedback to navigation links
 */
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const page = this.getAttribute('data-page');
            const pageNames = {
                'home': 'Home - Energy Consumption Overview',
                'televisions': 'Televisions - Screen Tech & Energy Guide',
                'about': 'About Us - Project Details & AI Declaration'
            };
            // Optional: Uncomment to show page description on hover
            // console.log('Navigating to: ' + pageNames[page]);
        });
        
        link.addEventListener('mouseleave', function() {
            // Optional hover-out effect
        });
    });
});

/**
 * Provide feedback for current page
 */
document.addEventListener('DOMContentLoaded', function() {
    const currentNav = document.querySelector('.nav-link.active');
    if (currentNav) {
        const dataPage = currentNav.getAttribute('data-page');
        const pageTitle = {
            'home': 'Home',
            'televisions': 'Televisions',
            'about': 'About Us'
        };
        console.log('📍 You are on: ' + pageTitle[dataPage] + ' page');
    }
});
