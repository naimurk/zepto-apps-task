let currentPage = Number(JSON.parse(localStorage.getItem("pageNumber"))) || 1; // Initially set to 1
let fetchedData = null;
let allSubjects = [];
let allBookshelves = [];
let selectedSubject = JSON.parse(localStorage.getItem("selectedSubject")) || "";
let selectedBookshelf =
  JSON.parse(localStorage.getItem("selectedBookshelf")) || "";
let searchText =
  localStorage.getItem("searchTerm") === null
    ? ""
    : JSON.parse(localStorage.getItem("searchTerm"));
console.log(searchText);
const booksPerPage = 32;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");
const paginationContainer = document.getElementById("pagination");

const searchInput = document.getElementById("searchText");
searchInput.value = searchText;
const resetButton = document.getElementById("reset");

const subjectDropdown = document.getElementById("selectSubject");

const bookshelfDropdown = document.getElementById("selectBookShelf");
resetButton.style.display = "none";
subjectDropdown.innerHTML = `<option value="">Select Subject</option>`;
bookshelfDropdown.innerHTML = `<option value="">Select Bookshelf</option>`;
const totalwishlist = document.getElementById("totalwishlist")
totalwishlist.innerText = JSON.parse(localStorage.getItem("wishlist"))?.length || 0;

const urlSet = () => {
  const url = new URL(window.location);
  url.searchParams.set(
    "page",
    JSON.parse(localStorage.getItem("pageNumber")) || 1
  );
  window.history.pushState({}, "", url);
};
const fetchBooks = () => {
  // console.log(`Fetching data for page: ${currentPage}`); /// Add console log to see the current page
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


  subjectDropdown.innerHTML = `<option value="">Select Subject</option>`;
  allSubjects.forEach((subject) => {
    subjectDropdown.innerHTML += `<option value="${subject}">${subject}</option>`;
  });

  subjectDropdown.value = selectedSubject;
  subjectDropdown.dispatchEvent(new Event("change"));

  bookshelfDropdown.innerHTML = `<option value="">Select Bookshelf</option>`;
  allBookshelves.forEach((bookshelf) => {
    bookshelfDropdown.innerHTML += `<option value="${bookshelf}">${bookshelf}</option>`;
  });

  bookshelfDropdown.value = selectedBookshelf;
  bookshelfDropdown.dispatchEvent(new Event("change"));
};

// Render books function
const renderBooks = (books) => {
  // console.log("hello world");
  // console.log(books)
  // console.log(books)
  // Clear the bookCardContainer
  bookCardContainer.innerHTML = ``;
  // console.log(selectedSubject)
  // Filter based on selected subject and bookshelf
  //  const searchText = localStorage.getItem("se")
  // book.title.toLowerCase().includes(searchTerm) ||
  // book.authors[0]?.name.toLowerCase().includes(searchTerm)

  const filteredBooks = books?.filter((book) => {
    const matchText =
      searchText === "" ||
      book.title
        .toLowerCase()
        .includes(
          JSON.parse(localStorage.getItem("searchTerm")).toLowerCase()
        ) ||
      book.authors[0]?.name
        .toLowerCase()
        .includes(JSON.parse(localStorage.getItem("searchTerm")).toLowerCase());

    const matchesSubject =
      selectedSubject === "" || book?.subjects?.includes(selectedSubject);
    const matchesBookshelf =
      selectedBookshelf === "" ||
      book?.bookshelves?.includes(selectedBookshelf);
    return matchText && matchesSubject && matchesBookshelf;
  });
  //  console.log(filteredBooks)
  // Loop through each book in the provided data and create the card
  filteredBooks.forEach((book) => {
    const authorName = book.authors[0]?.name || "Unknown Author";
    const coverImage = book.formats["image/jpeg"] || "";
    const genres = book.subjects.join(", ") || "Unknown Genre";
    const bookID = book.id;
    const thebook = { ...book };
    // console.log(filteredBooks)
    // Create the card HTML
    const cardHTML = `
    <div class="border border-red-300">
      <div class="relative">
        <img src="${coverImage}" alt="Book Cover" class="">
        <div class="">
          <p class="">ID: ${bookID}</p>
        </div>
        <!-- Love Icon for Wishlist -->
        <div  onclick = "toggleWishlist(${bookID})" class="">
          <i id="wishlist-icon-${bookID}" class="fa fa-heart ${
      isInWishlist(bookID) ? "text-blue-500" : "text-white"
    } " data-id="${bookID}"></i>
        </div>
      </div>
      <div class="">
        <h2 class=" ">${
          book.title
        }</h2>
        <p class="">Author: <span class="">${authorName}</span></p>
        <p class="">Genre: ${genres}</p>
        <button class="">Read More</button>
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
  searchText = "";
  localStorage.setItem("selectedBookshelf", JSON.stringify(""));
  localStorage.setItem("selectedSubject", JSON.stringify(""));
  localStorage.setItem("searchTerm", JSON.stringify(""));
  currentPage = pageNumber;
  localStorage.setItem("pageNumber", JSON.stringify(pageNumber));
  searchInput.value = "";
  resetButton.style.display = "none";
  urlSet();
  fetchBooks(); // Fetch new books for the selected page
};

// Filter by subject
subjectDropdown.addEventListener("change", (e) => {
  selectedSubject = e.target.value;
  localStorage.setItem("selectedSubject", JSON.stringify(selectedSubject));
  renderBooks(fetchedData.results); // Re-render books with the selected filter
});

// Filter by bookshelf
bookshelfDropdown.addEventListener("change", (e) => {
  selectedBookshelf = e.target.value;
  localStorage.setItem("selectedBookshelf", JSON.stringify(selectedBookshelf));
  renderBooks(fetchedData.results); // Re-render books with the selected filter
});

// Event listener for search input
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  // Filter based on title or author
  localStorage.setItem("searchTerm", JSON.stringify(searchInput.value));
  const filteredBooks = fetchedData.results.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.authors[0]?.name.toLowerCase().includes(searchTerm)
  );

  renderBooks(filteredBooks);

  // Show or hide reset button based on search input
  resetButton.style.display = searchTerm.length > 0 ? "inline-block" : "none";
});

// Reset button event listener
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  searchText = "";
  localStorage.setItem("searchTerm", JSON.stringify(""));
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
  const findTheData = fetchedData?.results?.find((book) => book.id === bookId);
  // console.log(findTheData)
  // console.log("gekki")
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const bookExists = wishlist.some((item) => item.id === bookId);

  if (bookExists) {
    // Remove the book from wishlist if it exists
    wishlist = wishlist.filter((item) => item.id !== bookId);
    document
      .getElementById(`wishlist-icon-${bookId}`)
      .classList.remove("text-blue-500");
    document
      .getElementById(`wishlist-icon-${bookId}`)
      .classList.add("text-white");
  } else {
    // Add the book to wishlist if it doesn't exist
    wishlist.push(findTheData);
    document
      .getElementById(`wishlist-icon-${bookId}`)
      .classList.remove("text-white");
    document
      .getElementById(`wishlist-icon-${bookId}`)
      .classList.add("text-blue-500");
  }

  // Save the updated wishlist to localStorage
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  totalwishlist.innerText = JSON.parse(localStorage.getItem("wishlist"))?.length || 0;

};

fetchBooks();
urlSet();
// Initial call to fetch books
