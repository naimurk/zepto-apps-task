let currentPage = 1; // Initially set to 1
let fetchedData = null;
const booksPerPage = 32;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.createElement("input");
const resetButton = document.createElement("button");

// Search input styling and placement
searchInput.placeholder = "Search by title...";
searchInput.classList.add("w-full", "p-2", "border", "border-gray-300", "rounded", "mb-6", "focus:outline-none", "focus:ring-2", "focus:ring-indigo-500");
cardContainer.insertBefore(searchInput, bookCardContainer);

// Reset button styling and placement
resetButton.textContent = "Reset";
resetButton.classList.add("ml-2", "p-2", "bg-gray-300", "hover:bg-gray-400", "rounded", "cursor-pointer", "transition-colors", "duration-300");
resetButton.style.display = "none";
cardContainer.insertBefore(resetButton, bookCardContainer);

// Fetch books function
const fetchBooks = () => {
  console.log(`Fetching data for page: ${currentPage}`); // Add console log to see the current page
  fetch(`https://gutendex.com/books?page=${currentPage}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      fetchedData = data;
      console.log(data);

      cardContainer.classList.remove("hidden");
      loadingContainer.classList.add("hidden");

      renderBooks(data.results); // Call renderBooks with fetched data

      // After rendering the books, create the pagination
      createPagination(data.count);
    })
    .catch((error) => console.error("Error fetching books:", error));
};

// Render books function
const renderBooks = (books) => {
  // Clear the bookCardContainer
  bookCardContainer.innerHTML = ``;

  // Loop through each book in the provided data and create the card
  books.forEach((book) => {
    const authorName = book.authors[0]?.name || "Unknown Author";
    const coverImage = book.formats["image/jpeg"] || "";
    const genres = book.subjects.join(", ") || "Unknown Genre";
    const bookID = book.id;

    // Create the card HTML
    const cardHTML = `
      <div class="book-card max-w-sm mx-auto bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
        <div class="relative">
          <img src="${coverImage}" alt="Book Cover" class="book-cover w-full h-60 object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div class="absolute bottom-4 left-4 text-white">
            <p class="font-semibold text-lg">ID: ${bookID}</p>
          </div>
        </div>
        <div class="p-6">
          <h2 class="book-title font-bold text-2xl text-gray-900 mb-3 hover:text-indigo-600 transition-colors duration-300">${book.title}</h2>
          <p class="book-author text-md text-gray-700 mb-2">Author: <span class="font-medium text-gray-900">${authorName}</span></p>
          <p class="book-genre text-sm text-gray-500 mb-4">Genre: ${genres}</p>
          <button class="mt-4 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md shadow-md transition-all duration-300">Read More</button>
        </div>
      </div>
    `;

    // Append the card to the bookCardContainer
    bookCardContainer.innerHTML += cardHTML;
  });
};

// Create pagination based on total items
const createPagination = (totalBooks) => {
  const totalPages = Math.ceil(totalBooks / booksPerPage); // Calculate total pages
  let page = currentPage;

  let liTag = "";
  let beforePage = page - 1;
  let afterPage = page + 1;

  paginationContainer.innerHTML = ""; // Clear previous pagination

  if (page > 1) {
    liTag += `<button class="pagination-button bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 mr-2" onclick="movePage(${page - 1})">Prev</button>`;
  }

  if (page > 2) {
    liTag += `<button class="pagination-button bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 mx-1" onclick="movePage(1)">1</button>`;
    if (page > 3) {
      liTag += `<span class="dots mx-1">...</span>`;
    }
  }

  // For first and last pages
  if (page === totalPages) {
    beforePage -= 2;
  } else if (page === totalPages - 1) {
    beforePage -= 1;
  }

  if (page === 1) {
    afterPage += 2;
  } else if (page === 2) {
    afterPage += 1;
  }

  for (let plength = beforePage; plength <= afterPage; plength++) {
    if (plength > totalPages) continue;
    if (plength == 0) plength = 1;

    const active = page === plength ? "bg-indigo-500 text-white" : "bg-gray-200";
    liTag += `<button class="pagination-number mx-1 ${active} px-3 py-1 rounded-md hover:bg-gray-300" onclick="movePage(${plength})">${plength}</button>`;
  }

  if (page < totalPages - 1) {
    if (page < totalPages - 2) {
      liTag += `<span class="dots mx-1">...</span>`;
    }
    liTag += `<button class="pagination-number bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 mx-1" onclick="movePage(${totalPages})">${totalPages}</button>`;
  }

  if (page < totalPages) {
    liTag += `<button class="pagination-button bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 ml-2" onclick="movePage(${page + 1})">Next</button>`;
  }

  paginationContainer.innerHTML = liTag; // Add li tag inside the pagination container
};

// Handle page movement
const movePage = (page) => {
  cardContainer.classList.add("hidden");
  loadingContainer.classList.remove("hidden");
  currentPage = page;
  fetchBooks();
};

// Fetch books initially
fetchBooks();

// Real-time search function
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filteredBooks = fetchedData.results.filter((book) =>
    book.title.toLowerCase().includes(query)
  );
  renderBooks(filteredBooks);

  // Show reset button if there's input in the search bar
  if (query.length > 0) {
    resetButton.style.display = "inline-block";
  } else {
    resetButton.style.display = "none";
  }
});

// Reset button functionality
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  renderBooks(fetchedData.results); // Render original books data
  resetButton.style.display = "none"; // Hide reset button after reset
});
