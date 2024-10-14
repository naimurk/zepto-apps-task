let currentPage = 1;
let fetchedData = null;
const cardContainer = document.getElementById("cardContainer");
const loadingContainer = document.getElementById("loading");
const bookCardContainer = document.getElementById("bookCard");

const fetchBooks = () => {
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

      // Clear the bookCardContainer
      bookCardContainer.innerHTML = ``;

      // Loop through each book in the fetched data and create the card
      fetchedData.results.forEach((book) => {
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
    })
    .catch((error) => console.error("Error fetching books:", error));
};

fetchBooks();
