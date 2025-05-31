// UNCHANGED: Firebase config and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWSqKybfAXCBN7OnVZ1ZB8aSLq5EIHNz8",
  authDomain: "cake-shop-website-41ff4.firebaseapp.com",
  projectId: "cake-shop-website-41ff4",
  storageBucket: "cake-shop-website-41ff4.firebasestorage.app",
  messagingSenderId: "585132960880",
  appId: "1:585132960880:web:10534929624be96c77d8b5",
  measurementId: "G-75YKD9LL2F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allProducts = [];
let selectedCategory = "all";
let selectedTier = "";
let selectedSort = "best";

// Fetch products from Firestore
async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, "Products"));
  allProducts = [];
  querySnapshot.forEach((doc) => {
    allProducts.push({ ...doc.data(), id: doc.id });
  });
  renderProducts();
}

// Filtering, sorting, and rendering logic
function renderProducts() {
  let products = allProducts.slice();

  // --- DEBUG LOGS: Remove or comment out when working ---
  console.log("SelectedCategory:", selectedCategory, "SelectedTier:", selectedTier);
  products.forEach(p =>
    console.log("Product:", p.name, "| Category:", p.category, "| Tier:", p.tier)
  );
  // ------------------------------------------------------

  // Robust cake filtering: normalize category and tier
  if (selectedCategory === "cakes") {
    if (selectedTier && selectedTier.trim() !== "") {
      products = products.filter(p =>
        (p.category || "").toLowerCase().replace(/s$/, "").trim() === "cake" &&
        (p.tier || "").toLowerCase().trim() === selectedTier.toLowerCase().trim()
      );
    } else {
      products = products.filter(p =>
        (p.category || "").toLowerCase().replace(/s$/, "").trim() === "cake"
      );
    }
  } else if (selectedCategory !== "all") {
    products = products.filter(p =>
      (p.category || "").toLowerCase().trim() === selectedCategory
    );
  }

  // Sort
  if (selectedSort === "price-asc") {
    products.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (selectedSort === "price-desc") {
    products.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  // Table layout: 5 per row
  const perRow = 5;
  const rows = [];
  for (let i = 0; i < products.length; i += perRow) {
    rows.push(products.slice(i, i + perRow));
  }

  const table = document.getElementById('product-table');
  if (!table) return;
  if (products.length === 0) {
    table.innerHTML = `<tr><td colspan="${perRow}" style="padding:2em;text-align:center;">No products found.</td></tr>`;
    return;
  }

  table.innerHTML = rows.map(row => `
    <tr>
      ${row.map(p => `
        <td>
          <img src="${p.image}" alt="${p.name}" class="product-img" />
          <div class="product-name"><b>Name: ${p.name}</b></div>
          <div class="product-price"><b>Price: ${p.price}</b></div>
          <button class="add-to-cart-btn" data-product-id="${p.id}">
            <i class="fa fa-cart-plus"></i> Add to Cart
          </button>
        </td>
      `).join("")}
    </tr>
  `).join("");

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = btn.getAttribute('data-product-id');
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        let same = cart.find(item => item.id === productId);
        if (same) {
          same.quantity = (same.quantity || 1) + 1;
        } else {
          cart.push({
            ...product,
            quantity: 1,
          });
        }
        localStorage.setItem('cartItems', JSON.stringify(cart));
        window.location.href = "cart.html";
      }
    });
  });
}

// UI setup for filters and sort
function setupUI() {
  // Only add click listener to actual buttons, not the dropdown
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.category;
      selectedTier = "";
      // Reset dropdown when switching away from cakes
      if (selectedCategory !== "cakes") {
        document.getElementById('cakesDropdownMenu').selectedIndex = 0;
      }
      renderProducts();
    });
  });

  // Cakes dropdown select logic (NO filter-btn class on this dropdown!)
  const cakesDropdownMenu = document.getElementById('cakesDropdownMenu');
  cakesDropdownMenu.addEventListener('change', function(e) {
    const value = cakesDropdownMenu.value;
    if (value && value.trim() !== "") {
      selectedCategory = "cakes";
      selectedTier = value;
      // Remove .active from buttons when using dropdown
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    } else {
      selectedCategory = "cakes";
      selectedTier = "";
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    }
    renderProducts();
  });

  document.getElementById('sort-select').addEventListener('change', function() {
    selectedSort = this.value;
    renderProducts();
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  setupUI();
  await fetchProducts();
});