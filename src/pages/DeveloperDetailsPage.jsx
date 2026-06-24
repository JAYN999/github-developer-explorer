/**
 * DeveloperDetailsPage.jsx
 * ------------------------
 * Route: /developer/:username — Enhanced version.
 *
 * New features:
 *  - Repository sort: Most Stars | Recently Updated | Name A–Z
 *  - Language filter: dynamic chips based on available repo languages
 *  - Total stars across all repositories (shown in profile stats)
 *  - Top repository highlight (most starred)
 *  - Profile visit tracked in sessionStorage for StatsBar
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../redux/favoritesSlice';
import {
  fetchDeveloperDetails,
  fetchDeveloperRepos,
  clearSelectedDeveloper,
} from '../redux/developersSlice';
import { markProfileViewed } from '../utils/sessionStats';
import RepoCard     from '../components/RepoCard';
import Loader       from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

// Sort comparators
const SORT_FNS = {
  stars:   (a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0),
  updated: (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  name:    (a, b) => a.name.localeCompare(b.name),
};

const SORT_LABELS = { stars: '⭐ Most Stars', updated: '🕐 Recently Updated', name: '🔤 Name A–Z' };

export default function DeveloperDetailsPage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Granular selectors
  const dev          = useSelector((s) => s.developers.selectedDeveloper);
  const repositories = useSelector((s) => s.developers.repositories);
  const loading      = useSelector((s) => s.developers.loading);
  const error        = useSelector((s) => s.developers.error);
  const isFavorite   = useSelector((s) =>
    s.favorites.favoriteDevelopers.some((d) => d.login === username)
  );

  // Local sort + filter state
  const [sortBy,     setSortBy]     = useState('updated');
  const [filterLang, setFilterLang] = useState('');

  // Fetch profile + repos on mount / username change
  useEffect(() => {
    if (!username) return;
    dispatch(fetchDeveloperDetails(username));
    dispatch(fetchDeveloperRepos(username));
    return () => dispatch(clearSelectedDeveloper());
  }, [username, dispatch]);

  // Track this visit in sessionStorage for the StatsBar
  useEffect(() => {
    if (dev?.login) markProfileViewed(dev.login);
  }, [dev?.login]);

  // Derive sorted + filtered repos (memoised — no extra API calls)
  const sortedFilteredRepos = useMemo(() => {
    let list = filterLang
      ? repositories.filter((r) => r.language === filterLang)
      : repositories;
    return [...list].sort(SORT_FNS[sortBy] ?? SORT_FNS.updated);
  }, [repositories, sortBy, filterLang]);

  // Unique languages from all repos (for filter chips)
  const languages = useMemo(() => {
    const langs = repositories.map((r) => r.language).filter(Boolean);
    return [...new Set(langs)].sort();
  }, [repositories]);

  // Summary stats from all repos
  const totalStars = useMemo(
    () => repositories.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0),
    [repositories]
  );
  const topRepo = useMemo(
    () => [...repositories].sort(SORT_FNS.stars)[0] ?? null,
    [repositories]
  );

  const handleBookmark = () => {
    if (!dev) return;
    if (isFavorite) dispatch(removeFavorite(dev.id));
    else            dispatch(addFavorite(dev));
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="page" id="main-content">
        <div className="container"><Loader type="spinner" /></div>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error && !dev) {
    return (
      <main className="page" id="main-content">
        <div className="container">
          <button className="btn btn--ghost details-back" onClick={() => navigate(-1)}>← Back</button>
          <ErrorMessage
            message={error}
            onRetry={() => {
              dispatch(fetchDeveloperDetails(username));
              dispatch(fetchDeveloperRepos(username));
            }}
          />
        </div>
      </main>
    );
  }

  if (!dev) return null;

  return (
    <main className="page details-page" id="main-content">
      <div className="container">
        {/* Back */}
        <button className="btn btn--ghost details-back" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>

        {/* ── Profile card ─────────────────────────────────────── */}
        <section className="details-profile" aria-label="Developer profile">
          <div className="details-profile__top">
            {/* Avatar */}
            <div className="details-profile__avatar-wrap">
              <img
                src={dev.avatar_url}
                alt={`${dev.login}'s avatar`}
                className="details-profile__avatar"
                width={120}
                height={120}
              />
            </div>

            {/* Info */}
            <div className="details-profile__info">
              <h1 className="details-profile__name">{dev.name || dev.login}</h1>
              <p className="details-profile__username">@{dev.login}</p>
              {dev.bio && <p className="details-profile__bio">{dev.bio}</p>}

              {/* Metadata chips */}
              <div className="details-profile__meta">
                {dev.company && (
                  <span className="details-profile__meta-item">
                    <span aria-hidden="true">🏢</span>
                    {dev.company.replace(/^@/, '')}
                  </span>
                )}
                {dev.location && (
                  <span className="details-profile__meta-item">
                    <span aria-hidden="true">📍</span>{dev.location}
                  </span>
                )}
                {dev.blog && (
                  <a
                    href={dev.blog.startsWith('http') ? dev.blog : `https://${dev.blog}`}
                    target="_blank" rel="noopener noreferrer"
                    className="details-profile__meta-item"
                    aria-label="Personal website"
                  >
                    <span aria-hidden="true">🔗</span>{dev.blog}
                  </a>
                )}
                {dev.twitter_username && (
                  <a
                    href={`https://twitter.com/${dev.twitter_username}`}
                    target="_blank" rel="noopener noreferrer"
                    className="details-profile__meta-item"
                    aria-label="Twitter profile"
                  >
                    <span aria-hidden="true">🐦</span>@{dev.twitter_username}
                  </a>
                )}
              </div>

              {/* Stats row */}
              <div className="details-profile__stats">
                <div className="stat-item">
                  <span className="stat-item__value">{formatNumber(dev.followers)}</span>
                  <span className="stat-item__label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item__value">{formatNumber(dev.following)}</span>
                  <span className="stat-item__label">Following</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item__value">{formatNumber(dev.public_repos)}</span>
                  <span className="stat-item__label">Public Repos</span>
                </div>
                {/* Total stars across visible repos */}
                {totalStars > 0 && (
                  <div className="stat-item">
                    <span className="stat-item__value">{formatNumber(totalStars)}</span>
                    <span className="stat-item__label">Total Stars</span>
                  </div>
                )}
                {dev.public_gists > 0 && (
                  <div className="stat-item">
                    <span className="stat-item__value">{formatNumber(dev.public_gists)}</span>
                    <span className="stat-item__label">Gists</span>
                  </div>
                )}
              </div>

              {/* Top repository highlight */}
              {topRepo && (
                <div className="top-repo-banner">
                  <span className="top-repo-banner__label">🏆 Top Repository</span>
                  <a
                    href={topRepo.html_url}
                    target="_blank" rel="noopener noreferrer"
                    className="top-repo-banner__name"
                  >
                    {topRepo.name}
                  </a>
                  <span className="top-repo-banner__stars">⭐ {formatNumber(topRepo.stargazers_count)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="details-profile__actions">
                <a
                  href={dev.html_url}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn--primary"
                  aria-label="Open GitHub profile in new tab"
                >
                  <span aria-hidden="true">🐙</span> View on GitHub
                </a>
                <button
                  className={`btn ${isFavorite ? 'btn--danger' : 'btn--secondary'}`}
                  onClick={handleBookmark}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  {isFavorite ? '🗑️ Remove Favorite' : '🔖 Save to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Repositories section ──────────────────────────────── */}
        <section aria-label="Public repositories">
          <div className="repos-section__header">
            <h2 className="repos-section__title">📂 Repositories</h2>
            {repositories.length > 0 && (
              <span className="repos-section__count">
                Showing {sortedFilteredRepos.length} of {repositories.length}
              </span>
            )}
          </div>

          {/* Sort + Filter controls */}
          {repositories.length > 0 && (
            <div className="repo-controls">
              {/* Sort buttons */}
              <div className="repo-controls__sort" role="group" aria-label="Sort repositories">
                {Object.entries(SORT_LABELS).map(([key, label]) => (
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

              {/* Language filter chips */}
              {languages.length > 0 && (
                <div className="repo-controls__langs" role="group" aria-label="Filter by language">
                  <button
                    className={`lang-chip${!filterLang ? ' lang-chip--active' : ''}`}
                    onClick={() => setFilterLang('')}
                    aria-pressed={!filterLang}
                  >
                    All
                  </button>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      className={`lang-chip${filterLang === lang ? ' lang-chip--active' : ''}`}
                      onClick={() => setFilterLang(filterLang === lang ? '' : lang)}
                      aria-pressed={filterLang === lang}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {repositories.length === 0 && !error && <Loader type="spinner" />}

          {/* Error */}
          {error && repositories.length === 0 && <ErrorMessage message={error} compact />}

          {/* Empty after filter */}
          {sortedFilteredRepos.length === 0 && repositories.length > 0 && (
            <div className="empty-state" role="status">
              <div className="empty-state__icon">🔎</div>
              <h3 className="empty-state__title">No {filterLang} repositories</h3>
              <p className="empty-state__desc">
                This developer has no public repos in {filterLang}.
              </p>
              <button className="btn btn--ghost" onClick={() => setFilterLang('')} style={{ marginTop: 12 }}>
                Clear filter
              </button>
            </div>
          )}

          {/* Repo grid */}
          {sortedFilteredRepos.length > 0 && (
            <div className="card-grid">
              {sortedFilteredRepos.map((repo, index) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  animationDelay={Math.min(index * 0.03, 0.5)}
                />
              ))}
            </div>
          )}

          {/* No repos at all */}
          {repositories.length === 0 && !loading && !error && (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <h3 className="empty-state__title">No public repositories</h3>
              <p className="empty-state__desc">
                This developer hasn't published any public repos yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
