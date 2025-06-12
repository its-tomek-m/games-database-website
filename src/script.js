// src/script.js

// --- Global Variables ---
let allGames = [];
let filteredAndSortedGames = [];
let currentPage = 1;
const gamesPerPage = 20;
const ageRatingSystems = ['ESRB', 'PEGI', 'USK', 'CERO'];

// --- GLOBAL DOM Elements for header features ---
let themeToggle;
let sunIcon;
let moonIcon;
let mobileMenuButton;
let mobileMenu;

// --- GLOBAL DOM Elements specific to index.html for game data ---
let gameListContainer;
let paginationControls;
let searchInput;
let genreFilter;
let gamemodeFilter;
let sortBy;


// --- Utility Functions (shared for header features) ---
// TE FUNKCJE MUSZĄ BYĆ TUTAJ, PRZED initializeHeaderFeatures!

/**
 * Toggles dark/light mode and saves preference to localStorage.
 */
function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcons(isDarkMode);
}

/**
 * Updates the visibility of sun/moon icons based on the current theme.
 * @param {boolean} isDarkMode - True if dark mode is active, false otherwise.
 */
function updateThemeIcons(isDarkMode) {
    if (isDarkMode) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

/**
 * Applies the saved theme preference on page load.
 */
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    } else {
        // Default to dark mode if no preference is saved (or check system preference)
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
    if (!mobileMenu || !mobileMenuButton) {
        console.error("Mobile menu elements not found!");
        return;
    }

    mobileMenu.classList.toggle('hidden');

    if (!mobileMenu.classList.contains('hidden') && window.innerWidth >= 768) {
        const buttonRect = mobileMenuButton.getBoundingClientRect();
        mobileMenu.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
        mobileMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
        mobileMenu.style.left = 'auto';
    } else {
        mobileMenu.style.top = '';
        mobileMenu.style.right = '';
        mobileMenu.style.left = '';
    }
}

/**
 * Closes the mobile menu if a click occurs outside of it or its toggle button.
 * @param {Event} event - The click event.
 */
function handleClickOutsideMenu(event) {
    if (mobileMenu && mobileMenuButton && !mobileMenu.classList.contains('hidden')) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickInsideButton = mobileMenuButton.contains(event.target);

        if (!isClickInsideMenu && !isClickInsideButton) {
            mobileMenu.classList.add('hidden');
        }
    }
}

/**
 * Initializes header-related features (theme toggle, hamburger menu).
 * This function should be called on DOMContentLoaded for ALL pages.
 */
function initializeHeaderFeatures() {
    // Assign global DOM variables here once elements are available
    themeToggle = document.getElementById('theme-toggle');
    sunIcon = document.getElementById('sun-icon');
    moonIcon = document.getElementById('moon-icon');
    mobileMenuButton = document.getElementById('mobile-menu-button');
    mobileMenu = document.getElementById('mobile-menu');

    applySavedTheme(); // Ta funkcja jest teraz zdefiniowana wyżej

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
        document.addEventListener('click', handleClickOutsideMenu);

        window.addEventListener('resize', () => {
            if (!mobileMenu.classList.contains('hidden') && window.innerWidth >= 768) {
                const buttonRect = mobileMenuButton.getBoundingClientRect();
                mobileMenu.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
                mobileMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
                mobileMenu.style.left = 'auto';
            } else if (mobileMenu.classList.contains('hidden') && window.innerWidth < 768) {
                mobileMenu.style.top = '';
                mobileMenu.style.right = '';
                mobileMenu.style.left = '';
            }
            if (window.innerWidth < 768) {
                mobileMenu.style.top = '';
                mobileMenu.style.right = '';
                mobileMenu.style.left = '';
            }
        });
    }
}


// --- Utility Functions (specific to index.html for game data) ---

async function fetchGameData() {
    try {
        const response = await fetch('./data/dummy_games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Game data loaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error fetching game data:', error);
        return [];
    }
}

