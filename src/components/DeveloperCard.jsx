/**
 * DeveloperCard.jsx
 * -----------------
 * Glassmorphism card representing a single GitHub developer.
 *
 * Performance: wrapped in React.memo so it only re-renders when its
 * own props change — prevents cascade re-renders from Redux updates
 * that don't affect this card's data.
 *
 * The `isFavorite` selector returns a primitive boolean, so
 * React-Redux's default equality check prevents unnecessary re-renders
 * even when other favorites change.
 *
 * Props:
 *   developer      (object) – GitHub user object
 *   animationDelay (number) – staggered entrance delay in seconds
 *   searchQuery    (string) – highlights matching text in username
 */

import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addFavorite, removeFavorite } from '../redux/favoritesSlice';

/** Highlights the portion of `text` that matches `query` */
function HighlightMatch({ text, query }) {
  if (!query || !query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="dev-card__highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const DeveloperCard = memo(function DeveloperCard({ developer, animationDelay = 0, searchQuery = '' }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Primitive boolean — React-Redux only re-renders if true↔false changes
  const isFavorite = useSelector((state) =>
    state.favorites.favoriteDevelopers.some((d) => d.id === developer.id)
  );

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFavorite(developer.id));
    } else {
      dispatch(addFavorite(developer));
    }
  };

  const handleCardClick = () => navigate(`/developer/${developer.login}`);
  const handleGithubClick = (e) => e.stopPropagation();

  const isOrg = developer.type === 'Organization';

  return (
    <article
      className="dev-card fade-in"
      style={{ animationDelay: `${animationDelay}s` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`View profile of ${developer.login}`}
    >
      {/* Header row: avatar + bookmark */}
      <div className="dev-card__header">
        <div className="dev-card__avatar-wrap">
          <img
            src={developer.avatar_url}
            alt={`${developer.login}'s avatar`}
            className="dev-card__avatar"
            loading="lazy"
            width={64}
            height={64}
          />
        </div>

        <button
          className={`dev-card__bookmark${isFavorite ? ' bookmarked' : ''}`}
          onClick={handleBookmark}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove bookmark' : 'Bookmark developer'}
        >
          {isFavorite ? '🔖' : '🏷️'}
        </button>
      </div>

      {/* Body */}
      <div className="dev-card__body">
        <h3 className="dev-card__username">
          <HighlightMatch text={developer.login} query={searchQuery} />
        </h3>

        <div className="dev-card__type">
          <span className={`badge badge--${isOrg ? 'org' : 'user'}`}>
            {isOrg ? '🏢 Organization' : '👤 User'}
          </span>
        </div>

        {typeof developer.followers === 'number' && (
          <div className="dev-card__followers">
            <span className="dev-card__followers-icon" aria-hidden="true">👥</span>
            <span>
              {developer.followers.toLocaleString()} follower
              {developer.followers !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="dev-card__actions">
        <button className="btn btn--primary" onClick={handleCardClick} tabIndex={-1}>
          <span aria-hidden="true">👁️</span> View Profile
        </button>
        <a
          href={developer.html_url || `https://github.com/${developer.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--secondary"
          onClick={handleGithubClick}
          aria-label={`Open ${developer.login}'s GitHub profile in a new tab`}
        >
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
});

export default DeveloperCard;
