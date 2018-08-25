// Patch localstorage to emit an event when items are
// insterted.
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(name, { url, emoji }) {
  const event = new Event("itemInserted");
  event.name = name;
  event.url = url;
  event.emoji = emoji;
  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};

const toggleSidebar = () => {
  const sidebar = document.querySelector("#sidebar");
  const button = sidebar.querySelector("#toggleButton");

  sidebar.classList.toggle("is-open");
  const currentText = button.innerText;
  button.innerText = currentText === ">>" ? "<<" : ">>";
};

const closeSidebar = () => {
  const sidebar = document.querySelector("#sidebar");
  const button = sidebar.querySelector("#toggleButton");

  sidebar.classList.remove("is-open");
  button.innerText = ">>";
};

// Load recipes into local database
const loadRecipes = () => {
  return fetch("index.json")
    .then(res => res.json())
    .then(json => {
      const sidebar = document.querySelector("#sidebar");
      sidebar.classList.remove("is-loading");
      sidebar.innerText = "";

      const searchBox = document.createElement("input");
      searchBox.type = "search";
      searchBox.placeholder = "Search..";
      searchBox.addEventListener("keyup", event => {
        const searchText = event.target.value;
        const items = [].slice.call(sidebar.children, 1);
        items.forEach(item => {
          const itemText = item.innerText.toLowerCase();
          if (itemText.includes(searchText.toLowerCase())) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        });
      });

      const item = document.createElement("li");
      item.appendChild(searchBox);

      const toggleButton = document.createElement("button");
      toggleButton.innerText = "<<";
      toggleButton.id = "toggleButton";
      toggleButton.addEventListener("click", toggleSidebar);
      item.appendChild(toggleButton);

      sidebar.appendChild(item);

      return json;
    })
    .then(({ recipes }) => {
      recipes.forEach(({ name, url, emoji }) =>
        localStorage.setItem(name, { url: `recipes/${url}`, emoji })
      );
    });
};

const renderRecipe = recipe => {
  const content = document.querySelector("#content");
  content.classList.remove("is-loading");

  const renderIngredient = ({ name, amount, measurement = "" }) => `
<li>${amount} ${measurement} ${name.toLowerCase()}</li>
`;

  content.innerHTML = `
<h1>${recipe.name}</h1>

<h3>Ingredients</h3>

<ul>
  ${recipe.ingredients.map(renderIngredient).join("")}
</ul>

<h3>Method</h3>

<ul>
  ${recipe.method.map(method => `<li>${method}</li>`).join("")}
</ul>
  `;
};

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector("#sidebar");
  document.addEventListener("itemInserted", event => {
    const link = document.createElement("a");
    link.innerHTML = event.name;
    link.href = event.url;
    link.addEventListener("click", event => {
      /* Don't follow the link */
      event.preventDefault();

      closeSidebar();

      document.querySelectorAll("#sidebar > li").forEach(item => {
        item.classList.remove("is-selected");
      });

      /* Get the URL from the link */
      const target = event.target;
      target.parentNode.classList.add("is-selected");
      const url = target.href;

      /* Render recipe */
      fetch(url)
        .then(res => res.json())
        .then(renderRecipe);
    });

    const item = document.createElement("li");
    item.appendChild(link);

    const emoji = document.createElement("span");
    emoji.innerText = event.emoji || "";
    emoji.classList.add("emoji");
    item.appendChild(emoji);

    sidebar.appendChild(item);
  });
  loadRecipes();
});
