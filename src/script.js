// src/script.js

/**
 * Main JavaScript file for the GameDB website.
 * Handles data loading, table rendering, search, filter, sort, and pagination.
 *
 * This project is intended for a portfolio and will be published on GitHub Pages.
 * Automated tests with Playwright are planned for future iterations.
 */

// --- Global Variables ---
// All games data loaded from JSON
let allGames = [];
// Games currently displayed after search/filter/sort
let filteredAndSortedGames = [];
// Current page number for pagination
let currentPage = 1;
// Number of games to display per page
const gamesPerPage = 20; // Set to a smaller number for testing with dummy data if needed, e.g., 2
const ageRatingSystems = ['ESRB', 'PEGI', 'USK', 'CERO']; // Defined age rating systems to display


// --- DOM Elements ---
const gameListContainer = document.getElementById('game-list');
const paginationControls = document.getElementById('pagination-controls');
const searchInput = document.getElementById('search-input');
const genreFilter = document.getElementById('genre-filter');
const gamemodeFilter = document.getElementById('gamemode-filter');
const sortBy = document.getElementById('sort-by');


// Funkcja inicjalizująca nagłówek
async function initHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    try {
        const response = await fetch('./src/components/header.html');
        if (!response.ok) throw new Error('Failed to load header');
        headerPlaceholder.innerHTML = await response.text();

        // Mocna asekuracja, po Dodanie podstawowego stylowania, jeśli header nie zawiera własnych styli
        // const headerElement = headerPlaceholder.querySelector('header');
        // if (headerElement) {
        //     headerElement.classList.add('bg-gray-900', 'text-white', 'p-4', 'shadow-md');
        // }

        initMenu();
    } catch (error) {
        console.error('Error loading header:', error);
        // mocna asekuracja AI. Fallback - podstawowy header
        // headerPlaceholder.innerHTML = `
        //     <header class="bg-gray-900 text-white p-4 shadow-md">
        //         <h1 class="text-xl font-bold">GameDB</h1>
        //         <p class="text-sm text-gray-400">Basic header fallback</p>
        //     </header>
        // `;
    }
}

// Funkcja ładująca footer
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    try {
        const response = await fetch('./src/components/footer.html');
        if (!response.ok) throw new Error('Failed to load footer');
        footerPlaceholder.innerHTML = await response.text();

        // // Dodanie podstawowego stylowania, jeśli footer nie zawiera własnych styli
        // const footerElement = footerPlaceholder.querySelector('footer');
        // if (footerElement) {
        //     footerElement.classList.add('bg-gray-900', 'text-white', 'p-4', 'mt-8', 'border-t', 'border-gray-800');
        // }
    } catch (error) {
        console.error('Error loading footer:', error);
        // // Fallback - podstawowy footer
        // footerPlaceholder.innerHTML = `
        //     <footer class="bg-gray-900 text-white p-4 mt-8 border-t border-gray-800">
        //         <p class="text-center text-sm text-gray-400">© ${new Date().getFullYear()} GameDB - Basic footer fallback</p>
        //     </footer>
        // `;
    }
}

