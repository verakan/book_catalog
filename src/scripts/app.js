import '../styles/main.css'; // Import styles
// Import API functions for book searching
import { searchBooks, searchByTitleExact, searchByAuthorExact } from './api.js'; 
// Import storage functions for favorites management
import { getFavorites, toggleFavorite, removeFromFavorites } from './storage.js'; 
// Import UI rendering functions
import { renderSearchResults, renderFavorites, updateFavoriteButton, showLoading, showError, clearError } from './ui.js'; 

// Search input field where users type their queries
const searchInput = document.getElementById('searchInput');
// Button that triggers the search
const searchBtn = document.getElementById('searchBtn');
// Dropdown for selecting search type 
const searchTypeSelect = document.getElementById('searchTypeSelect');
// Dropdown for sorting results (by author, year, title)
const sortSelect = document.getElementById('sortSelect');

// Timer for debouncing search input
let debounceTimer;
// Currently displayed results
let currentResults = [];
// Original results before sorting 
let originalResults = [];

//Initializes the application
function init() {
  loadAndRenderFavorites(); //Load favorites from localStorage and display in sidebar
  setupEventListeners(); // Set up all event handlers for user interactions
  loadDefaultBooks(); // Load default books 
}
// Sets up all event listeners for user interactions
function setupEventListeners() {
  // Search button click handler
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput?.value.trim() || '';
      performSearch(query);
    });
  }
  // Search input handler with debouncing
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      // Clear previous timer to reset debounce delay
      clearTimeout(debounceTimer);
      // Only search if query has at least 2 characters
      if (query.length >= 2) {
        // Wait 500ms after user stops typing before searching
        debounceTimer = setTimeout(() => {
          performSearch(query);
        }, 500);
      } else if (query.length === 0) {
        // If search is cleared, load default books
        loadDefaultBooks();
      }
    });
    // Enter key handler for immediate search
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        performSearch(query);
      }
    });
  }
  // Search type change handler
  if (searchTypeSelect) {
    searchTypeSelect.addEventListener('change', () => {
      const query = searchInput?.value.trim();
      if (query && query.length >= 2) {
        performSearch(query);
      }
    });
  }
  
  // Handle sort dropdown changes
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      if (originalResults.length > 0) {
        // Sort the original results and re-render
        const sorted = sortBooks(originalResults, sortSelect.value);
        currentResults = sorted;
        renderSearchResults(sorted, handleFavoriteToggle);
        updateResultsCount(sorted.length);
      }
    });
  }
}

