/**
 * HomePage.jsx
 * ------------
 * Landing page — enhanced version.
 *
 * Performance improvements:
 *  - Granular useSelector calls (one per field) instead of
 *    destructuring the whole slice. Each selector returns a
 *    primitive/stable reference, so components only re-render
 *    when the specific value they care about changes.
 *
 * New features:
 *  - <StatsBar> showing live dashboard metrics below the hero
 *  - searchQuery state passed down to DeveloperCard for highlight
 */

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar    from '../components/SearchBar';
import DeveloperCard from '../components/DeveloperCard';
import Loader       from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatsBar     from '../components/StatsBar';
import {
  fetchDefaultDevelopers,
  searchDevelopers,
  clearSearch,
} from '../redux/developersSlice';

export default function HomePage() {
  const dispatch = useDispatch();

  // Granular selectors — each returns a primitive, avoiding object-ref churn
  const developers = useSelector((s) => s.developers.developers);
  const loading    = useSelector((s) => s.developers.loading);
  const error      = useSelector((s) => s.developers.error);
  const searchMode = useSelector((s) => s.developers.searchMode);

  // Track the current search query locally for highlight prop
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchDefaultDevelopers());
  }, [dispatch]);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      dispatch(searchDevelopers(query));
    },
    [dispatch]
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    dispatch(clearSearch());
    dispatch(fetchDefaultDevelopers());
  }, [dispatch]);

  const sectionTitle = searchMode ? 'Search Results' : 'Popular Developers';
  const isEmpty      = !loading && !error && developers.length === 0;

  return (
    <main className="page" id="main-content">
      <div className="container">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="home-hero">
          <h1 className="home-hero__title">
            Discover{' '}
            <span className="gradient-text">GitHub Developers</span>
          </h1>
          <p className="home-hero__sub">
            Search millions of developers, explore their repositories, and
            bookmark the ones you admire.
          </p>

          <SearchBar
            onSearch={handleSearch}
            onClear={handleClear}
            isLoading={loading}
          />
        </header>

        {/* ── Dashboard Stats ───────────────────────────────────── */}
        <StatsBar />

        {/* ── Results ──────────────────────────────────────────── */}
        <section className="home-results" aria-label={sectionTitle}>
          {!loading && !error && developers.length > 0 && (
            <div className="home-results__header">
              <h2 className="home-results__title">{sectionTitle}</h2>
              <span className="home-results__count">
                {developers.length} developer{developers.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {loading && <Loader type="skeleton" count={12} />}

          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={() =>
                searchMode
                  ? dispatch(searchDevelopers(searchQuery))
                  : dispatch(fetchDefaultDevelopers())
              }
            />
          )}

          {!loading && !error && isEmpty && searchMode && (
            <div className="empty-state" role="status">
              <div className="empty-state__icon">🔍</div>
              <h2 className="empty-state__title">No developers found</h2>
              <p className="empty-state__desc">
                Try a different username or keyword — GitHub search is
                case-insensitive and supports partial matches.
              </p>
            </div>
          )}

          {!loading && !error && developers.length > 0 && (
            <div className="card-grid" role="list">
              {developers.map((dev, index) => (
                <div key={dev.id} role="listitem">
                  <DeveloperCard
                    developer={dev}
                    animationDelay={Math.min(index * 0.04, 0.5)}
                    searchQuery={searchMode ? searchQuery : ''}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
