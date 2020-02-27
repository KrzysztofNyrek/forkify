// Global app controller
import Search from './modules/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './modules/Recipe';
import List from './modules/List';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Likes from './modules/Likes';

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
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );
    }catch(err){
      alert('Error processing recipe!');
    }


  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
const controlList =() => {
  // Create a new list if there is none yet
  if (!state.list) state.list = new List();

  //Add each ingredients to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}
//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  //Handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')){
    //Delete from state
    state.list.deleteItem(id);
    //Delete from UI
    listView.deleteItem(id);
    //Handle the count update
  }else if (e.target.matches('.shopping__count--value')){
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});
/**
 * LIKE CONTROLLER
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;
  //User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentId)){
    //Add like to the state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //Tooggle the like button
    likesView.toggleLikeBtn(true);
    //Add like to UI list
      likesView.renderLike(newLike);
    //User has liked current recipe
  }else {
    //Remove like to the state
    state.likes.deleteLike(currentId);
    //Tooggle the like button
    likesView.toggleLikeBtn(false);
    //Remove like to UI list
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};
//Restore liked recipes on page load
window.addEventListener('load', () =>{
  state.likes = new Likes(); 
  //Restore likes
  state.likes.readStorage();
  //Togle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes()); 
  //Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});
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
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
    controlList();
  }else if (e.target.matches('.recipe__love, .recipe__love *')){
    controlLike();
  }
});
