let currentPage = 1; // Initially set to 1
let fetchedData = null;
let allSubjects = [];
let allBookshelves = [];
let selectedSubject = "";
let selectedBookshelf = "";

const booksPerPage = 32;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");
const paginationContainer = document.getElementById("pagination");

const searchInput = document.createElement("input");
const resetButton = document.createElement("button");

// Dropdowns for subjects and bookshelves
const subjectDropdown = document.createElement("select");
const bookshelfDropdown = document.createElement("select");

// Search input styling and placement
searchInput.placeholder = "Search by title...";
searchInput.classList.add(
  "w-full",
  "p-2",
  "border",
  "border-gray-300",
  "rounded",
  "mb-6",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-indigo-500"
);
cardContainer.insertBefore(searchInput, bookCardContainer);

// Reset button styling and placement
resetButton.textContent = "Reset";
resetButton.classList.add(
  "ml-2",
  "p-2",
  "bg-gray-300",
  "hover:bg-gray-400",
  "rounded",
  "cursor-pointer",
  "transition-colors",
  "duration-300"
);
resetButton.style.display = "none";
cardContainer.insertBefore(resetButton, bookCardContainer);

// Subject dropdown styling
subjectDropdown.classList.add(
  "w-full",
  "p-2",
  "border",
  "border-gray-300",
  "rounded",
  "mb-6"
);
subjectDropdown.innerHTML = `<option value="">Select Subject</option>`;
cardContainer.insertBefore(subjectDropdown, bookCardContainer);

// Bookshelf dropdown styling
bookshelfDropdown.classList.add(
  "w-full",
  "p-2",
  "border",
  "border-gray-300",
  "rounded",
  "mb-6"
);
bookshelfDropdown.innerHTML = `<option value="">Select Bookshelf</option>`;
cardContainer.insertBefore(bookshelfDropdown, bookCardContainer);

// Fetch books function
const fetchBooks = () => {
  // console.log(`Fetching data for page: ${currentPage}`); // Add console log to see the current page
  fetch(`https://gutendex.com/books?page=${currentPage}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      fetchedData = data;
      // console.log(data);

      cardContainer.classList.remove("hidden");
      loadingContainer.classList.add("hidden");
      // console.log({data : data , currentPage : currentPage})

      // Extract unique subjects and bookshelves
      extractSubjectsAndBookshelves(data.results);

      renderBooks(data.results); // Call renderBooks with fetched data

      // After rendering the books, create the pagination
      createPagination(data.count);
    })
    .catch((error) => console.error("Error fetching books:", error));
};

// Function to extract subjects and bookshelves
const extractSubjectsAndBookshelves = (books) => {
  allSubjects = [];
  allBookshelves = [];

  books.forEach((book) => {
    book.subjects.forEach((subject) => {
      if (!allSubjects.includes(subject)) {
        allSubjects.push(subject);
      }
    });

    book.bookshelves.forEach((bookshelf) => {
      if (!allBookshelves.includes(bookshelf)) {
        allBookshelves.push(bookshelf);
      }
    });
  });

  // console.log(allSubjects);
  // console.log(allBookshelves)

  // Populate subject dropdown
  subjectDropdown.innerHTML = `<option value="">Select Subject</option>`;
  allSubjects.forEach((subject) => {
    subjectDropdown.innerHTML += `<option value="${subject}">${subject}</option>`;
  });

  // Populate bookshelf dropdown
  bookshelfDropdown.innerHTML = `<option value="">Select Bookshelf</option>`;
  allBookshelves.forEach((bookshelf) => {
    bookshelfDropdown.innerHTML += `<option value="${bookshelf}">${bookshelf}</option>`;
  });
};

// Render books function
const renderBooks = (books) => {
  // console.log(books)
  // console.log(books)
  // Clear the bookCardContainer
  bookCardContainer.innerHTML = ``;
  // console.log(selectedSubject)
  // Filter based on selected subject and bookshelf
  const filteredBooks = books.filter((book) => {
    const matchesSubject =
      selectedSubject === "" || book.subjects.includes(selectedSubject);
    const matchesBookshelf =
      selectedBookshelf === "" || book.bookshelves.includes(selectedBookshelf);
    return matchesSubject && matchesBookshelf;
  });
  //  console.log(filteredBooks)
  // Loop through each book in the provided data and create the card
  filteredBooks.forEach((book) => {
    const authorName = book.authors[0]?.name || "Unknown Author";
    const coverImage = book.formats["image/jpeg"] || "";
    const genres = book.subjects.join(", ") || "Unknown Genre";
    const bookID = book.id;
    const thebook = {...book}
    // console.log(filteredBooks)
    // Create the card HTML
    const cardHTML = `
    <div class="book-card max-w-sm mx-auto bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div class="relative">
        <img src="${coverImage}" alt="Book Cover" class="book-cover w-full h-60 object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
        <div class="absolute bottom-4 left-4 text-white">
          <p class="font-semibold text-lg">ID: ${bookID}</p>
        </div>
        <!-- Love Icon for Wishlist -->
        <div  onclick = "toggleWishlist(${bookID})" class="absolute top-4 right-4">
          <i id="wishlist-icon-${bookID}" class="fa fa-heart ${
        isInWishlist(bookID) ? "text-blue-500" : "text-white"
    } cursor-pointer transition-colors duration-300" data-id="${bookID}"></i>
        </div>
      </div>
      <div class="p-6">
        <h2 class="book-title font-bold text-2xl text-gray-900 mb-3 hover:text-indigo-600 transition-colors duration-300">${
          book.title
        }</h2>
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
    liTag += `<button class="pagination-button bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 mr-2" onclick="movePage(${
      page - 1
    })">Prev</button>`;
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

    const active =
      page === plength ? "bg-indigo-500 text-white" : "bg-gray-200";
    liTag += `<button class="pagination-number mx-1 ${active} px-3 py-1 rounded-md hover:bg-gray-300" onclick="movePage(${plength})">${plength}</button>`;
  }

  if (page < totalPages - 1) {
    if (page < totalPages - 2) {
      liTag += `<span class="dots mx-1">...</span>`;
    }
    liTag += `<button class="pagination-number bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 mx-1" onclick="movePage(${totalPages})">${totalPages}</button>`;
  }

  if (page < totalPages) {
    liTag += `<button class="pagination-button bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 ml-2" onclick="movePage(${
      page + 1
    })">Next</button>`;
  }

  paginationContainer.innerHTML = liTag; // Add li tag inside the pagination container
};

