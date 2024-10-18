let animationCount = 0
const wishListAddInWishlistPage = () => {
  animationCount++
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
    <div ${animationCount < 2 ? 'data-aos="fade-up" data-aos-duration="3000"' : ""} class="border border-gray-300 bg-white shadow-md hover:shadow-lg rounded-lg p-4 mb-6 w-full">
      
      <!-- Flex container for Book Cover and Book Information -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Book Cover -->
        <div class="w-full sm:w-1/3 flex-shrink-0">
          <img src="${coverImage}" alt="Book Cover" class="w-full h-[150px] object-cover rounded-md">
        </div>
        
        <!-- Book Information -->
        <div class="w-full sm:w-2/3">
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
            <span class="font-medium">ID:</span>
            <span class="ml-2 truncate">${bookID}</span>
          </div>
        </div>
      </div>
  
      <!-- Remove Button -->
      <div onClick="removeFromLocalStorage(${bookID})" class="flex justify-end mt-4">
        <button class="bg-indigo-100 text-indigo-600 px-6 sm:px-12 py-2 sm:py-3 rounded-md">
          Remove
        </button>
      </div>
    </div>
  `;
  

    // Append the card to the wishlist container
    wishlistContainer.innerHTML += cardHTML;
  });
//  console.log(animationCount)
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