// Funkcja obsługująca menu
function initMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    const desktopMenuButton = document.getElementById('desktop-menu-button');
    const desktopDropdown = document.getElementById('desktop-dropdown');

    // Funkcja pomocnicza do zarządzania obramowaniem
    const toggleButtonBorder = (button, isActive) => {
        if (button) {
            button.classList.toggle('border-blue-400', isActive);
            button.classList.toggle('border-transparent', !isActive);
        }
    };

    // Obsługa menu mobilnego
    if (mobileMenuButton && mobileDropdown) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = mobileDropdown.classList.toggle('hidden');

            // Aktualizacja obramowania
            toggleButtonBorder(mobileMenuButton, !isOpening);

            // Ustawienie pozycji menu
            if (!isOpening) {
                const rect = mobileMenuButton.getBoundingClientRect();
                mobileDropdown.style.top = `${rect.bottom + window.scrollY + 10}px`;
                mobileDropdown.style.right = `${window.innerWidth - rect.right}px`;
            }
        });
    }

    // Obsługa menu desktopowego
    if (desktopMenuButton && desktopDropdown) {
        desktopMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = desktopDropdown.classList.toggle('hidden');

            // Aktualizacja obramowania
            toggleButtonBorder(desktopMenuButton, !isOpening);
        });
    }

    // Zamykanie menu po kliknięciu poza nim
    document.addEventListener('click', (e) => {
        // Sprawdzanie menu mobilnego
        if (mobileDropdown && !mobileDropdown.contains(e.target) &&
            mobileMenuButton && !mobileMenuButton.contains(e.target)) {
            mobileDropdown.classList.add('hidden');
            toggleButtonBorder(mobileMenuButton, false);
        }

        // Sprawdzanie menu desktopowego
        if (desktopDropdown && !desktopDropdown.contains(e.target) &&
            desktopMenuButton && !desktopMenuButton.contains(e.target)) {
            desktopDropdown.classList.add('hidden');
            toggleButtonBorder(desktopMenuButton, false);
        }
    });

    // Obsługa zmiany rozmiaru okna
    window.addEventListener('resize', () => {
        // Reset menu mobilnego na desktopie
        if (window.innerWidth >= 768 && mobileDropdown) {
            mobileDropdown.classList.add('hidden');
            toggleButtonBorder(mobileMenuButton, false);
        }

        // Reset menu desktopowego na mobile
        if (window.innerWidth < 768 && desktopDropdown) {
            desktopDropdown.classList.add('hidden');
            toggleButtonBorder(desktopMenuButton, false);
        }
    });

    // Inicjalizacja początkowa - upewniamy się, że obramowanie jest wyłączone
    toggleButtonBorder(mobileMenuButton, false);
    toggleButtonBorder(desktopMenuButton, false);
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    loadFooter();
});


// --- Utility Functions ---

/**
 * Fetches game data from the local JSON file.
 * @returns {Promise<Array>} A promise that resolves with an array of game objects.
 * @throws {Error} If the network response is not ok.
 */
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

/**
 * Formats game data for consistent display.
 * Extracts relevant fields and handles nested objects/arrays according to display requirements.
 * @param {Object} game - The raw game object from the JSON.
 * @returns {Object} A formatted game object with flattened and processed data.
 */
function formatGameData(game) {
    // Helper to extract names from nested arrays like genres, game_modes, etc.
    const extractNames = (arr, key) => arr && arr.length > 0 ? arr.map(item => item[key].name).filter(Boolean).join(', ') : 'N/A';

    // Check for 'Co-op' and 'Split screen' in game modes
    const gameModesNames = game.game_modes ? game.game_modes.map(mode => mode.game_mode.name).filter(Boolean) : [];
    const hasOfflineCoOp = gameModesNames.includes('Co-op') ? 'Yes' : 'No';
    const hasSplitScreen = gameModesNames.includes('Split screen') ? 'Yes' : 'No';

    // Format Age Ratings
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

    // Format Videos (take the first one, link to YouTube)
    const firstVideo = game.videos && game.videos.length > 0 ? game.videos[0] : null;
    const formattedVideo = firstVideo ?
        `${firstVideo.name}: https://www.youtube.com/watch?v=${firstVideo.video_id}` :
        'No video available.';

    // Format Websites (all links, each in new line with a dash)
    const formattedWebsites = game.websites && game.websites.length > 0 ?
        game.websites.map(site => `- ${site.url}`).join('<br>') :
        'No websites available.';

    return {
        id: game.id,
        name: game.name || 'Unknown Title',
        storyline: game.storyline || 'No storyline available.',
        summary: game.summary || 'No summary available.',
        rating: game.total_rating ? game.total_rating.toFixed(1) : 'N/A', // Format rating to one decimal place
        totalRatingCount: game.total_rating_count ? game.total_rating_count.toLocaleString() : 'N/A', // Format with locale-specific thousands separator
        gameModes: extractNames(game.game_modes, 'game_mode'),
        keywords: extractNames(game.keywords, 'keyword'),
        languages: extractNames(game.language_supports, 'language'),
        genres: extractNames(game.genres, 'genre'),
        offlineCoOp: hasOfflineCoOp,
        splitScreen: hasSplitScreen,
        perspectives: extractNames(game.player_perspectives, 'player_perspective'),
        platforms: extractNames(game.platforms, 'platform'),
        screenshots: game.screenshots && game.screenshots.length > 0 ? game.screenshots[0].url : 'no-screenshot.jpg', // Use first screenshot URL
        ageRatings: formattedAgeRatings, // Object with specific age rating strings
        video: formattedVideo,
        websites: formattedWebsites
    };
}


