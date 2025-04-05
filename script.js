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
    ${item.location ? `<p><em>Location Found: ${item.location}</em></p>` : ""}
    <span class="tag lost">Lost</span>
  `;

  card.appendChild(image);
  card.appendChild(info);
  itemGrid.prepend(card);
}

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
      category: "lost"                  // Automatically assign 'lost' tag
    };

    const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
    items.push(newItem);
    localStorage.setItem("lostFoundItems", JSON.stringify(items));

    renderItemCard(newItem);
    document.getElementById("postForm").reset();
    closeModal("postModal");
  };

  if (image) {
    reader.readAsDataURL(image);
  } else {
    reader.onloadend();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
  items.forEach(renderItemCard);
});

// 🔐 Modal control logic
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
