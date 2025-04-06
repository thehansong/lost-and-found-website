const API_BASE = "http://localhost:3000"

function renderItemCard(item) {
  const itemGrid = document.getElementById("itemGrid");

  const card = document.createElement("div");
  card.className = "item-card";

  const image = document.createElement("img");
  image.src = item.image || "https://via.placeholder.com/150";
  image.alt = "Item Image";

  const info = document.createElement("div");
  info.className = "item-info";
  info.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.description}</p>
    ${item.location ? `<p><em>Location: ${item.location}</em></p>` : ""}
    <span class="tag ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
  `;

  card.appendChild(image);
  card.appendChild(info);
  itemGrid.appendChild(card);
}

function renderFilteredItems(filter) {
  const itemGrid = document.getElementById("itemGrid");
  itemGrid.innerHTML = "";

  const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
  const filteredItems = filter === "all" ? items : items.filter(item => item.category === filter);

  filteredItems.forEach(renderItemCard);
}

function fetchItems() {
  fetch(`${API_BASE}/api/items`)
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("lostFoundItems", JSON.stringify(data));
      renderFilteredItems(currentFilter);
    })
    .catch(err => console.error("Error fetching items:", err));
}

let currentFilter = "all"; // Track which filter is active

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    const selectedFilter = button.getAttribute("data-filter");

    if (currentFilter === selectedFilter && selectedFilter !== "all") {
      // Toggle off: return to "All"
      currentFilter = "all";
    } else {
      currentFilter = selectedFilter;
    }

    // Update active class
    document.querySelectorAll(".filter-button").forEach(btn => {
      btn.classList.remove("active");
    });
    document.querySelector(`.filter-button[data-filter="${currentFilter}"]`)?.classList.add("active");

    renderFilteredItems(currentFilter);
  });
});

document.querySelector(".search-bar").addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  if (!query) {
    fetchItems(); // fallback to showing all items
    return;
  }

  const res = await fetch(`${API_BASE}/api/items/search?q=${encodeURIComponent(query)}`);
  const items = await res.json();

  const itemGrid = document.getElementById("itemGrid");
  itemGrid.innerHTML = ""; // Clear previous results
  items.forEach(renderItemCard);
});

document.getElementById("postForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("itemTitle").value;
  const description = document.getElementById("itemDescription").value;
  const location = document.getElementById("itemLocation").value;
  const imageInput = document.getElementById("itemImage");
  const image = imageInput.files[0];

  const reader = new FileReader();

  reader.onloadend = function () {
    const imageData = reader.result;

    const newItem = {
      title,
      description,
      location,
      image: imageData,
      category: "lost" // Default assigned category when first posted
    };

    const token = localStorage.getItem("token"); // Get JWT token from localStorage

    if (!token) {
      alert("You must be logged in to post an item.");
      return;
    }

    fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      },
      body: JSON.stringify(newItem)
    })
    .then(res => res.json())
    .then(() => {
      fetchItems(); // Re-fetch and re-render items
    })
    .catch(err => console.error("Error posting item:", err));

    document.getElementById("postForm").reset();
    closeModal("postModal");
  };

  if (image) {
    reader.readAsDataURL(image);
  } else {
    reader.onloadend();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  fetchItems();
  document.querySelector('.filter-button[data-filter="all"]')?.classList.add("active");
});

// Modal logic
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#loginForm input[type="email"]').value;
  const password = document.querySelector('#loginForm input[type="password"]').value;

  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Login successful');
    localStorage.setItem('token', data.token); // Store token in local storage
    closeModal('loginModal');
  } else {
    alert(data.message);
  }
});

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.querySelector('#registerForm input[type="email"]').value;
  const password = document.querySelector('#registerForm input[type="password"]').value;
  const confirmPassword = document.querySelector('#registerForm input[type="password"]:nth-child(2)').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Register new user by sending POST request to /api/register
  fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    alert("Registration successful");
    closeModal("registerModal");
  })
  .catch(err => {
    alert("Error registering: " + err.message);
  });
});
