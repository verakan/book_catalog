const API_BASE = 'https://openlibrary.org'; // Base URL for Open Library API endpoints

// Error type constants
export const ERROR_EMPTY_QUERY = 'EMPTY_QUERY';
export const ERROR_NETWORK = 'NETWORK_ERROR';
export const ERROR_NOT_FOUND = 'NOT_FOUND';
// Search function
export async function searchBooks(query) {
  // Check for empty or insufficient input
  if (!query || query.trim().length < 2) {
    throw new Error(ERROR_EMPTY_QUERY);
  }
  // Sanitize input - trim whitespace and convert to lowercase for consistent matching
  const searchQuery = query.trim().toLowerCase();
  // Define three search strategies to maximize relevant results (title, author, general keyword)
  const urls = [
    `${API_BASE}/search.json?title=${encodeURIComponent(searchQuery)}&limit=15`,
    `${API_BASE}/search.json?author=${encodeURIComponent(searchQuery)}&limit=10`,
    `${API_BASE}/search.json?q=${encodeURIComponent(searchQuery)}&limit=20`
  ];
  // Execute all three API requests in parallel for better performance
  try {
    const responses = await Promise.all(
      urls.map(url => 
        fetch(url)
          .then(res => res.ok ? res.json() : { docs: [] })
          .catch(() => { throw new Error(ERROR_NETWORK); })
      )
    );
    // Extract book arrays from each response (or empty array if missing)
    const titleBooks = responses[0].docs || [];
    const authorBooks = responses[1].docs || [];
    const generalBooks = responses[2].docs || [];
    // Use Map to deduplicate books by their unique key
    const uniqueBooks = new Map();
    // Process title search results
    titleBooks.forEach(book => {
      const title = (book.title || '').toLowerCase();
      const relevance = title.includes(searchQuery) ? 100 : 50;
      if (!uniqueBooks.has(book.key) || relevance > (uniqueBooks.get(book.key)?.relevance || 0)) {
        uniqueBooks.set(book.key, { ...book, relevance });
      }
    });
    // Process author search results
    authorBooks.forEach(book => {
      const authors = (book.author_name || []).join(' ').toLowerCase();
      const relevance = authors.includes(searchQuery) ? 80 : 40;
      if (!uniqueBooks.has(book.key) || relevance > (uniqueBooks.get(book.key)?.relevance || 0)) {
        uniqueBooks.set(book.key, { ...book, relevance });
      }
    });
    // Process general search results
    generalBooks.forEach(book => {
      if (!uniqueBooks.has(book.key)) {
        uniqueBooks.set(book.key, { ...book, relevance: 20 });
      }
    });
    // Convert Map to array, sort by relevance (highest first)
    let books = Array.from(uniqueBooks.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 30);
    // Apply final relevance filter to ensure all books actually match the search query
    books = filterRelevantBooks(books, searchQuery);
    
    // If no books remain after filtering, throw not found error
    if (books.length === 0) {
      throw new Error(ERROR_NOT_FOUND);
    }
    // Transform raw API data into consistent
    return books.map(book => ({
      id: book.key,
      title: book.title || 'Untitled',
      author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
      firstPublishYear: book.first_publish_year || null,
      coverId: book.cover_i || null,
      coverUrl: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}.jpg`
        : null,
    }));
    
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
// Filters books to ensure they are relevant to the search query
function filterRelevantBooks(books, searchQuery) {
  // Split query into individual terms for partial matching
  const searchTerms = searchQuery.toLowerCase().split(' ');
  
  return books.filter(book => {
    const title = (book.title || '').toLowerCase();
    const authors = (book.author_name || []).join(' ').toLowerCase();
    // Check if any search term matches
    const hasMatch = searchTerms.some(term => 
      title.includes(term) || authors.includes(term)
    );
    
    return hasMatch;
  });
}
// Specialized search function - searches only by exact title match
export async function searchByTitleExact(title) {
  const url = `${API_BASE}/search.json?title=${encodeURIComponent(title)}&limit=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Title search error:', error);
    return [];
  }
}
// Specialized search function - searches only by exact author match
export async function searchByAuthorExact(author) {
  const url = `${API_BASE}/search.json?author=${encodeURIComponent(author)}&limit=20`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Author search error:', error);
    return [];
  }
}