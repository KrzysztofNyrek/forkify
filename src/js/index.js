// Global app controller
import Search from './modules/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './modules/Recipe';
import List from './modules/List';
import * as recipeView from './views/recipeView';

/* Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};

//Search controler
const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();
  
  if (query){
    //New search object and add to stage
    state.search = new Search(query);
    // Prepare UI for result
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try{
      //Search for recipes
      await state.search.getResult();

      //Render result on UI
      clearLoader();
      searchView.renderResult(state.search.result);
    }catch(err){
      alert('Communication break down')
      clearLoader();
    }

  }
};

elements.searchForm.addEventListener('submit', e =>{
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn){
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResult(state.search.result, goToPage);
  }
});
//Recipe controle
const controlRecipe = async () => {
  //Get id from url
  const id = window.location.hash.replace('#', '');
  
  if (id){
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight selected search item
    if(state.search) searchView.higlightSelected(id);
    //Create new recipe object
    state.recipe = new Recipe(id);
    try{
      //Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      //Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    }catch(err){
      alert('Error processing recipe!');
    }


  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click', e =>{
  if(e.target.matches('.btn-decrease, .btn-decrease *')){
    //Decrrease button is clicked
    if(state.recipe.servings > 1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  }else if(e.target.matches('.btn-increase, .btn-increase *')){
    //Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }
});

window.l = new List();