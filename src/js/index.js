// Global app controller
import Search from './modules/Search';
/* Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};

const controlSearch = async () => {
  // Get query from view
  const query = 'pizza';
  
  if (query){
    //New search object and add to stage
    state.search = new Search(query);
    // Prepare UI for result

    //Search for recipes
    await state.search.getResult();

    //Render result on UI
    console.log(state.search.result);
  }
};

document.querySelector('.search').addEventListener('submit', e =>{
  e.preventDefault();
  controlSearch();
});
