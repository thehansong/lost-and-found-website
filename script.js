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

    const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
    items.push(newItem);
    localStorage.setItem("lostFoundItems", JSON.stringify(items));

    renderFilteredItems(currentFilter);
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
  renderFilteredItems("all");
  document.querySelector('.filter-button[data-filter="all"]')?.classList.add("active");
});

// Modal logic
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Logging in with fake frontend logic…");
  closeModal("loginModal");
});

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Registering with fake frontend logic…");
  closeModal("registerModal");
});
