/**
 * developersSlice.js
 * ------------------
 * Redux Toolkit slice for all GitHub developer / repository data.
 *
 * State shape:
 *   developers       – array of user objects from search or default listing
 *   selectedDeveloper – full profile object for the details page
 *   repositories     – repos belonging to the selected developer
 *   loading          – boolean: true while any async thunk is pending
 *   error            – string | null: human-readable error message
 *   searchMode       – boolean: true when we're showing search results
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDefaultUsers,
  searchUsers,
  getUserDetails,
  getUserRepos,
} from '../services/githubApi';

// ─── Async Thunks ──────────────────────────────────────────────────────────

/**
 * Loads the default list of GitHub users shown on first page visit.
 */
export const fetchDefaultDevelopers = createAsyncThunk(
  'developers/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDefaultUsers();
      return response.data; // array of user objects
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Searches GitHub users by the given query string.
 * @param {string} query – search term
 */
export const searchDevelopers = createAsyncThunk(
  'developers/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchUsers(query);
      return response.data.items; // search API wraps results in .items
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Fetches the full profile for a single developer.
 * @param {string} username – GitHub login
 */
export const fetchDeveloperDetails = createAsyncThunk(
  'developers/fetchDetails',
  async (username, { rejectWithValue }) => {
    try {
      const response = await getUserDetails(username);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Fetches the public repositories for a single developer.
 * @param {string} username – GitHub login
 */
export const fetchDeveloperRepos = createAsyncThunk(
  'developers/fetchRepos',
  async (username, { rejectWithValue }) => {
    try {
      const response = await getUserRepos(username);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const developersSlice = createSlice({
  name: 'developers',
  initialState: {
    developers: [],
    selectedDeveloper: null,
    repositories: [],
    loading: false,
    error: null,
    searchMode: false, // false = showing default users
  },
  reducers: {
    /** Clear search results and reset to non-search mode */
    clearSearch(state) {
      state.developers = [];
      state.searchMode = false;
      state.error = null;
    },
    /** Clear selected developer + repos when leaving the details page */
    clearSelectedDeveloper(state) {
      state.selectedDeveloper = null;
      state.repositories = [];
      state.error = null;
    },
    /** Clear any error message */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchDefaultDevelopers ────────────────────────────────
    builder
      .addCase(fetchDefaultDevelopers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchMode = false;
      })
      .addCase(fetchDefaultDevelopers.fulfilled, (state, action) => {
        state.loading = false;
        state.developers = action.payload;
      })
      .addCase(fetchDefaultDevelopers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── searchDevelopers ──────────────────────────────────────
    builder
      .addCase(searchDevelopers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchMode = true;
      })
      .addCase(searchDevelopers.fulfilled, (state, action) => {
        state.loading = false;
        state.developers = action.payload;
      })
      .addCase(searchDevelopers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchDeveloperDetails ─────────────────────────────────
    builder
      .addCase(fetchDeveloperDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDeveloper = null;
      })
      .addCase(fetchDeveloperDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDeveloper = action.payload;
      })
      .addCase(fetchDeveloperDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchDeveloperRepos ───────────────────────────────────
    builder
      .addCase(fetchDeveloperRepos.pending, (state) => {
        // Don't toggle the main loading flag here so the profile
        // renders while repos load separately.
        state.error = null;
      })
      .addCase(fetchDeveloperRepos.fulfilled, (state, action) => {
        state.repositories = action.payload;
      })
      .addCase(fetchDeveloperRepos.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSearch, clearSelectedDeveloper, clearError } =
  developersSlice.actions;

export default developersSlice.reducer;
