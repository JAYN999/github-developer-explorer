/**
 * sessionStats.js
 * ---------------
 * Lightweight session-scoped tracking utilities.
 * Uses sessionStorage (cleared on tab close) to count
 * how many unique developer profiles have been visited.
 *
 * Uses a DOM CustomEvent so any component can react
 * to changes without polling or Redux.
 */

const VIEWED_KEY = 'gde_profiles_viewed';

/** Read the Set of visited usernames from sessionStorage */
function getViewedSet() {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Write the Set back to sessionStorage */
function saveViewedSet(set) {
  try {
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...set]));
  } catch {
    // Session storage not available
  }
}

/**
 * Mark a developer profile as viewed (idempotent).
 * Fires a 'stats-update' CustomEvent so StatsBar can refresh.
 * @param {string} username
 */
export function markProfileViewed(username) {
  const viewed = getViewedSet();
  if (!viewed.has(username)) {
    viewed.add(username);
    saveViewedSet(viewed);
    window.dispatchEvent(new CustomEvent('stats-update'));
  }
}

/** Return the number of unique profiles visited this session */
export function getProfilesViewedCount() {
  return getViewedSet().size;
}
