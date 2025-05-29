let lastTabContent = '';
let currentIndex = 0;
let recipes = [];

// Load all recipes first
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    recipes = data;
    displayRecipe(recipes[currentIndex]);
  })
  .catch(error => console.error('Error loading recipe:', error));

// Function to update the page with a recipe
function displayRecipe(recipe) {
  const recipeSections = document.querySelectorAll('.recipe-section');

  recipeSections[0].innerHTML = `
    <h2>Ingredients</h2>
    <ul>${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
  `;

  recipeSections[1].innerHTML = `
    <h2>Instructions</h2>
    <p>${recipe.instructions}</p>
  `;

  recipeSections[2].innerHTML = `
    <h2>Glassware</h2>
    <p>${recipe.glassware}</p>
  `;

  recipeSections[3].innerHTML = `
    <h2>Garnish</h2>
    <p>${recipe.garnish}</p>
  `;

  document.querySelector('.drink-name').textContent = recipe.name;
}


// Next button click event
document.getElementById('next-btn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % recipes.length; // Loop back to start
  displayRecipe(recipes[currentIndex]);
});
const tabButtons = document.querySelectorAll('.tab-button');
const tabContent = document.getElementById('tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.tab-button.active')?.classList.remove('active');
    button.classList.add('active');
    loadTabContent(button.dataset.tab);
  });
});

function loadTabContent(tabName) {
  switch (tabName) {
    case 'favorites':
      tabContent.innerHTML = '<h2>Favorite Recipes</h2><p>Saved drinks will appear here.</p>';
      break;
    case 'az':
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      const drinkList = sorted.map(drink => 
  `<li class="drink-item" data-name="${drink.name}">${drink.name}</li>`
).join('');
      const azHTML = `
  <h2>All Recipes A-Z</h2>
  <ul class="az-list">${drinkList}</ul>
`;
lastTabContent = azHTML;
tabContent.innerHTML = azHTML;

    })
    .catch(error => {
      tabContent.innerHTML = '<p>Error loading recipes.</p>';
      console.error(error);
    });
  break;

    case 'spirits':
      tabContent.innerHTML = '<h2>Spirits</h2><p>Browse by base liquor: vodka, tequila, etc.</p>';
      break;
    case 'prep':
      tabContent.innerHTML = '<h2>Prep Station</h2><p>Pre-batch info and bar setup tips.</p>';
      break;
    default:
      tabContent.innerHTML = '';
  }
}
document.body.addEventListener('click', function (e) {
  if (e.target.classList.contains('drink-item')) {
    const drinkName = e.target.dataset.name;

    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const drink = data.find(d => d.name === drinkName);
        if (drink) {
          displayRecipe(drink);
          document.getElementById('recipe-view').style.display = 'block';
          document.querySelector('.drink-name').textContent = drink.name;

          // ✅ Optional: clear the tab view
          tabContent.innerHTML = '';
          const backButton = document.createElement('button');
backButton.textContent = '← Back to Results';
backButton.classList.add('back-button');
backButton.addEventListener('click', () => {
  tabContent.innerHTML = lastTabContent;

  // ✅ Hide the recipe view
  document.getElementById('recipe-view').style.display = 'none';

  // Optional cleanup
  document.querySelector('.drink-name').textContent = 'Loading...';
  document.querySelectorAll('.recipe-section').forEach(section => section.innerHTML = '');
});

tabContent.appendChild(backButton);


          // ✅ Scroll to top of main section
          document.querySelector('.drink-name').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      })
      .catch(err => {
        console.error("Could not load drink:", err);
      });
  }
});
document.getElementById('search-bar').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const query = e.target.value.trim().toLowerCase();

    if (!query) return;

    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const matches = data.filter(drink =>
          drink.name.toLowerCase().includes(query)
        );

        const exactMatch = matches.find(drink => drink.name.toLowerCase() === query);

if (exactMatch) {
  // Show recipe directly only if it's a perfect match
  displayRecipe(exactMatch);
  document.querySelector('.drink-name').textContent = exactMatch.name;
  tabContent.innerHTML = '';
  e.target.value = '';
  document.querySelector('.drink-name').scrollIntoView({ behavior: 'smooth' });
} else if (matches.length > 0) {
  // Show list of fuzzy matches, even if it's just one
  const list = matches
  .map(drink => `<li class="drink-item" data-name="${drink.name}">${drink.name}</li>`)
  .join('');
const resultHTML = `
  <h2>Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:</h2>
  <ul class="az-list">${list}</ul>
`;
lastTabContent = resultHTML;
tabContent.innerHTML = resultHTML;

} else {
  tabContent.innerHTML = `<p>No drink found matching "<strong>${query}</strong>"</p>`;
}
      })
      .catch(err => console.error('Search failed:', err));
  }
});