/**
 * Renders a single game item (row in the "table").
 * @param {Object} game - The formatted game object.
 * @returns {HTMLElement} The created game item DOM element.
 */
function renderGameItem(game) {
    const gameItem = document.createElement('div');
    // Apply Tailwind classes for the 'table row' look
    gameItem.className = 'game-item bg-gray-800 p-4 rounded-lg shadow-md mb-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200';
    gameItem.dataset.gameId = game.id; // Store ID for click handling

    // Display age ratings: ESRB, PEGI, USK, CERO
    const ageRatingDisplay = ageRatingSystems.map(system =>
        `<p class="mb-1">${game.ageRatings[system] || `${system}: N/A`}</p>`
    ).join('');

    // Basic view (always visible)
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
            <p class="mb-2"><span class="font-semibold text-blue-300">Video:</span> <a href="${game.video.split(': ')[1] || '#'}" target="_blank" class="text-blue-400 hover:underline">${game.video}</a></p>
            <div class="mb-2"><span class="font-semibold text-blue-300">Website URLs:</span><br>${game.websites}</div>
            ${game.screenshots !== 'no-screenshot.jpg' ? `<img src="${game.screenshots}" alt="Screenshot of ${game.name}" class="mt-4 rounded-lg max-w-full h-auto">` : ''}
        </div>
    `;

    // Add click event listener to toggle details
    gameItem.addEventListener('click', () => {
        const details = gameItem.querySelector('.game-details');
        details.classList.toggle('hidden');
        // Optional: Add an icon to indicate expansion/collapse
        // e.g., gameItem.querySelector('.expand-icon').classList.toggle('rotate-180');
    });

    return gameItem;
}

/**
 * Renders the games for the current page and updates pagination controls.
 * This function is called after filtering, sorting, or page changes.
 */
function renderGames() {
    gameListContainer.innerHTML = ''; // Clear previous games

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToDisplay = filteredAndSortedGames.slice(startIndex, endIndex);

    if (gamesToDisplay.length === 0) {
        gameListContainer.innerHTML = '<p class="text-center text-gray-400 text-lg mt-8">No games found matching your criteria.</p>';
        paginationControls.innerHTML = ''; // Hide pagination if no games
        return;
    }

    gamesToDisplay.forEach(game => {
        const formattedGame = formatGameData(game); // Format data just before rendering
        gameListContainer.appendChild(renderGameItem(formattedGame));
    });

    renderPaginationControls();
}

/**
 * Renders pagination buttons.
 */
function renderPaginationControls() {
    paginationControls.innerHTML = ''; // Clear previous controls
    const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);

    if (totalPages <= 1) { // Hide pagination if only one page or less
        return;
    }

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        renderGames();
        window.scrollTo(0, 0); // Scroll to top of page for better UX
    });
    paginationControls.appendChild(prevButton);

    // Page number buttons (simplified logic for many pages to avoid too many buttons)
    const maxPageButtons = 5; // Max number of page buttons to show (e.g., 1 ... 4 5 6 ... 10)
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
            window.scrollTo(0, 0); // Scroll to top of page
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

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        renderGames();
        window.scrollTo(0, 0); // Scroll to top of page
    });
    paginationControls.appendChild(nextButton);
}


/**
 * Handles search functionality.
 */
// Using debounce for search input to prevent excessive function calls on rapid typing
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFiltersAndSort(); // No need to pass query, it's read directly from input
    }, 300); // 300ms delay after user stops typing
});

/**
 * Handles filter change (e.g., genre or game mode).
 */
genreFilter.addEventListener('change', applyFiltersAndSort);
gamemodeFilter.addEventListener('change', applyFiltersAndSort);

/**
 * Handles sort order change.
 */
sortBy.addEventListener('change', applyFiltersAndSort);


/**
 * Applies all active filters, search query, and sort order to the global games array.
 * Then triggers rendering.
 */
function applyFiltersAndSort() {
    let currentGames = [...allGames]; // Start with a fresh copy of all games

    const searchQuery = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;
    const selectedGameMode = gamemodeFilter.value;
    const sortValue = sortBy.value;

    // 1. Apply Search
    if (searchQuery) {
        currentGames = currentGames.filter(game =>
            game.name.toLowerCase().includes(searchQuery) ||
            (game.storyline && game.storyline.toLowerCase().includes(searchQuery)) ||
            (game.summary && game.summary.toLowerCase().includes(searchQuery)) ||
            // Check keywords field from formatted data, which is a string
            (formatGameData(game).keywords !== 'N/A' && formatGameData(game).keywords.toLowerCase().includes(searchQuery))
        );
    }

    // 2. Apply Filters (Genre and Game Mode)
    // Filter based on the formatted string versions of genres and game modes
    if (selectedGenre) {
        currentGames = currentGames.filter(game => formatGameData(game).genres.includes(selectedGenre));
    }

    if (selectedGameMode) {
        currentGames = currentGames.filter(game => formatGameData(game).gameModes.includes(selectedGameMode));
    }

    // 3. Apply Sort
    currentGames.sort((a, b) => {
        // Use raw data for sorting as it's typically numeric or direct string comparison
        // and avoid re-formatting for every comparison if possible.
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
        return 0; // No sort or invalid value
    });

    // Update the global filtered and sorted array
    filteredAndSortedGames = currentGames;
    currentPage = 1; // Reset to first page after applying filters/sort/search
    renderGames(); // Re-render the games with new data
}

/**
 * Populates filter dropdowns with unique options from the loaded game data.
 */
function populateFilters() {
    const allGenres = new Set();
    const allGameModes = new Set();

    allGames.forEach(game => {
        // We need to format the data temporarily to get the joined string values for filters
        const formatted = formatGameData(game);

        formatted.genres.split(', ').forEach(genre => {
            if (genre !== 'N/A' && genre.trim() !== '') allGenres.add(genre.trim());
        });
        formatted.gameModes.split(', ').forEach(mode => {
            if (mode !== 'N/A' && mode.trim() !== '') allGameModes.add(mode.trim());
        });
    });

    // Populate Genre filter
    genreFilter.innerHTML = '<option value="">All Genres</option>'; // Reset
    Array.from(allGenres).sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    // Populate Game Mode filter
    gamemodeFilter.innerHTML = '<option value="">All Game Modes</option>'; // Reset
    Array.from(allGameModes).sort().forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        gamemodeFilter.appendChild(option);
    });
}


// --- Initialization ---
/**
 * Initializes the application.
 * Fetches data, populates filters, and renders the initial game list.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch all game data
    allGames = await fetchGameData();

    // 2. Populate filter dropdowns based on all loaded games
    populateFilters();

    // 3. Initialize filteredAndSortedGames with all games and render the first page
    filteredAndSortedGames = [...allGames]; // Start with all games
    renderGames();
});