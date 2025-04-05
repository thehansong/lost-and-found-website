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
    <span class="tag ${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
  `;

  card.appendChild(image);
  card.appendChild(info);
  itemGrid.prepend(card);
}

document.getElementById("postForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("itemTitle").value;
  const description = document.getElementById("itemDescription").value;
  const category = document.getElementById("itemCategory").value;
  const location = document.getElementById("itemLocation").value;
  const imageInput = document.getElementById("itemImage");
  const image = imageInput.files[0];

  const reader = new FileReader();

  reader.onloadend = function () {
    const imageData = reader.result;

    const newItem = {
      title,
      description,
      category,
      location,
      image: imageData,
    };

    const items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];
    items.push(newItem);
    localStorage.setItem("lostFoundItems", JSON.stringify(items));

    renderItemCard(newItem);
    document.getElementById("postForm").reset();
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
