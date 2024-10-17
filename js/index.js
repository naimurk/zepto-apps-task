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
// console.log(searchText);
const booksPerPage = 32;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");
const paginationContainer = document.getElementById("pagination");
const errorContainer = document.getElementById("errorMessage");

const searchInput = document.getElementById("searchText");
searchInput.value = searchText;
const resetButton = document.getElementById("reset");

const subjectDropdown = document.getElementById("selectSubject");

const bookshelfDropdown = document.getElementById("selectBookShelf");
resetButton.style.display = "none";
subjectDropdown.innerHTML = `<option value="">Select Subject</option>`;
bookshelfDropdown.innerHTML = `<option value="">Select Bookshelf</option>`;
const totalwishlist = document.getElementById("totalwishlist");
totalwishlist.innerText =
  JSON.parse(localStorage.getItem("wishlist"))?.length || 0;
let arr = [];
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
      errorContainer.classList.add("hidden");
      cardContainer.classList.remove("hidden");
      loadingContainer.classList.add("hidden");
      // document.getElementById("header").setAttribute("data-aos", "fade-right");

      // Extract unique subjects and bookshelves
      extractSubjectsAndBookshelves(data.results);

      renderBooks(data.results); // Call renderBooks with fetched data

      // After rendering the books, create the pagination
      createPagination(data.count);
    })
    .catch((error) => {
      ErrorHandling(error.message);
    });
};

const ErrorHandling = (msg) => {
  cardContainer.classList.add("hidden");
  loadingContainer.classList.add("hidden");
  errorContainer.classList.remove("hidden");
  document.getElementById(
    "errorM"
  ).innerText = `Something went wrong from the server ${msg}`;
};

const refetch = () => {
  errorContainer.classList.remove("hidden");
  window.location.reload();
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

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
// Render books function
const renderBooks = (books) => {
  // let arr = [];
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
  arr = [...filteredBooks];
  //  console.log(filteredBooks)
  // Loop through each book in the provided data and create the card
  arr?.forEach((book) => {
    const authorName = book?.authors[0]?.name || "Unknown Author";
    const coverImage = book?.formats["image/jpeg"] || "";
    const genres = book?.subjects || [];
    const bookID = book?.id;
    const title = book?.title;

    // Limit genres to a maximum of 4
    const displayedGenres = genres.slice(0, 4);
    const showMore = genres.length > 4;

    // Create the card HTML
    const cardHTML = `
    <div data-aos="fade-up" data-aos-duration="3000" class="border-2 relative bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-gray-200 rounded-lg p-5 min-h-[450px] max-h-[650px] flex flex-col justify-between">
      
      <!-- Wishlist Icon -->
      <div onclick="toggleWishlist(${bookID})" class="absolute cursor-pointer bg-indigo-100 w-10 h-10 p-2 rounded-full flex justify-center items-center  bottom-2 right-2">
        <i id="wishlist-icon-${bookID}" class="fa fa-heart  ${
      isInWishlist(bookID) ? "text-indigo-500" : "text-gray-400"
    } text-[20px] cursor-pointer duration-300"></i>
      </div>
  
      <!-- Book Cover -->
      <div class="flex justify-center ">
        <img src="${coverImage}" alt="Book Cover" class="w-full max-h-[300px] min-h-[300px] rounded-md object-cover">
      </div>
  
      <!-- Book Information -->
      <div class="pt-4 flex-grow">
        <div class="text-[14px] flex flex-col gap-y-3">
          
          <!-- ID Section -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-[#1C2238] w-[80px]">ID</p>
            <div class="flex items-center gap-x-2 text-[#7D8091]">
              <span>:</span>
              <span class="font-medium">${bookID}</span>
            </div>
          </div>
  
          <!-- Author Section -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-[#1C2238] w-[80px]">Author</p>
            <div class="flex items-center gap-x-2 text-[#7D8091]">
              <span>:</span>
              <span class="font-medium">${authorName}</span>
            </div>
          </div>
  
          <!-- Title Section with Truncated Text -->
          <div class="mt-3">
            <p class="font-semibold text-[#1C2238] text-[21px] leading-tight">
              ${truncateText(title, 27)}
            </p>
          </div>
  
          <!-- Genres Section -->
          <div class="mt-4">
            <p class="font-semibold text-[#1C2238]">Genres:</p>
            <div class="flex flex-wrap gap-2 mt-2">
              ${displayedGenres
                .map(
                  (genre) => `
                <button class="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors duration-300">${truncateText(
                  genre,
                  19
                )}</button>
              `
                )
                .join("")}
            </div>
            ${
              showMore
                ? `
              <button class="mt-2 text-sm text-indigo-600 hover:underline" onclick="showAllGenres(${bookID})">Show More</button>
            `
                : ""
            }
          </div>
          
        </div>
      </div>
    </div>
    `;

    // Append the card to the bookCardContainer
    bookCardContainer.innerHTML += cardHTML;
  });
};

function showAllGenres(bookID) {
  console.log("hello");
  // Logic to show all genres for the specific book
  const book = fetchedData?.results?.find((b) => b.id === bookID);
  const allGenres = book.subjects || [];
  // Create a modal or display section for all genres
  alert(`All Genres: ${allGenres.join(", ")}`); // Replace with your preferred way to display genres
}

// Function to show all genres in modal
// function showAllGenres(bookID) {
//   const book = arr.find((b) => b.id === bookID);
//   const genres = book?.subjects || [];

//   const genreList = document.getElementById("genreList");
//   genreList.innerHTML = genres
//     .map(
//       (genre) => `
//         <button class="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors duration-300">${truncateText(
//           genre,
//           19
//         )}</button>`
//     )
//     .join("");

//   // Show the modal
//   document.getElementById("genreModal").classList.remove("hidden");
// }

// Close Modal



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
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  return wishlist.some((book) => book.id == bookID);
};

// Toggle wishlist status (add/remove full book object in localStorage)
const toggleWishlist = (bookId) => {
  console.log("hello world");
  // console.log(bookId)
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
  totalwishlist.innerText =
    JSON.parse(localStorage.getItem("wishlist"))?.length || 0;
  // toggleWishlist(bookId);
  // const array = JSON.parse(arr);
  renderBooks([...arr]);
  // window.location.reload()
};

fetchBooks();
urlSet();

// Initial call to fetch books
