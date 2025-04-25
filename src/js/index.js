// active link toggle
const navLinks = document.querySelectorAll("nav a[href^='#']");
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active-link"));
    link.classList.add("active-link");
  });
});
const sideLinks = document.querySelectorAll("#sidebar a");
sideLinks.forEach(link => {
  link.addEventListener("click", () => {
    sideLinks.forEach(l => l.classList.remove("active-link"));
    link.classList.add("active-link");
  });
});

// display bestsellers
function loadBestsellers() {
  fetch("src/data.json")
    .then((res) => res.json())
    .then((data) => {
      const bestsellersContainer = document.getElementById("bestsellers-container");
      bestsellersContainer.innerHTML = "";

      data.menuItems.forEach((item) => {
        if (item.bestseller) {
          const isInWishlist = wishlist.some(wishlistItem => wishlistItem.id === item.id);

          const card = document.createElement("div");
          card.className = "bg-white shadow-md rounded-lg overflow-hidden";

          card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover" />
            <div class="p-4">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                <button class="wishlist-btn ${isInWishlist ? "active" : ""}" data-id="${item.id}" onclick="toggleWishlist(${JSON.stringify(item).replace(/"/g, "'")})">
                  <i class="${isInWishlist ? "fas" : "far"} fa-heart text-red-600"></i>
                </button>
              </div>
              <p class="text-sm text-gray-600 my-2">${item.details}</p>
              <div class="flex justify-between items-center">
                <span class="text-red-600 font-bold text-lg">${item.price} EGP</span>
                <button class="bg-red-600 rounded-full w-6 h-6 hover:bg-red-700 cursor-pointer"
                  onclick="addToCart(${JSON.stringify(item).replace(/"/g, "'")})">
                  <i class="fa-solid fa-plus text-white"></i>
                </button>
              </div>
            </div>
          `;

          bestsellersContainer.appendChild(card);
        }
      });

      showSection("bestsellers");
    })
    .catch((error) => console.error("Error loading bestsellers:", error));
}

// display Menu
function loadMenuItems() {
  fetch("src/data.json")
    .then((res) => res.json())
    .then((data) => {
      const items = data.menuItems;
      const menuContainer = document.getElementById("menu-container");
      menuContainer.innerHTML = "";

      const categories = [...new Set(items.map(item => item.category))];

      categories.forEach(category => {
        const categoryId = category.toLowerCase().replace(/\s+/g, "-");

        const section = document.createElement("div");
        section.className = "section py-5";
        section.id = categoryId; // ✅ خليه هنا عشان الـ sidebar links تشتغل

        section.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="items-${categoryId}">
    <h2 class="text-3xl font-bold text-center text-red-600 mb-8 col-span-full">${category}</h2>
  </div>
        `;
        menuContainer.appendChild(section);
      });

      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-lg overflow-hidden";

        const isInWishlist = wishlist.some(
          (wishlistItem) => wishlistItem.id === item.id
        );

        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover" />
          <div class="p-4">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
              <button class="wishlist-btn ${isInWishlist ? "active" : ""}" data-id="${item.id}" onclick="toggleWishlist(${JSON.stringify(item).replace(/"/g, "'")})">
                <i class="${isInWishlist ? "fas" : "far"} fa-heart text-red-600"></i>
              </button>
            </div>
            <p class="text-sm text-gray-600 my-2">${item.details}</p>
            <div class="flex justify-between items-center">
              <span class="text-red-600 font-bold text-lg">${item.price} EGP</span>
              <button class="bg-red-600 rounded-full w-6 h-6 hover:bg-red-700 cursor-pointer" onclick="addToCart(${JSON.stringify(item).replace(/"/g, "'")})">
                <i class="fa-solid fa-plus text-white"></i>
              </button>
            </div>
          </div>
        `;

        const containerId = "items-" + item.category.toLowerCase().replace(/\s+/g, "-");
        const container = document.getElementById(containerId);
        if (container) {
          container.appendChild(card);
        }
      });
    })
    .catch((error) => console.error("Error loading menu items:", error));
}


// Cart functionality
let cart = JSON.parse(localStorage.getItem("cart")) || [];
// display cart items
function displayCartItems() {
  const cartItemsList = document.getElementById("cart-items-list");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    cartItemsList.innerHTML = "";
    emptyCartMessage.classList.remove("hidden");
    cartTotal.classList.add("hidden");
    checkoutBtn.classList.add("hidden");
    return;
  }

  emptyCartMessage.classList.add("hidden");
  cartTotal.classList.remove("hidden");
  checkoutBtn.classList.remove("hidden");

  let total = 0;
  cartItemsList.innerHTML = cart
  .map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
  
    return `
      <div class="cart-item flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 py-4 gap-4">
        <div class="flex items-center w-full sm:w-auto">
          <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
          <div class="ml-4">
            <h3 class="font-bold text-base sm:text-lg">${item.name}</h3>
            <p class="text-gray-600 text-sm sm:text-base">${item.price} EGP</p>
          </div>
        </div>
        <div class="flex items-center justify-between w-full sm:w-auto">
          <div class="flex items-center">
            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="text-red-600 px-2 text-2xl font-bold cursor-pointer">-</button>
            <span class="mx-2 text-lg sm:text-xl font-bold">${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="text-red-600 px-2 text-2xl font-bold cursor-pointer">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})" class="ml-4 text-red-600 cursor-pointer text-xl">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  })
  .join("");
  

  document.getElementById("total-amount").textContent = total;
}
// Add item to cart
function addToCart(item) {
  const existingItem = cart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  displayCartItems();

  showNotification(`${item.name} added to cart!`);
}
// Remove from cart function
function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  displayCartItems();
}
// Update cart count
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-count-mobile").textContent = count;
}
// Update quantity
function updateQuantity(itemId, newQuantity) {
  const item = cart.find((item) => item.id === itemId);
  if (item) {
    item.quantity = newQuantity;
    if (item.quantity <= 0) {
      removeFromCart(itemId);
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      displayCartItems();
    }
  }
}



// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
// display wishlist items
function displayWishlistItems() {
  const wishlistItemsList = document.getElementById("wishlist-items-list");
  const emptyWishlistMessage = document.getElementById(
    "empty-wishlist-message"
  );

  if (wishlist.length === 0) {
    wishlistItemsList.innerHTML = "";
    emptyWishlistMessage.classList.remove("hidden");
    return;
  }

  emptyWishlistMessage.classList.add("hidden");

  wishlistItemsList.innerHTML = wishlist
    .map((item) => {
      return `
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <img src="${item.image}" alt="${
        item.name
      }" class="w-full h-48 object-cover" />
        <div class="p-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800">${item.name}</h3>
            <button class="wishlist-btn active" data-id="${
              item.id
            }" onclick="toggleWishlist(${JSON.stringify(item).replace(
        /"/g,
        "'"
      )})">
              <i class="fas fa-heart text-red-600"></i>
            </button>
          </div>
          <p class="text-sm text-gray-600 my-2">${item.details}</p>
          <div class="flex justify-between items-center">
            <span class="text-red-600 font-bold">${item.price.toFixed(
              2
            )} EGP</span>
            <button 
              class="bg-red-600 rounded-full w-6 h-6 hover:bg-red-700 cursor-pointer"
              onclick="addToCart(${JSON.stringify(item).replace(/"/g, "'")})"
            >
              <i class="fas fa-plus text-white"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}
// Update heart icon
function toggleWishlist(item) {
  const index = wishlist.findIndex(
    (wishlistItem) => wishlistItem.id === item.id
  );

  if (index === -1) {
    wishlist.push(item);
    showNotification(`${item.name} added to wishlist!`);
  } else {
    wishlist.splice(index, 1);
    showNotification(`${item.name} removed from wishlist!`);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  displayWishlistItems();

  const heartIcons = document.querySelectorAll(
    `.wishlist-btn[data-id="${item.id}"]`
  );
  heartIcons.forEach((icon) => {
    icon.classList.toggle("active", index === -1);
    icon.innerHTML =
      index === -1
        ? '<i class="fas fa-heart text-red-600"></i>'
        : '<i class="far fa-heart"></i>';
  });
}
// Update wishlist count
function updateWishlistCount() {
  const count = wishlist.length;
  document.getElementById("wishlist-count").textContent = count;
  document.getElementById("wishlist-count-mobile").textContent = count;
}


// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-20 right-4 bg-green-500 text-white px-4 py-3 text-lg rounded shadow-lg z-30";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Show/hide sections
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove("hidden");
    sessionStorage.setItem('currentSection', sectionId);
  }
}

// Set up event listeners for navigation
document.getElementById("wishlist-link").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("wishlist");
  displayWishlistItems();
});
document.querySelector(".wishlist-link-mobile").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("wishlist");
  loadMenuItems();
});
document.getElementById("cart-link").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("cart");
  displayCartItems();
});
document.querySelector(".cart-link-mobile").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("cart");
  displayCartItems();
});
document.getElementById("bestsellers-link").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("bestsellers");
  loadBestsellers();
});
document.getElementById("menu-link").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("menu");
  loadMenuItems();
});
document.getElementById("mobile-menu-button").addEventListener("click", () => {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("hidden");
});
document.querySelector(".bestsellers-link-mobile").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("bestsellers");
  loadBestsellers();
  document.getElementById("mobile-menu").classList.add("hidden");
});

document.querySelector(".menu-link-mobile").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("menu");
  loadMenuItems();
  document.getElementById("mobile-menu").classList.add("hidden");
});


// Load saved section on page load
window.addEventListener("DOMContentLoaded", () => {
  const currentSection = sessionStorage.getItem('currentSection') || "bestsellers";
  showSection(currentSection);
  
  if (currentSection === "cart") {
    displayCartItems();
  } else if (currentSection === "wishlist") {
    displayWishlistItems();
  } else if (currentSection === "bestsellers") {
    loadBestsellers();
  } else if (currentSection === "menu") {
    loadMenuItems();
  }
  
  updateCartCount();
  updateWishlistCount();
});


// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleWishlist = toggleWishlist;