function formatGameData(game) {
    const extractNames = (arr, key) => arr && arr.length > 0 ? arr.map(item => item[key].name).filter(Boolean).join(', ') : 'N/A';

    const gameModesNames = game.game_modes ? game.game_modes.map(mode => mode.game_mode.name).filter(Boolean) : [];
    const hasOfflineCoOp = gameModesNames.includes('Co-op') ? 'Yes' : 'No';
    const hasSplitScreen = gameModesNames.includes('Split screen') ? 'Yes' : 'No';

    const formattedAgeRatings = {};
    if (game.age_ratings && game.age_ratings.length > 0) {
        ageRatingSystems.forEach(system => {
            const foundRating = game.age_ratings.find(ar =>
                ar.rating_category && (ar.rating_category.name === system || ar.rating_category.rating === system)
            );
            if (foundRating && foundRating.rating_category && foundRating.rating_category.rating) {
                formattedAgeRatings[system] = `${system}: ${foundRating.rating_category.rating}`;
            } else {
                formattedAgeRatings[system] = `${system}: N/A`;
            }
        });
    } else {
        ageRatingSystems.forEach(system => {
            formattedAgeRatings[system] = `${system}: N/A`;
        });
    }

    const firstVideo = game.videos && game.videos.length > 0 ? game.videos[0] : null;
    const formattedVideo = firstVideo ?
        `${firstVideo.name}: https://www.youtube.com/watch?v=${firstVideo.video_id}` :
        'No video available.';

    const formattedWebsites = game.websites && game.websites.length > 0 ?
        game.websites.map(site => `- <a href="${site.url}" target="_blank" class="text-blue-400 hover:underline">${site.url}</a>`).join('<br>') :
        'No websites available.';

    return {
        id: game.id,
        name: game.name || 'Unknown Title',
        storyline: game.storyline || 'No storyline available.',
        summary: game.summary || 'No summary available.',
        rating: game.total_rating ? game.total_rating.toFixed(1) : 'N/A',
        totalRatingCount: game.total_rating_count ? game.total_rating_count.toLocaleString() : 'N/A',
        gameModes: extractNames(game.game_modes, 'game_mode'),
        keywords: extractNames(game.keywords, 'keyword'),
        languages: extractNames(game.language_supports, 'language'),
        genres: extractNames(game.genres, 'genre'),
        offlineCoOp: hasOfflineCoOp,
        splitScreen: hasSplitScreen,
        perspectives: extractNames(game.player_perspectives, 'player_perspective'),
        platforms: extractNames(game.platforms, 'platform'),
        screenshots: game.screenshots && game.screenshots.length > 0 ? game.screenshots[0].url : 'https://via.placeholder.com/300x150?text=No+Screenshot',
        ageRatings: formattedAgeRatings,
        video: formattedVideo,
        websites: formattedWebsites
    };
}


function renderGameItem(game) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item bg-gray-800 p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200';
    gameItem.dataset.gameId = game.id;

    const ageRatingDisplay = ageRatingSystems.map(system =>
        `<p class="mb-1">${game.ageRatings[system] || `${system}: N/A`}</p>`
    ).join('');

    gameItem.innerHTML = `
        <div class="flex flex-col md:grid md:grid-cols-5 gap-4 items-start font-bold text-lg">
            <div class="text-blue-400 text-xl md:col-span-1">${game.name}</div>
            <div class="text-base text-gray-300 md:col-span-2">${game.summary}</div>
            <div class="text-blue-300 text-right">Rating: ${game.rating}</div>
            <div class="text-gray-400 text-right text-sm">Votes: ${game.totalRatingCount}</div>
            <div class="text-gray-300 text-base md:col-span-5">Genres: ${game.genres}</div>
        </div>
        <div class="game-details mt-4 p-4 border-t border-gray-700 hidden text-sm">
            <p class="mb-2"><span class="font-semibold text-blue-300">Storyline:</span> ${game.storyline}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Game Modes:</span> ${game.gameModes}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Keywords:</span> ${game.keywords}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Supported Languages:</span> ${game.languages}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Offline Co-Op:</span> ${game.offlineCoOp}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Split screen:</span> ${game.splitScreen}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Player Perspectives:</span> ${game.perspectives}</p>
            <p class="mb-2"><span class="font-semibold text-blue-300">Platforms:</span> ${game.platforms}</p>
            <div class="mb-2"><span class="font-semibold text-blue-300">Age Ratings:</span><br>${ageRatingDisplay}</div>
            <p class="mb-2"><span class="font-semibold text-blue-300">Video:</span> <a href="${game.video.split(': ')[1] || '#'}" target="_blank" class="text-blue-400 hover:underline">${game.video.split(': ')[0]}</a></p>
            <div class="mb-2"><span class="font-semibold text-blue-300">Website URLs:</span><br>${game.websites}</div>
            ${game.screenshots !== 'https://via.placeholder.com/300x150?text=No+Screenshot' ? `<img src="${game.screenshots}" alt="Screenshot of ${game.name}" class="mt-4 rounded-lg max-w-full h-auto">` : ''}
        </div>
    `;

    gameItem.addEventListener('click', () => {
        const details = gameItem.querySelector('.game-details');
        details.classList.toggle('hidden');
    });

    return gameItem;
}

function renderGames() {
    if (!gameListContainer) return;

    gameListContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToDisplay = filteredAndSortedGames.slice(startIndex, endIndex);

    if (gamesToDisplay.length === 0) {
        gameListContainer.innerHTML = '<p class="text-center text-gray-400 text-lg mt-8">No games found matching your criteria.</p>';
        if (paginationControls) paginationControls.innerHTML = '';
        return;
    }

    gamesToDisplay.forEach(game => {
        const formattedGame = formatGameData(game);
        gameListContainer.appendChild(renderGameItem(formattedGame));
    });

    renderPaginationControls();
}

