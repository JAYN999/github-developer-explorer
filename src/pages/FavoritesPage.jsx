/**
 * FavoritesPage.jsx
 * -----------------
 * Route: /favorites — Enhanced version.
 *
 * New features:
 *  - Search within favorites (filters by login substring)
 *  - Sort: A–Z by name, or by type (User/Org)
 *  - Export favorites to JSON file download
 *  - Improved empty state with animated border
 */

import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFavorite } from '../redux/favoritesSlice';
import DeveloperCard from '../components/DeveloperCard';

// ── Export helpers ─────────────────────────────────────────────────────────

function exportToJSON(favorites) {
  const data = favorites.map((f) => ({
    login:      f.login,
    name:       f.name        ?? null,
    avatar_url: f.avatar_url,
    html_url:   f.html_url    ?? `https://github.com/${f.login}`,
    type:       f.type        ?? 'User',
    followers:  f.followers   ?? null,
    public_repos: f.public_repos ?? null,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'github-favorites.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const dispatch  = useDispatch();
  const favorites = useSelector((s) => s.favorites.favoriteDevelopers);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy,      setSortBy]      = useState('added'); // 'added' | 'name' | 'type'

  const handleClearAll = () => {
    favorites.forEach((dev) => dispatch(removeFavorite(dev.id)));
  };

  // Derived list: filter then sort (memoised)
  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = q
      ? favorites.filter((f) => f.login.toLowerCase().includes(q))
      : [...favorites];

    if (sortBy === 'name') {
      list = list.sort((a, b) => a.login.localeCompare(b.login));
    } else if (sortBy === 'type') {
      list = list.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
    }
    // 'added' preserves the original insertion order (Redux array order)
    return list;
  }, [favorites, searchQuery, sortBy]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <main className="page favorites-page" id="main-content">
        <div className="container">
          <header className="favorites-header">
            <h1 className="favorites-header__title">
              <span className="gradient-text">Saved Developers</span>
            </h1>
            <p className="favorites-header__sub">
              Bookmark developers from the home page to see them here.
            </p>
          </header>

          <div className="empty-state empty-state--dashed" role="status">
            <div className="empty-state__icon">🔖</div>
            <h2 className="empty-state__title">No favorites yet</h2>
            <p className="empty-state__desc">
              Head back to the home page and click the bookmark icon on any
              developer card to save them here. Your favorites are persisted
              across page refreshes.
            </p>
            <Link to="/" className="btn btn--primary" style={{ marginTop: '16px' }}>
              🏠 Explore Developers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Favorites grid ──────────────────────────────────────────────────────────
  return (
    <main className="page favorites-page" id="main-content">
      <div className="container">
        <header className="favorites-header">
          <h1 className="favorites-header__title">
            <span className="gradient-text">Saved Developers</span>
          </h1>
          <p className="favorites-header__sub">
            {favorites.length} developer{favorites.length !== 1 ? 's' : ''} bookmarked
          </p>
        </header>

        {/* ── Controls bar ────────────────────────────────────── */}
        <div className="fav-controls">
          {/* Search within favorites */}
          <div className="fav-controls__search-wrap">
            <span className="fav-controls__search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="fav-controls__search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter favorites…"
              aria-label="Filter saved developers"
            />
            {searchQuery && (
              <button
                className="search-bar__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort select */}
          <div className="fav-controls__sort" role="group" aria-label="Sort favorites">
            {[
              { key: 'added', label: '📅 Order Added' },
              { key: 'name',  label: '🔤 A–Z'         },
              { key: 'type',  label: '🏷️ Type'        },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-btn${sortBy === key ? ' sort-btn--active' : ''}`}
                onClick={() => setSortBy(key)}
                aria-pressed={sortBy === key}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="fav-controls__actions">
            <button
              className="btn btn--secondary"
              onClick={() => exportToJSON(favorites)}
              aria-label="Export favorites as JSON"
              title="Download as favorites.json"
            >
              📥 Export JSON
            </button>
            <button
              className="btn btn--danger"
              onClick={handleClearAll}
              aria-label="Remove all favorites"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* No match after filter */}
        {filteredSorted.length === 0 && (
          <div className="empty-state" role="status">
            <div className="empty-state__icon">🔍</div>
            <h2 className="empty-state__title">No match found</h2>
            <p className="empty-state__desc">
              No saved developer matches <strong>"{searchQuery}"</strong>.
            </p>
            <button
              className="btn btn--ghost"
              onClick={() => setSearchQuery('')}
              style={{ marginTop: 12 }}
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Card grid */}
        {filteredSorted.length > 0 && (
          <div className="card-grid" role="list">
            {filteredSorted.map((dev, index) => (
              <div key={dev.id} role="listitem">
                <DeveloperCard
                  developer={dev}
                  animationDelay={Math.min(index * 0.05, 0.5)}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
