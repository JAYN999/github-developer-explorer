/**
 * favoritesSlice.js
 * -----------------
 * Redux Toolkit slice for bookmarked / favourite developers.
 *
 * Persistence strategy:
 *   • initialState is read directly from localStorage so bookmarks
 *     survive hard refreshes without needing middleware.
 *   • Every addFavorite / removeFavorite action syncs the new array
 *     back to localStorage via a subscription in store.js.
 *
 * State shape:
 *   favoriteDevelopers – array of full developer objects
 */

import { createSlice } from '@reduxjs/toolkit';

// ─── localStorage helpers ─────────────────────────────────────────────────

const STORAGE_KEY = 'gde_favorites';

export const loadFavoritesFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage may be full or unavailable in private browsing.
    console.warn('Could not persist favorites to localStorage.');
  }
};

// ─── Slice ─────────────────────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favoriteDevelopers: loadFavoritesFromStorage(),
  },
  reducers: {
    /**
     * Add a developer to favorites.
     * Ignores duplicates (checks by login / id).
     * @param {object} action.payload – developer object (at minimum: { id, login })
     */
    addFavorite(state, action) {
      const dev = action.payload;
      const alreadySaved = state.favoriteDevelopers.some(
        (d) => d.id === dev.id || d.login === dev.login
      );
      if (!alreadySaved) {
        state.favoriteDevelopers.push(dev);
      }
    },

    /**
     * Remove a developer from favorites by their GitHub `id`.
     * @param {number|string} action.payload – developer id
     */
    removeFavorite(state, action) {
      state.favoriteDevelopers = state.favoriteDevelopers.filter(
        (d) => d.id !== action.payload
      );
    },
  },
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;

export default favoritesSlice.reducer;