function renderPaginationControls() {
    if (!paginationControls) return;

    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);

    if (totalPages <= 1) {
        return;
    }

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        renderGames();
        window.scrollTo(0, 0);
    });
    paginationControls.appendChild(prevButton);

    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.className = `px-4 py-2 rounded ${1 === currentPage ? 'bg-blue-400 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-gray-600 text-white'}`;
        firstPageButton.addEventListener('click', () => { currentPage = 1; renderGames(); window.scrollTo(0, 0); });
        paginationControls.appendChild(firstPageButton);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'text-gray-400 mx-1';
            paginationControls.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-blue-400 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-gray-600 text-white'}`;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderGames();
            window.scrollTo(0, 0);
        });
        paginationControls.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'text-gray-400 mx-1';
            paginationControls.appendChild(ellipsis);
        }
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.className = `px-4 py-2 rounded ${totalPages === currentPage ? 'bg-blue-400 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-gray-600 text-white'}`;
        lastPageButton.addEventListener('click', () => { currentPage = totalPages; renderGames(); window.scrollTo(0, 0); });
        paginationControls.appendChild(lastPageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        renderGames();
        window.scrollTo(0, 0);
    });
    paginationControls.appendChild(nextButton);
}


function applyFiltersAndSort() {
    let currentGames = [...allGames];

    if (searchInput) {
        const searchQuery = searchInput.value.toLowerCase().trim();
        if (searchQuery) {
            currentGames = currentGames.filter(game =>
                game.name.toLowerCase().includes(searchQuery) ||
                (game.storyline && game.storyline.toLowerCase().includes(searchQuery)) ||
                (game.summary && game.summary.toLowerCase().includes(searchQuery)) ||
                (formatGameData(game).keywords !== 'N/A' && formatGameData(game).keywords.toLowerCase().includes(searchQuery))
            );
        }
    }

    if (genreFilter) {
        const selectedGenre = genreFilter.value;
        if (selectedGenre) {
            currentGames = currentGames.filter(game => formatGameData(game).genres.includes(selectedGenre));
        }
    }

    if (gamemodeFilter) {
        const selectedGameMode = gamemodeFilter.value;
        if (selectedGameMode) {
            currentGames = currentGames.filter(game => formatGameData(game).gameModes.includes(selectedGameMode));
        }
    }

    if (sortBy) {
        const sortValue = sortBy.value;
        currentGames.sort((a, b) => {
            if (sortValue === 'name_asc') {
                return a.name.localeCompare(b.name);
            } else if (sortValue === 'name_desc') {
                return b.name.localeCompare(a.name);
            } else if (sortValue === 'rating_desc') {
                const ratingA = parseFloat(a.total_rating) || -Infinity;
                const ratingB = parseFloat(b.total_rating) || -Infinity;
                return ratingB - ratingA;
            } else if (sortValue === 'rating_asc') {
                const ratingA = parseFloat(a.total_rating) || Infinity;
                const ratingB = parseFloat(b.total_rating) || Infinity;
                return ratingA - ratingB;
            }
            return 0;
        });
    }

    filteredAndSortedGames = currentGames;
    currentPage = 1;
    renderGames();
}


function populateFilters() {
    if (!genreFilter || !gamemodeFilter) return;

    const allGenres = new Set();
    const allGameModes = new Set();

    allGames.forEach(game => {
        const formatted = formatGameData(game);

        formatted.genres.split(', ').forEach(genre => {
            if (genre !== 'N/A' && genre.trim() !== '') allGenres.add(genre.trim());
        });
        formatted.gameModes.split(', ').forEach(mode => {
            if (mode !== 'N/A' && mode.trim() !== '') allGameModes.add(mode.trim());
        });
    });

    genreFilter.innerHTML = '<option value="">All Genres</option>';
    Array.from(allGenres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    gamemodeFilter.innerHTML = '<option value="">All Game Modes</option>';
    Array.from(allGameModes).sort().forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        gamemodeFilter.appendChild(option);
    });
}


// --- Main Initialization Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize header features (menu, theme toggle) on all pages FIRST
    initializeHeaderFeatures(); // This will now assign the header DOM elements

    // 2. Then, get references to game-specific DOM elements
    gameListContainer = document.getElementById('game-list');
    paginationControls = document.getElementById('pagination-controls');
    searchInput = document.getElementById('search-input');
    genreFilter = document.getElementById('genre-filter');
    gamemodeFilter = document.getElementById('gamemode-filter');
    sortBy = document.getElementById('sort-by');

    // 3. ONLY perform game data related operations if on index.html
    if (gameListContainer) { // Check for an element unique to index.html's main content
        // Add event listeners for filters/sort only if elements exist
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    applyFiltersAndSort();
                }, 300);
            });
        }
        if (genreFilter) {
            genreFilter.addEventListener('change', applyFiltersAndSort);
        }
        if (gamemodeFilter) {
            gamemodeFilter.addEventListener('change', applyFiltersAndSort);
        }
        if (sortBy) {
            sortBy.addEventListener('change', applyFiltersAndSort);
        }

        // Fetch all game data
        allGames = await fetchGameData();

        // Populate filter dropdowns based on all loaded games
        populateFilters();

        // Initialize filteredAndSortedGames with all games and render the first page
        filteredAndSortedGames = [...allGames];
        renderGames();
    }
});