// Move page function
const movePage = (pageNumber) => {
  cardContainer.classList.add("hidden");
  loadingContainer.classList.remove("hidden");
  selectedBookshelf = "";
  selectedSubject = "";
  currentPage = pageNumber;

  // Clear the search input when moving to a new page
  searchInput.value = "";
  resetButton.style.display = "none"; // Hide the reset button when search input is cleared

  fetchBooks(); // Fetch new books for the selected page
};

// Filter by subject
subjectDropdown.addEventListener("change", (e) => {
  selectedSubject = e.target.value;
  renderBooks(fetchedData.results); // Re-render books with the selected filter
});

// Filter by bookshelf
bookshelfDropdown.addEventListener("change", (e) => {
  selectedBookshelf = e.target.value;
  renderBooks(fetchedData.results); // Re-render books with the selected filter
});

// Event listener for search input
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  // Filter based on title or author
  const filteredBooks = fetchedData.results.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.authors[0]?.name.toLowerCase().includes(searchTerm)
  );
  console.log(filteredBooks);

  renderBooks(filteredBooks);

  // Show or hide reset button based on search input
  resetButton.style.display = searchTerm.length > 0 ? "inline-block" : "none";
});

// Reset button event listener
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  resetButton.style.display = "none";
  renderBooks(fetchedData.results); // Re-render books without any search filters
});

// Check if the book is in wishlist (localStorage)
const isInWishlist = (bookID) => {
  // const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  // return wishlist.some((book) => book.bookID === bookID);
};

// Toggle wishlist status (add/remove full book object in localStorage)
const toggleWishlist = (bookId) => {
  // console.log(book)
  const findTheData = fetchedData?.results?.find((book) => book.id ===bookId)
  console.log(findTheData)
  // console.log("gekki")
  // let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // const bookExists = wishlist.some((item) => item.bookID === book?.id);

  // if (bookExists) {
  //   // Remove the book from wishlist if it exists
  //   wishlist = wishlist.filter((item) => item.bookID !== book.id);
  //   document
  //     .getElementById(`wishlist-icon-${book.id}`)
  //     .classList.remove("text-blue-500");
  //   document
  //     .getElementById(`wishlist-icon-${book.id}`)
  //     .classList.add("text-white");
  // } else {
  //   // Add the book to wishlist if it doesn't exist
  //   wishlist.push(book);
  //   document
  //     .getElementById(`wishlist-icon-${book.id}`)
  //     .classList.remove("text-white");
  //   document
  //     .getElementById(`wishlist-icon-${book.id}`)
  //     .classList.add("text-blue-500");
  // }

  // // Save the updated wishlist to localStorage
  // localStorage.setItem("wishlist", JSON.stringify(wishlist));
};

fetchBooks(); // Initial call to fetch books
