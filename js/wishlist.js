const wishListAddInWishlistPage = () => {
  const existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishlistContainer = document.getElementById("wishlistContainer");
  wishlistContainer.innerHTML = ``;
  existingWishlist?.forEach((book) => {
    const authorName = book?.authors[0]?.name || "Unknown Author";
    const coverImage = book?.formats["image/jpeg"] || "";
    const bookID = book?.id;
    const title = book?.title;

    // Create the card HTML with improved design and layout
    const cardHTML = `
        <div data-aos="fade-up" data-aos-duration="3000" class="border border-gray-300 bg-white shadow-md hover:shadow-lg rounded-lg p-4 mb-6 w-full">
          
       <div class = "flex items-center gap-4">
          <!-- Book Cover -->
          <div class="  flex-shrink-0 w-1/2">
            <img src="${coverImage}" alt="Book Cover" class="w-full h-[150px] object-cover rounded-md">
          </div>
          
          <!-- Book Information -->
          <div class="w-1/2">
            <!-- Title Section -->
            <h2 class="font-semibold text-lg text-[#1C2238] truncate mb-2">
              ${title}
            </h2>
            
            <!-- Author Section -->
            <div class="text-sm text-gray-600 flex items-center mb-2">
              <span class="font-medium">Author:</span>
              <span class="ml-2 truncate">${authorName}</span>
            </div>
            
            <!-- ID Section -->
            <div class="text-sm text-gray-600 flex items-center">
              <span class="font-medium ">ID:</span>
              <span class="ml-2 truncate">${bookID}</span>
            </div>
          </div>
       </div>
      <div onClick ="removeFromLocalStorage(${bookID})" class = "flex justify-end">
      <button class= "bg-indigo-100 text-indigo-600 px-12 py-3 rounded-md">Remove</button>
      </div>
        </div>
      `;

    // Append the card to the wishlist container
    wishlistContainer.innerHTML += cardHTML;
  });
};

const removeFromLocalStorage = (bookID) => {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((item) => item.id !== bookID);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  wishListAddInWishlistPage();
  totalwishlist()
};

const totalwishlist = () => {
  const totalItems = JSON.parse(localStorage.getItem("wishlist"))?.length || 0;
  document.getElementById("totalwishlist").innerText = `Total Items : ${totalItems}`;
};

totalwishlist();
wishListAddInWishlistPage();