// Sorts books based on selected sort type
function sortBooks(books, sortType) {
  const sorted = [...books];
  
  switch(sortType) {
    case 'author_asc':
      // Sort by author name A-Z
      return sorted.sort((a, b) => {
        const authorA = a.author.toLowerCase();
        const authorB = b.author.toLowerCase();
        if (authorA < authorB) return -1;
        if (authorA > authorB) return 1;
        return 0;
      });
      
    case 'author_desc':
      // Sort by author name Z-A
      return sorted.sort((a, b) => {
        const authorA = a.author.toLowerCase();
        const authorB = b.author.toLowerCase();
        if (authorA > authorB) return -1;
        if (authorA < authorB) return 1;
        return 0;
      });
      
    case 'year_asc':
      // Sort by publication year (oldest first)
      return sorted.sort((a, b) => {
        const yearA = a.firstPublishYear || 9999;
        const yearB = b.firstPublishYear || 9999;
        return yearA - yearB;
      });
      
    case 'year_desc':
      // Sort by publication year (newest first)
      return sorted.sort((a, b) => {
        const yearA = a.firstPublishYear || 0;
        const yearB = b.firstPublishYear || 0;
        return yearB - yearA;
      });
      
    case 'title_asc':
      // Sort by title A-Z
      return sorted.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      
    default:
      // Default case 
      return sorted;
  }
}
// Performs book search based on query and selected search type
async function performSearch(query) {
  showLoading(true); // Show loading spinner
  clearError(); // Clear any previous error messages
  
  const searchType = searchTypeSelect?.value || 'all';
  try {
    let books = [];
    // Execute appropriate search based on selected type
    switch(searchType) {
      case 'title':
        // Search only by title
        const titleResults = await searchByTitleExact(query);
        books = titleResults.map(book => formatBook(book));
        break;
      case 'author':
        // Search only by author
        const authorResults = await searchByAuthorExact(query);
        books = authorResults.map(book => formatBook(book));
        break;
      default:
        // General search
        books = await searchBooks(query);
    }
    
    // Store original results for sorting reference
    originalResults = books;
    
    // Apply current sorting preference
    const currentSort = sortSelect?.value || 'relevance';
    const sortedBooks = sortBooks(books, currentSort);
    currentResults = sortedBooks;
    // Render results to the page
    renderSearchResults(sortedBooks, handleFavoriteToggle);
    showLoading(false);
    updateResultsCount(books.length);
    // Show error message if no books found
    if (books.length === 0) {
      showError(`No books found for "${query}". Try a different search term.`);
    }
  } catch (error) {
    console.error('Search failed:', error);
    showLoading(false);
    showError(error.message || 'Search failed. Please try again.');
  }
}
// Updates the results count display
function updateResultsCount(count) {
  const resultsCountSpan = document.getElementById('resultsCount');
  if (resultsCountSpan) {
    if (count > 0) {
      resultsCountSpan.textContent = `Found ${count} book${count !== 1 ? 's' : ''}`;
    } else {
      resultsCountSpan.textContent = '';
    }
  }
}
// Formats raw API book data into consistent application format
function formatBook(book) {
  return {
    id: book.key, // Unique identifier
    title: book.title || 'Untitled', // Book title with fallback
    author: book.author_name ? book.author_name.join(', ') : 'Unknown Author', // Handle multiple authors
    firstPublishYear: book.first_publish_year || null, // Publication year 
    coverId: book.cover_i || null, // Cover image ID
    // Construct full cover URL
    coverUrl: book.cover_i  
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}.jpg`
      : null,
  };
}
// Loads default books to display when page first loads or search is cleared
async function loadDefaultBooks() {
  showLoading(true);
  clearError();
  
  try {
    // First attempt: load best sellers
    const books = await searchBooks('best sellers');
    if (books && books.length > 0) {
      // Success with best sellers
      originalResults = books;
      const currentSort = sortSelect?.value || 'relevance';
      const sortedBooks = sortBooks(books, currentSort);
      currentResults = sortedBooks;
      renderSearchResults(sortedBooks, handleFavoriteToggle);
      updateResultsCount(books.length);
    } else {
      // Fallback: load classic books if best sellers fails
      const classics = await searchBooks('pride and prejudice');
      originalResults = classics;
      const currentSort = sortSelect?.value || 'relevance';
      const sortedBooks = sortBooks(classics, currentSort);
      currentResults = sortedBooks;
      renderSearchResults(sortedBooks, handleFavoriteToggle);
      updateResultsCount(classics.length);
    }
    showLoading(false);
  } catch (error) {
    console.error('Failed to load default books:', error);
    showLoading(false);
  }
}
// Handles favorite button toggle on book cards
function handleFavoriteToggle(book, buttonElement) {
  const result = toggleFavorite(book);
  
  if (result.success) {
    const isNowFavorite = result.action === 'added';
    // Update the button visual state
    updateFavoriteButton(book.id, isNowFavorite);
    // Refresh the favorites sidebar
    loadAndRenderFavorites();
  }
}
// Handles removal of a book from favorites
function handleRemoveFromFavorites(bookId) {
  const success = removeFromFavorites(bookId);
  
  if (success) {
    // Update any visible favorite buttons
    updateFavoriteButton(bookId, false);
    // Refresh the favorites sidebar
    loadAndRenderFavorites();
  }
}
// Loads favorites from localStorage and renders them in the sidebar
function loadAndRenderFavorites() {
  const favorites = getFavorites();
  renderFavorites(favorites, handleRemoveFromFavorites);
}
// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);