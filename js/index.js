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
let animationCount = 0;
let arr = [];

const booksPerPage = 32;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");
const paginationContainer = document.getElementById("pagination");
const errorContainer = document.getElementById("errorMessage");
const searchInput = document.querySelectorAll(".searchText");
const resetButton = document.querySelectorAll(".reset");
const subjectDropdown = document.querySelectorAll(".selectSubject");
const bookshelfDropdown = document.querySelectorAll(".selectBookShelf");
const totalwishlist = document.getElementById("totalwishlist");

// set the value of the search
searchInput.forEach((el) => {
  el.value = searchText;
});

//  all reset buttons initialy nonoe
resetButton.forEach((el) => {
  el.style.display = "none";
});

//  set the selected subject and bookshelf
subjectDropdown.forEach((el) => {
  el.innerHTML = `<option value="">Select Subject</option>`;
});
bookshelfDropdown.forEach((el) => {
  el.innerHTML = `<option value="">Select Bookshelf</option>`;
});

//  set the initial total wishlist count
totalwishlist.innerText =
  JSON.parse(localStorage.getItem("wishlist"))?.length || 0;

// set the url based on current page
const urlSet = () => {
  const url = new URL(window.location);
  url.searchParams.set(
    "page",
    JSON.parse(localStorage.getItem("pageNumber")) || 1
  );
  window.history.pushState({}, "", url);
};


// fetch the data from the server
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

// Error Handling
const ErrorHandling = (msg) => {
  cardContainer.classList.add("hidden");
  loadingContainer.classList.add("hidden");
  errorContainer.classList.remove("hidden");
  document.getElementById(
    "errorM"
  ).innerText = `Something went wrong from the server ${msg}`;
};

// when error comes then again try to refetch the data
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

  subjectDropdown.forEach((el) => {
    el.innerHTML = `<option value="">Select Subject</option>`;
  });
  allSubjects.forEach((subject) => {
    subjectDropdown.forEach((el) => {
      el.innerHTML += `<option value="${subject}">${subject}</option>`;
    });
  });

  subjectDropdown.forEach((el) => {
    el.value = selectedSubject;
  });

  subjectDropdown.forEach((el) => {
    el.dispatchEvent(new Event("change"));
  });

  bookshelfDropdown.forEach((el) => {
    el.innerHTML = `<option value="">Select Bookshelf</option>`;
  });

  allBookshelves.forEach((bookshelf) => {
    bookshelfDropdown.forEach((el) => {
      el.innerHTML += `<option value="${bookshelf}">${bookshelf}</option>`;
    });
  });

  bookshelfDropdown.forEach((el) => {
    el.value = selectedBookshelf;
  });

  bookshelfDropdown.forEach((el) => {
    el.dispatchEvent(new Event("change"));
  });
};

