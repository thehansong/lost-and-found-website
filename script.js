// const API_BASE = "http://localhost:3000"
const API_BASE = "http://18.214.100.164:3000";

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
    ${item.location ? `<p><em>Location: ${item.location}</em></p>` : "<p><em>Location: Unknown</em></p>"}
    <span class="tag ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
  `;

  // Create claim and delete buttons
  const claimButton = createActionButton("Claim", item._id, item.category === "lost", claimItem);
  claimButton.classList.add('claim-btn'); 
  const deleteButton = createActionButton("Delete", item._id, true, deleteItem);
  deleteButton.classList.add('delete-btn');

  // Flex container for buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.appendChild(claimButton);
  buttonContainer.appendChild(deleteButton);

  card.appendChild(image);
  card.appendChild(info);
  card.appendChild(buttonContainer);
  itemGrid.appendChild(card);
}

function createActionButton(buttonText, itemId, shouldShow, actionFunction) {
  const token = localStorage.getItem("token");
  const button = document.createElement("button");
  button.className = buttonText.toLowerCase() + "-button";
  button.textContent = buttonText;
  button.dataset.id = itemId;

  if (!token || !shouldShow) {
    button.style.display = "none"; // Hide the button completely
  } else {
    button.style.display = "inline-block"; // Ensure the button is shown
    button.addEventListener("click", () => {
      const confirmation = confirm(`Are you sure you want to ${buttonText.toLowerCase()} this item?`);
      if (confirmation) {
        actionFunction(itemId); // Call the respective action function (claimItem or deleteItem)
      }
    });
  }
  return button;
}

function claimItem(itemId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to claim an item.");
    return;
  }

  fetch(`${API_BASE}/api/items/${itemId}/claim`, {
    method: "PUT", // Use PUT method to update the item
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    // Log the response for debugging
    console.log(res);
    return res.json(); // Parse the response
  })
  .then(data => {
    if (data.success) {
      alert("Item claimed successfully!");
      fetchItems(); // Re-fetch items to reflect the updated item status
    } else {
      console.error("Error claiming item:", data.message); // Log the backend error message
      alert("Error claiming item: " + data.message);
    }
  })
  .catch(err => {
    console.error("Error claiming item:", err);
    alert("Failed to claim item.");
  });
}

// Function to handle deleting an item
function deleteItem(itemId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to delete an item.");
    return;
  }

  fetch(`${API_BASE}/api/items/${itemId}`, {
    method: "DELETE", // DELETE method to remove the item
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    if (!res.ok) {
      // Log the error response from the server
      return res.text().then(text => {
        throw new Error(text); // Log the HTML error response
      });
    }
    return res.json();
  })
  .then(data => {
    if (data.success) {
      alert("Item deleted successfully!");
      fetchItems(); // Re-fetch the items to reflect the change
    } else {
      alert("Error deleting item.");
    }
  })
  .catch(err => {
    console.error("Error deleting item:", err);
    alert("Failed to delete item.");
  });
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
  updateAuthUI();
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
    updateAuthUI(); // Update UI after login
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
    updateAuthUI(); // Update UI after registration
  })
  .catch(err => {
    alert("Error registering: " + err.message);
  });
});

// Update UI based on authentication status
// Decode the JWT token manually to extract the username
function decodeJWT(token) {
  const payload = token.split('.')[1]; // Get the payload part of the JWT
  const decoded = atob(payload); // Base64 decode the payload
  return JSON.parse(decoded); // Parse the JSON payload
}

function updateAuthUI() {
  const authButtons = document.getElementById('authButtons');
  const token = localStorage.getItem('token'); // Check if token is present

  // Select the claim and delete buttons
  const claimButtons = document.querySelectorAll('.claim-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  if (token) {
    // If token exists, show logout button and user's name (if available)
    const decodedToken = decodeJWT(token); // Decode JWT token to get user info
    const username = decodedToken.username || 'User'; // Get username from the token (or use 'User' if unavailable)
    
    authButtons.innerHTML = `
      <span class="username">Hello, ${username}</span>
      <button class="auth-button logout" onclick="logout()">Logout</button>
    `;
    
    // Enable 'Post Lost Item' button
    document.getElementById('postButton').disabled = false;

    // Show claim and delete buttons if token exists and user is authenticated
    claimButtons.forEach(btn => {
      if (btn.dataset.id) {
        btn.style.display = "inline-block";
      }
    });

    deleteButtons.forEach(btn => {
      if (btn.dataset.id) {
        btn.style.display = "inline-block";
      }
    });
  } else {
    // If not logged in, show login and register buttons
    authButtons.innerHTML = ` 
      <button class="auth-button" onclick="openModal('loginModal')">Login</button>
      <button class="auth-button" onclick="openModal('registerModal')">Register</button>
    `;

    // Disable 'Post Lost Item' button
    document.getElementById('postButton').disabled = true;

    // Hide claim and delete buttons
    claimButtons.forEach(btn => btn.style.display = "none");
    deleteButtons.forEach(btn => btn.style.display = "none");
  }
}

// Logout function that removes the token and updates UI
function logout() {
  localStorage.removeItem('token');
  updateAuthUI(); // Re-render the auth UI after logging out
}