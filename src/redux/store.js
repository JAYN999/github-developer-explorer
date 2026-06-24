/**
 * store.js
 * --------
 * Configures the Redux store with both slices and wires up
 * localStorage persistence for favorites via a store subscription.
 */

import { configureStore } from '@reduxjs/toolkit';
import developersReducer from './developersSlice';
import favoritesReducer, { saveFavoritesToStorage } from './favoritesSlice';

const store = configureStore({
  reducer: {
    developers: developersReducer,
    favorites: favoritesReducer,
  },
});

/**
 * Subscribe to store changes.
 * Whenever the favorites array changes we write it to localStorage.
 * We track the previous reference to avoid unnecessary writes.
 */
let previousFavorites = store.getState().favorites.favoriteDevelopers;

store.subscribe(() => {
  const currentFavorites = store.getState().favorites.favoriteDevelopers;
  if (currentFavorites !== previousFavorites) {
    previousFavorites = currentFavorites;
    saveFavoritesToStorage(currentFavorites);
  }
});

export default store;
