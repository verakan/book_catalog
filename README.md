# The Library  
A modern, responsive web application for discovering books using the Open Library API. Users can search for books by title, author, or keywords, save favorites to localStorage, and sort results by various criteria.
## Task
The original task document: https://drive.google.com/file/d/1RBRcuH-_oAvtjem5Xs0c4NXZ8I38aYyH/view   
Core Requirements:
- Integration with Open Library API
- Search functionality (title, author, general)
- Favorites system with localStorage persistence
- Sorting capabilities (author, year, title)
- Clean, modern UI with animations
## How to Run the App
### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
### Installation & Setup
1. Clone the repository  
git clone <your-repository-url>  
cd book_catalog
2. Install dependencies
npm install
3. Development mode
npm run dev
The application will open automatically at localhost.
## Project Structure  
| Folder | Type of Files | Description |
|--------|--------------|-------------|
| src/ | Source code | All original, unminified source files including HTML, CSS, and JavaScript. |
| src/styles/ | CSS files | Contains main.css with global styles, component-specific styling, responsive design rules, animations, and utility classes. |
| src/scripts/ | JavaScript modules | Modular JS files organized by responsibility: api.js (API communication), storage.js (localStorage operations), ui.js (DOM rendering), and app.js (main application logic). |
| Root directory | Configuration files | Contains webpack.config.js (bundling configuration), package.json (npm dependencies and scripts), package-lock.json (dependency lock file), and this README.md documentation. |  

Module Responsibilities
- app.js - Main controller: initializes app, handles user events, coordinates between modules
- api.js - Data layer: makes fetch requests to Open Library API, formats responses
- storage.js - Persistence layer: manages favorites in localStorage (CRUD operations)
- ui.js - View layer: creates DOM elements, renders books, updates UI states

Features
- Smart Search - Combines title, author, and keyword searches with relevance scoring
- Real-time Input - Debounced search (500ms delay) to optimize API calls
- Multiple Sort Options - By author (A-Z/Z-A), year (oldest/newest), title (A-Z)
- Favorites System - Add/remove books with localStorage persistence
- Responsive Design - Adapts to desktop, tablet, and mobile screens
- Loading States - Spinner animations during API requests
- Error Handling - Network errors, empty queries, no results found
