// Global app controller
import Search from './modules/Search';
import * as searchView from './views/searchView';
import { elements } from './views/base';
/* Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};

const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();
  
  if (query){
    //New search object and add to stage
    state.search = new Search(query);
    // Prepare UI for result
    searchView.clearInput();
    searchView.clearResults();
    //Search for recipes
    await state.search.getResult();

    //Render result on UI
    searchView.renderResult(state.search.result);
  }
};

elements.searchForm.addEventListener('submit', e =>{
  e.preventDefault();
  controlSearch();
});