// when text too long the funcion do small the text 
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Render books function
const renderBooks = (books) => {
  animationCount = animationCount + 1;

  // Clear the bookCardContainer
  bookCardContainer.innerHTML = ``;

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
    <div ${
      animationCount < 6 ? 'data-aos="fade-up" data-aos-duration="3000"' : ""
    } class="border-2 relative bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-gray-200 rounded-lg p-3 sm:p-5 min-h-[400px] max-h-[600px] flex flex-col justify-between">
      
      <!-- Wishlist Icon -->
      <div onclick="toggleWishlist(${bookID})" class="absolute cursor-pointer bg-indigo-100 w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2 rounded-full flex justify-center items-center bottom-2 right-2">
        <i id="wishlist-icon-${bookID}" class="fa fa-heart ${
      isInWishlist(bookID) ? "text-indigo-500" : "text-gray-400"
    } text-[18px] sm:text-[20px] cursor-pointer duration-300"></i>
      </div>
    
      <!-- Book Cover -->
      <div class="flex justify-center">
        <img src="${coverImage}" alt="Book Cover" class="w-full max-h-[250px] sm:max-h-[300px] min-h-[250px] sm:min-h-[300px] rounded-md object-cover">
      </div>
    
      <!-- Book Information -->
      <div class="pt-3 sm:pt-4 flex-grow">
        <div class="text-[12px] sm:text-[14px] flex flex-col gap-y-2 sm:gap-y-3">
          
          <!-- ID Section -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-[#1C2238] w-[70px] sm:w-[80px]">ID</p>
            <div class="flex items-center gap-x-1 sm:gap-x-2 text-[#7D8091]">
              <span>:</span>
              <span class="font-medium">${bookID}</span>
            </div>
          </div>
    
          <!-- Author Section -->
          <div class="flex justify-between items-center">
            <p class="font-semibold text-[#1C2238] w-[70px] sm:w-[80px]">Author</p>
            <div class="flex items-center gap-x-1 sm:gap-x-2 text-[#7D8091]">
              <span>:</span>
              <span class="font-medium">${authorName}</span>
            </div>
          </div>
    
          <!-- Title Section with Truncated Text -->
          <div class="mt-2 sm:mt-3">
            <p class="font-semibold text-[#1C2238] text-[18px] sm:text-[21px] leading-tight">
              ${truncateText(title, 22)}
            </p>
          </div>
    
          <!-- Genres Section -->
          <div class="mt-3 sm:mt-4">
            <p class="font-semibold text-[#1C2238]">Genres:</p>
            <div class="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
              ${displayedGenres
                .map(
                  (genre) => `
                  <button class="text-xs px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors duration-300">${truncateText(
                    genre,
                    15
                  )}</button>
                `
                )
                .join("")}
            </div>
            ${
              showMore
                ? `
              <button class="mt-2 text-xs sm:text-sm text-indigo-600 hover:underline" onclick="showAllGenres(${bookID})">Show More</button>
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

// Open modal function
function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

// Close modal function
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Load all genres into modal (optional, depending on how you want to show genres)
function showAllGenres(bookID) {
  const book = arr.find((book) => book.id === bookID); // Assuming 'arr' is your book array
  const allGenres = book.subjects || [];

  const modalContent = document.getElementById("modalContent");
  modalContent.innerHTML = allGenres
    .map(
      (genre) => `
    <span class="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-500 hover:text-white transition-colors duration-300">
      ${genre}
    </span>
  `
    )
    .join("");

  openModal(); // Open modal after populating it
}



// Create pagination based on total items
const createPagination = (totalBooks) => {
  const totalPages = Math.ceil(totalBooks / booksPerPage); // Calculate total pages
  let page = currentPage;

  let liTag = "";
  let beforePage = page - 1;
  let afterPage = page + 1;

  paginationContainer.innerHTML = ""; // Clear previous pagination

  if (page > 1) {
    liTag += `<button class="pagination-button bg-gray-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-gray-300 mr-1 sm:mr-2 text-sm sm:text-base" onclick="movePage(${
      page - 1
    })">Prev</button>`;
  }

  if (page > 2) {
    liTag += `<button class="pagination-button bg-gray-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-gray-300 mx-1 sm:mx-2 text-sm sm:text-base" onclick="movePage(1)">1</button>`;
    if (page > 3) {
      liTag += `<span class="dots mx-1 sm:mx-2 text-sm sm:text-base">...</span>`;
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
    liTag += `<button class="pagination-number mx-1 sm:mx-2 ${active} px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-gray-300 text-sm sm:text-base" onclick="movePage(${plength})">${plength}</button>`;
  }

  if (page < totalPages - 1) {
    if (page < totalPages - 2) {
      liTag += `<span class="dots mx-1 sm:mx-2 text-sm sm:text-base">...</span>`;
    }
    liTag += `<button class="pagination-number bg-gray-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-gray-300 mx-1 sm:mx-2 text-sm sm:text-base" onclick="movePage(${totalPages})">${totalPages}</button>`;
  }

  if (page < totalPages) {
    liTag += `<button class="pagination-button bg-gray-200 px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-gray-300 ml-1 sm:ml-2 text-sm sm:text-base" onclick="movePage(${
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
  // searchInput.value = "";
  searchInput.forEach((el) => {
    el.value = "";
  });
  resetButton.forEach((el) => {
    el.style.display = "none";
  });
  urlSet();
  fetchBooks(); // Fetch new books for the selected page
};

// corresponding data inject in subject selector
subjectDropdown.forEach((el) => {
  // Filter by subject
  el.addEventListener("change", (e) => {
    selectedSubject = e.target.value;
    localStorage.setItem("selectedSubject", JSON.stringify(selectedSubject));
    renderBooks(fetchedData.results); // Re-render books with the selected filter
  });
});

// corresponding data inject in bookshelf selector
bookshelfDropdown.forEach((el) => {
  // Filter by bookshelf
  el.addEventListener("change", (e) => {
    selectedBookshelf = e.target.value;
    localStorage.setItem(
      "selectedBookshelf",
      JSON.stringify(selectedBookshelf)
    );
    renderBooks(fetchedData.results); // Re-render books with the selected filter
  });
});

// Event listener for search input

searchInput.forEach((el) => {
  el.addEventListener("input", () => {
    searchText = el.value;
    localStorage.setItem("searchTerm", JSON.stringify(searchText));
    resetButton.forEach((el) => {
      el.style.display = searchText ? "block" : "none";
    });

    renderBooks(fetchedData.results); // Re-render books with the selected search filter
  });
});

// Reset button event listener
resetButton.forEach((el) => {
  el.addEventListener("click", () => {
    searchInput.forEach((el) => {
      el.value = "";
    });
    searchText = "";
    localStorage.setItem("searchTerm", JSON.stringify(""));

    el.style.display = "none";
    renderBooks(fetchedData.results); // Re-render books without any search filters
  });
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

// Initial call to fetch books and url set
