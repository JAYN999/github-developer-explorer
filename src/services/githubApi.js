/**
 * githubApi.js
 * -----------
 * Centralised Axios service layer for all GitHub REST API calls.
 *
 * Enhancements in this version:
 *  - Response interceptor reads X-RateLimit-* headers on every call
 *  - Dispatches a 'ratelimit-update' CustomEvent so RateLimitBanner
 *    can react without any polling or Redux overhead
 *  - getRateLimitInfo() exported so thunks or components can read it
 *  - Error messages include rate-limit context when relevant
 */

import axios from 'axios';

const BASE_URL = 'https://api.github.com';

// ─── Module-level rate-limit singleton ───────────────────────────────────────
// Updated on every successful response via the interceptor.
let _rateLimitInfo = { remaining: null, limit: null, resetAt: null };

/** Returns a snapshot of the current rate-limit state */
export const getRateLimitInfo = () => ({ ..._rateLimitInfo });

/**
 * Parse X-RateLimit-* headers from an Axios response/error and update
 * the module-level singleton. Dispatches a DOM event on change.
 */
function updateRateLimitFromHeaders(headers) {
  const remaining = headers?.['x-ratelimit-remaining'];
  if (remaining === undefined) return;

  const next = {
    remaining: parseInt(remaining, 10),
    limit:     parseInt(headers['x-ratelimit-limit'] ?? '60', 10),
    resetAt:   parseInt(headers['x-ratelimit-reset'] ?? '0', 10) * 1000,
  };

  // Only fire the event when values actually change
  if (next.remaining !== _rateLimitInfo.remaining) {
    _rateLimitInfo = next;
    window.dispatchEvent(new CustomEvent('ratelimit-update', { detail: _rateLimitInfo }));
  }
}

// ─── Shared Axios instance ────────────────────────────────────────────────────
const githubApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    // Automatically use token when set in .env as VITE_GITHUB_TOKEN
    // Raises rate limit from 60 → 5,000 requests/hour
    ...(import.meta.env.VITE_GITHUB_TOKEN && {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    }),
  },
});

// ─── Interceptors ─────────────────────────────────────────────────────────────

// Success: read rate-limit headers on every response
githubApi.interceptors.response.use(
  (response) => {
    updateRateLimitFromHeaders(response.headers);
    return response;
  },
  (error) => {
    // Also read rate-limit headers from error responses (e.g. 403)
    updateRateLimitFromHeaders(error.response?.headers);

    if (error.response) {
      const { status } = error.response;
      if (status === 403) {
        const { remaining, resetAt } = _rateLimitInfo;
        const resetIn = resetAt
          ? Math.max(0, Math.ceil((resetAt - Date.now()) / 1000))
          : null;
        const suffix = resetIn !== null
          ? ` Resets in ${resetIn}s.`
          : '';
        const tip = !import.meta.env.VITE_GITHUB_TOKEN
          ? ' Add a VITE_GITHUB_TOKEN to get 5,000 req/hr.'
          : '';
        return Promise.reject(
          new Error(
            remaining === 0
              ? `GitHub API rate limit reached.${suffix}${tip}`
              : 'GitHub API request forbidden (403).'
          )
        );
      }
      if (status === 404) {
        return Promise.reject(new Error('User or resource not found.'));
      }
      return Promise.reject(
        new Error(error.response.data?.message || `GitHub API error (${status}).`)
      );
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Check your connection.'));
    }
    return Promise.reject(new Error('Network error. Please check your internet connection.'));
  }
);

// ─── API methods ──────────────────────────────────────────────────────────────

/** Default user listing shown on first visit (up to 30 public accounts) */
export const getDefaultUsers = () =>
  githubApi.get('/users', { params: { since: 0, per_page: 30 } });

/**
 * Search GitHub users by keyword.
 * @param {string} query – search term
 */
export const searchUsers = (query) =>
  githubApi.get('/search/users', {
    params: { q: query, per_page: 30, sort: 'followers', order: 'desc' },
  });

/**
 * Fetch a single user's full public profile.
 * @param {string} username
 */
export const getUserDetails = (username) => githubApi.get(`/users/${username}`);

/**
 * Fetch up to 20 public repositories for a user, sorted by last updated.
 * @param {string} username
 */
export const getUserRepos = (username) =>
  githubApi.get(`/users/${username}/repos`, {
    params: { sort: 'updated', per_page: 20, type: 'public' },
  });

export default githubApi;
