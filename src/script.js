// src/script.js

// --- Global Variables ---
// These are relevant only for the index.html page
let allGames = [];
let filteredAndSortedGames = [];
let currentPage = 1;
const gamesPerPage = 20;
const ageRatingSystems = ['ESRB', 'PEGI', 'USK', 'CERO'];

// --- DOM Elements (shared across pages for header features) ---
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- Utility Functions (shared for header features) ---

function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcons(isDarkMode);
}

function updateThemeIcons(isDarkMode) {
    if (isDarkMode) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
            updateThemeIcons(true);
        } else {
            document.documentElement.classList.remove('dark');
            updateThemeIcons(false);
        }
    }
}

/**
 * Toggles the visibility of the mobile navigation menu.
 * Dynamically positions the menu on desktop to appear below the button.
 */
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');

    // If menu is now visible and it's a desktop view
    if (!mobileMenu.classList.contains('hidden') && window.innerWidth >= 768) {
        const buttonRect = mobileMenuButton.getBoundingClientRect();
        // Position it right-aligned with the button's right edge
        // and below the button
        mobileMenu.style.top = `${buttonRect.bottom + window.scrollY + 10}px`; // 10px below button
        mobileMenu.style.right = `${window.innerWidth - buttonRect.right}px`; // Align right edge of menu with right edge of button
        mobileMenu.style.left = 'auto'; // Ensure left is auto to let right take effect
    } else {
        // Reset styles for mobile or when hidden
        mobileMenu.style.top = '';
        mobileMenu.style.right = ''; // Let Tailwind's right-4 handle it
        mobileMenu.style.left = '';
    }
}

/**
 * Closes the mobile menu if a click occurs outside of it or its toggle button.
 * @param {Event} event - The click event.
 */
function handleClickOutsideMenu(event) {
    if (mobileMenu && mobileMenuButton && !mobileMenu.classList.contains('hidden')) {
        // Check if the click target is outside both the menu and the button
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickInsideButton = mobileMenuButton.contains(event.target);

        if (!isClickInsideMenu && !isClickInsideButton) {
            mobileMenu.classList.add('hidden');
        }
    }
}


function initializeHeaderFeatures() {
    applySavedTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
        document.addEventListener('click', handleClickOutsideMenu); // Add this listener to close on outside click

        // Optional: Re-position menu on resize if it's open and desktop
        window.addEventListener('resize', () => {
            if (!mobileMenu.classList.contains('hidden') && window.innerWidth >= 768) {
                const buttonRect = mobileMenuButton.getBoundingClientRect();
                mobileMenu.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
                mobileMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
                mobileMenu.style.left = 'auto';
            } else if (mobileMenu.classList.contains('hidden') && window.innerWidth < 768) {
                // If on mobile and menu is hidden, ensure no inline styles interfere
                mobileMenu.style.top = '';
                mobileMenu.style.right = '';
                mobileMenu.style.left = '';
            }
            // If the menu is open on mobile and we resize to desktop, we might want to close it or adjust
            // For simplicity, we'll let it stay open but correctly position if it was open on mobile
            if (window.innerWidth < 768) {
                mobileMenu.style.top = ''; // Clear desktop positioning for mobile
                mobileMenu.style.right = ''; // Let Tailwind's right-4 handle it
                mobileMenu.style.left = '';
            }
        });
    }
}

// ... (reszta kodu odpowiedzialna za listę gier, filtrowanie, sortowanie, paginację - bez zmian) ...
// The rest of the script.js remains as it was in the previous good version for game data functionality.

// --- Main Initialization Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    initializeHeaderFeatures();

    const gameListContainer = document.getElementById('game-list');
    const paginationControls = document.getElementById('pagination-controls');
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const gamemodeFilter = document.getElementById('gamemode-filter');
    const sortBy = document.getElementById('sort-by');

    if (gameListContainer) { // Check if on index.html
        allGames = await fetchGameData();
        populateFilters();
        filteredAndSortedGames = [...allGames];
        renderGames();
    }
});