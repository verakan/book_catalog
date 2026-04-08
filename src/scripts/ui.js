import { isFavorite } from './storage.js';

export function getCoverHtml(book, isCompact = false) {
  // If cover URL exists, create an img element with error fallback
  if (book.coverUrl) {
    return `<img class="${isCompact ? 'favorite-item-cover' : 'book-cover'}" src="${book.coverUrl}" alt="Cover of ${escapeHtml(book.title)}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'${isCompact ? 'favorite-item-cover-placeholder' : 'book-cover-placeholder'}\'><span class=\'no-cover-text\'>no cover</span></div>'">`;
  }
  // Fallback placeholder when no cover image is available
  return `<div class="${isCompact ? 'favorite-item-cover-placeholder' : 'book-cover-placeholder'}">
    <span class="no-cover-text">No cover</span>
  </div>`;
}
//  Creates a book card element for the main books grid
export function createBookCard(book, onFavoriteClick) {
   // Create card container
  const card = document.createElement('div');
  card.className = 'book-card';
  card.dataset.bookId = book.id;
  // Check if book is already in favorites
  const isFav = isFavorite(book.id);
  const year = book.firstPublishYear || 'Year unknown';
  const coverHtml = getCoverHtml(book, false);
  
  // Card HTML structure
  card.innerHTML = `
    ${coverHtml}
    <div class="book-info">
      <h3 class="book-title">${escapeHtml(book.title)}</h3>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <div class="book-meta">
        <span class="book-year">${escapeHtml(String(year))}</span>
      </div>
    </div>
    <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${book.id}">
      <span class="heart-icon">${isFav ? '❤️' : '♡'}</span>
    </button>
  `;
  // Attach event listener to favorite button
  const favBtn = card.querySelector('.favorite-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onFavoriteClick(book, favBtn);
  });
  
  return card;
}
// Creates a compact favorite item for the sidebar
export function createFavoriteItem(book, onRemove) {
  // Create favorite item container
  const item = document.createElement('div');
  item.className = 'favorite-item';
  item.dataset.bookId = book.id;
  
  const year = book.firstPublishYear || 'Unknown';
  const coverHtml = getCoverHtml(book, true);
  // Favorite item HTML
  item.innerHTML = `
    ${coverHtml}
    <div class="favorite-item-info">
      <h4 class="favorite-item-title">${escapeHtml(book.title)}</h4>
      <p class="favorite-item-author">${escapeHtml(book.author)}</p>
      <span class="favorite-item-year">${escapeHtml(String(year))}</span>
    </div>
    <button class="remove-fav-btn" data-id="${book.id}">✕</button>
  `;
  // Attach remove event listener
  const removeBtn = item.querySelector('.remove-fav-btn');
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove(book.id);
  });
  
  return item;
}
// Renders search results in the main books grid
export function renderSearchResults(books, onFavoriteClick) {
  // Get DOM elements
  const container = document.getElementById('booksGrid');
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  // Hide loading spinner
  if (loading) loading.style.display = 'none';
  // Handle empty results case
  if (!books || books.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (resultsCount) resultsCount.textContent = '';
    if (container) {
      const existingCards = container.querySelectorAll('.book-card');
      existingCards.forEach(card => card.remove());
    }
    return;
  }
  // Hide empty state and update results count
  if (emptyState) emptyState.style.display = 'none';
  if (resultsCount) resultsCount.textContent = `${books.length} books found`;
  // Clear existing cards before rendering new ones
  const existingCards = container.querySelectorAll('.book-card');
  existingCards.forEach(card => card.remove());
  // Render each book as a card
  books.forEach(book => {
    const card = createBookCard(book, onFavoriteClick);
    container.appendChild(card);
  });
}
// Renders the favorites list in the sidebar
export function renderFavorites(favorites, onRemove) {
  const container = document.getElementById('favoritesList');
  const countSpan = document.getElementById('favoritesCount');
  const emptyFavs = document.getElementById('emptyFavorites');
  // Update favorites count badge
  if (countSpan) {
    countSpan.textContent = `${favorites.length} book${favorites.length !== 1 ? 's' : ''}`;
  }
  
  if (!container) return;
  // Handle empty favorites case
  if (!favorites || favorites.length === 0) {
    if (emptyFavs) emptyFavs.style.display = 'block';
    const existingItems = container.querySelectorAll('.favorite-item');
    existingItems.forEach(item => item.remove());
    return;
  }
  // Hide empty state message
  if (emptyFavs) emptyFavs.style.display = 'none';
  // Clear existing favorite items
  const existingItems = container.querySelectorAll('.favorite-item');
  existingItems.forEach(item => item.remove());
  // Render each favorite
  favorites.forEach(book => {
    const item = createFavoriteItem(book, onRemove);
    container.appendChild(item);
  });
}
// Updates the favorite button state for a specific book
export function updateFavoriteButton(bookId, isActive) {
  const buttons = document.querySelectorAll('.favorite-btn');
  buttons.forEach(btn => {
    if (btn.dataset.id === bookId) {
      const heartSpan = btn.querySelector('.heart-icon');
      if (isActive) {
        btn.classList.add('active');
        if (heartSpan) heartSpan.textContent = '❤️';
      } else {
        btn.classList.remove('active');
        if (heartSpan) heartSpan.textContent = '♡';
      }
    }
  });
}
// Shows or hides the loading spinner
export function showLoading(show) {
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
  // Hide empty state when loading to prevent overlap
  if (show && emptyState) {
    emptyState.style.display = 'none';
  }
}
// Displays an error message
export function showError(message) {
  const container = document.getElementById('booksGrid');
  const loading = document.getElementById('loading');
  
  clearError(); // Remove any existing error messages
  
  if (loading) loading.style.display = 'none';
  // Clear existing book cards
  if (container) {
    const existingCards = container.querySelectorAll('.book-card');
    existingCards.forEach(card => card.remove());
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'empty-state';
    errorDiv.id = 'errorMessage';
    errorDiv.innerHTML = `
      <h3>Error</h3>
      <p>${escapeHtml(message)}</p>
    `;
    container.appendChild(errorDiv);
  }
}
// Clears all error and state messages from the books
export function clearError() {
  const container = document.getElementById('booksGrid');
  if (container) {
    const errorDiv = container.querySelector('#errorMessage');
    if (errorDiv) errorDiv.remove();
    const networkDiv = container.querySelector('#networkErrorMessage');
    if (networkDiv) networkDiv.remove();
    const emptyDiv = container.querySelector('#emptyQueryMessage');
    if (emptyDiv) emptyDiv.remove();
    const notFoundDiv = container.querySelector('#notFoundMessage');
    if (notFoundDiv) notFoundDiv.remove();
  }
}
// Shows a message prompting user to enter a search term
export function showEmptyQueryMessage() {
  const container = document.getElementById('booksGrid');
  const loading = document.getElementById('loading');
  const resultsCount = document.getElementById('resultsCount');
  
  if (loading) loading.style.display = 'none';
  if (resultsCount) resultsCount.textContent = '';
  
  if (container) {
    // Clear existing cards
    const existingCards = container.querySelectorAll('.book-card');
    existingCards.forEach(card => card.remove());
    
    // Remove old message if exists
    const oldMsg = container.querySelector('#emptyQueryMessage');
    if (oldMsg) oldMsg.remove();
    // Create new message
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.id = 'emptyQueryMessage';
    emptyDiv.innerHTML = `
      <h3>Enter a search term</h3>
      <p>Please type a book title, author name, or keyword to start searching</p>
      <small>Try: "Harry Potter", "Tolkien", or "1984"</small>
    `;
    container.appendChild(emptyDiv);
  }
}
// Shows network error message with retry button
export function showNetworkErrorMessage() {
  const container = document.getElementById('booksGrid');
  const loading = document.getElementById('loading');
  const resultsCount = document.getElementById('resultsCount');
  
  if (loading) loading.style.display = 'none';
  if (resultsCount) resultsCount.textContent = '';
  
  if (container) {
    // Clear existing cards
    const existingCards = container.querySelectorAll('.book-card');
    existingCards.forEach(card => card.remove());
    // Remove old network error message
    const oldMsg = container.querySelector('#networkErrorMessage');
    if (oldMsg) oldMsg.remove();
    // Create network error with retry button
    const errorDiv = document.createElement('div');
    errorDiv.className = 'empty-state';
    errorDiv.id = 'networkErrorMessage';
    errorDiv.innerHTML = `
      <h3>Network Error</h3>
      <p>Unable to connect to the Open Library API</p>
      <small>Please check your internet connection and try again</small>
      <button onclick="location.reload()" style="margin-top:16px; padding:8px 20px; background:#3b82f6; color:white; border:none; border-radius:30px; cursor:pointer;">⟳ Retry</button>
    `;
    container.appendChild(errorDiv);
  }
}
// Shows "no results found" message for a specific search query
export function showNotFoundMessage(query) {
  const container = document.getElementById('booksGrid');
  const loading = document.getElementById('loading');
  const resultsCount = document.getElementById('resultsCount');
  
  if (loading) loading.style.display = 'none';
  if (resultsCount) resultsCount.textContent = 'No results found';
  
  if (container) {
    // Clear existing cards
    const existingCards = container.querySelectorAll('.book-card');
    existingCards.forEach(card => card.remove());
    // Remove old not found message
    const oldMsg = container.querySelector('#notFoundMessage');
    if (oldMsg) oldMsg.remove();
    // Create not found message with search term
    const notFoundDiv = document.createElement('div');
    notFoundDiv.className = 'empty-state';
    notFoundDiv.id = 'notFoundMessage';
    notFoundDiv.innerHTML = `
      <h3>No books found</h3>
      <p>We couldn't find any books matching "${escapeHtml(query)}"</p>
      <small>Try a different search term or check your spelling</small>
    `;
    container.appendChild(notFoundDiv);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}