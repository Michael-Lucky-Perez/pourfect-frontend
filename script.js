// Pourfect App JavaScript
let lastTabContent = '';
let currentIndex = 0;
let recipes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Load all recipes
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    recipes = data;
    if (recipes.length > 0) {
      currentIndex = 0;
      showDrinkList(recipes, 'All Recipes');
    } else {
      console.error('No recipes found in data.json');
      document.querySelector('.drink-name').textContent = 'No recipes available.';
    }
  })
  .catch(error => console.error('Error loading recipes:', error));

// Display a recipe
function displayRecipe(recipe) {
  console.log('Displaying recipe:', recipe);
  if (!recipe || !recipe.name) {
    console.warn('Invalid recipe passed to displayRecipe:', recipe);
    return;
  }

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
    <p>${recipe.garnish || 'None'}</p>
  `;

  document.querySelector('.drink-name').innerHTML = `
    <span>${recipe.name}</span>
    <button class="favorite-btn" onclick="toggleFavorite()">
      ${favorites.includes(recipe.name) ? '💖 Unfavorite' : '⭐ Favorite'}
    </button>
  `;

  // Move resultsDiv above recipe-view
  const resultsDiv = document.getElementById('search-results');
  document.getElementById('recipe-view').before(resultsDiv);
}

function toggleFavorite() {
  const recipe = recipes[currentIndex];
  const name = recipe.name;

  if (favorites.includes(name)) {
    favorites = favorites.filter(n => n !== name);
  } else {
    favorites.push(name);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButton();
}

function updateFavoriteButton() {
  const recipe = recipes[currentIndex];
  const btn = document.querySelector('.favorite-btn');
  if (btn) {
    btn.textContent = favorites.includes(recipe.name) ? '💖 Unfavorite' : '⭐ Favorite';
  }
}

document.getElementById('next-btn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % recipes.length;
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
      showDrinkList(recipes.filter(r => favorites.includes(r.name)), 'Favorite Recipes');
      break;
    case 'specialty':
      showDrinkList(recipes.filter(r => r.category === 'Specialty'), 'Specialty Cocktails');
      break;
    case 'af':
    case 'gl':
    case 'mr':
    case 'sz': {
      const range = {
        af: ['a', 'f'],
        gl: ['g', 'l'],
        mr: ['m', 'r'],
        sz: ['s', 'z']
      }[tabName];
      const filtered = recipes.filter(r => {
        const first = r.name[0].toLowerCase();
        return first >= range[0] && first <= range[1];
      });
      showDrinkList(filtered, `Drinks ${tabName.toUpperCase()}`);
      break;
    }
    case 'spirits':
      showDrinkList(recipes.filter(r => r.category === 'Spirits'), 'Spirits');
      break;
    case 'shots':
      showDrinkList(recipes.filter(r => r.category === 'Shots'), 'Shots');
      break;
    case 'prep':
      tabContent.innerHTML = '<h2>Prep Station</h2><p>Pre-batch info and bar setup tips.</p>';
      break;
    case 'style':
      tabContent.innerHTML = `
        <h2>Select a Style</h2>
        <div class="style-subtabs">
          <button class="style-subtab" data-style="margarita">Margaritas</button>
          <button class="style-subtab" data-style="mule">Mules</button>
          <button class="style-subtab" data-style="old-fashioned">Old Fashioneds</button>
          <button class="style-subtab" data-style="mojito">Mojitos</button>
        </div>
        <div id="style-results"></div>
      `;
      document.querySelectorAll('.style-subtab').forEach(btn => {
        btn.addEventListener('click', () => {
          const style = btn.dataset.style;
          const styledDrinks = recipes.filter(r => r.style === style);
          const list = styledDrinks.map(drink => `<li class="drink-item" data-name="${drink.name}">${drink.name}</li>`).join('');
          document.getElementById('style-results').innerHTML = `<ul class="az-list">${list}</ul>`;
        });
      });
      break;
    default:
      tabContent.innerHTML = '';
  }
}

function showDrinkList(drinkArray, title) {
  const resultsDiv = document.getElementById('search-results');
  if (drinkArray.length === 0) {
    resultsDiv.innerHTML = `<h2>${title}</h2><p>No drinks found.</p>`;
    return;
  }
  const list = drinkArray.map(drink => `<li class="drink-item" data-name="${drink.name}">${drink.name}</li>`).join('');
  resultsDiv.innerHTML = `<h2>${title}</h2><ul class="az-list">${list}</ul>`;
  lastTabContent = resultsDiv.innerHTML;
}

document.body.addEventListener('click', function (e) {
  if (e.target.classList.contains('drink-item')) {
    const drinkName = e.target.dataset.name;
    const drink = recipes.find(d => d.name === drinkName);

    if (drink) {
      currentIndex = recipes.indexOf(drink);
      displayRecipe(drink);
      document.getElementById('recipe-view').style.display = 'block';
      tabContent.innerHTML = '';

      const backButton = document.createElement('button');
      backButton.textContent = '← Back to Results';
      backButton.classList.add('back-button');
      backButton.addEventListener('click', () => {
        document.getElementById('search-results').innerHTML = lastTabContent;
        document.getElementById('recipe-view').style.display = 'none';
        document.querySelector('.drink-name').textContent = 'Loading...';
        document.querySelectorAll('.recipe-section').forEach(section => section.innerHTML = '');
      });
      tabContent.appendChild(backButton);

      document.querySelector('.drink-name').scrollIntoView({ behavior: 'smooth' });
    }
  }
});

const searchBar = document.getElementById('search-bar');
searchBar.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;

    const matches = recipes.filter(drink => drink.name.toLowerCase().includes(query));
    const exactMatch = matches.find(drink => drink.name.toLowerCase() === query);

    const resultsDiv = document.getElementById('search-results');

    if (exactMatch) {
      currentIndex = recipes.indexOf(exactMatch);
      displayRecipe(exactMatch);
      resultsDiv.innerHTML = '';
      e.target.value = '';
      document.querySelector('.drink-name').scrollIntoView({ behavior: 'smooth' });
    } else if (matches.length > 0) {
      const list = matches.map(drink => `<li class="drink-item" data-name="${drink.name}">${drink.name}</li>`).join('');
      const resultHTML = `<h2>Found ${matches.length} match${matches.length > 1 ? 'es' : ''}:</h2><ul class="az-list">${list}</ul>`;
      lastTabContent = resultHTML;
      resultsDiv.innerHTML = resultHTML;
    } else {
      resultsDiv.innerHTML = `<p>No drink found matching "<strong>${query}</strong>"</p>`;
    }
  }
searchBar.addEventListener('input', function (e) {
  const input = e.target.value.toLowerCase().trim();
  const autoList = document.getElementById('autocomplete-list');
  autoList.innerHTML = '';

  if (!input || input.length < 3) return;

  const suggestions = recipes
    .filter(drink => drink.name.toLowerCase().includes(input))
    .slice(0, 5); // Limit to 5 suggestions

  suggestions.forEach(drink => {
    const item = document.createElement('div');
    item.classList.add('autocomplete-item');
    item.textContent = drink.name;
    item.addEventListener('click', () => {
      searchBar.value = drink.name;
      autoList.innerHTML = '';
      currentIndex = recipes.indexOf(drink);
      displayRecipe(drink);
      document.getElementById('search-results').innerHTML = '';
    });
    autoList.appendChild(item);
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-list') && e.target !== searchBar) {
    document.getElementById('autocomplete-list').innerHTML = '';
  }
});
});
