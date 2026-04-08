const STORAGE_KEY = 'the_library_favorites'; // Storage key for localStorage
// Retrieves all favorited books from localStorage
export function getFavorites() {
  try {
    // Get stored JSON string from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return empty array if no favorites exist yet
    if (!stored) return [];
    // Parse and return the stored favorites array
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}
// Adds a book to favorites list in localStorage
export function addToFavorites(book) {
  try {
    // Get current favorites list
    const favorites = getFavorites();
    // Prevent duplicate entries 
    if (isFavorite(book.id)) {
      return false;
    }
    // Create a book object
    const bookToSave = {
      id: book.id,
      title: book.title,
      author: book.author,
      firstPublishYear: book.firstPublishYear,
      coverId: book.coverId,
      coverUrl: book.coverUrl,
      addedAt: new Date().toISOString(),
    };
    // Add to favorites array and save back to localStorage
    favorites.push(bookToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Handle any errors
    console.error('Failed to add to favorites:', error);
    return false;
  }
}
// Removes a book from favorites
export function removeFromFavorites(bookId) {
  try {
    // Get current favorites list
    const favorites = getFavorites();
    // Filter out the book with matching ID
    const filtered = favorites.filter(book => book.id !== bookId);
    // Check if any book was actually removed
    if (filtered.length === favorites.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    // Handle any errors
    console.error('Failed to remove from favorites:', error);
    return false;
  }
}
// Checks if a specific book is in favorites
export function isFavorite(bookId) {
  // Get all favorites and check if any match the given ID
  const favorites = getFavorites();
  return favorites.some(book => book.id === bookId);
}
// Toggles a book's favorite status
export function toggleFavorite(book) {
  // Check current favorite status
  if (isFavorite(book.id)) {
    // Book is favorited - remove it
    const success = removeFromFavorites(book.id);
    return { action: 'removed', success };
  } else {
    // Book is not favorited - add it
    const success = addToFavorites(book);
    return { action: 'added', success };
  }
}