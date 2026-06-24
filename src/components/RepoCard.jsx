/**
 * RepoCard.jsx
 * ------------
 * Displays a single GitHub repository.
 *
 * Performance: wrapped in React.memo — repos are stable objects after
 * the details page fetch completes, so this avoids re-rendering the
 * entire repo grid when parent sort/filter state changes.
 *
 * Props:
 *   repo           (object) – GitHub repository object
 *   animationDelay (number) – staggered entrance delay in seconds
 */

import { memo } from 'react';

// Map GitHub language names → CSS class suffix for colour dots
const LANG_COLOR_MAP = {
  JavaScript: 'javascript', TypeScript: 'typescript', Python:  'python',
  Java:       'java',       C:          'c',          'C++':   'cpp',
  'C#':       'csharp',     Go:         'go',         Rust:    'rust',
  Ruby:       'ruby',       PHP:        'php',        Swift:   'swift',
  Kotlin:     'kotlin',     Dart:       'dart',       Shell:   'shell',
  HTML:       'html',       CSS:        'css',        Vue:     'vue',
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCount(n) {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const RepoCard = memo(function RepoCard({ repo, animationDelay = 0 }) {
  const langClass = repo.language ? (LANG_COLOR_MAP[repo.language] ?? 'default') : null;

  return (
    <article
      className="repo-card fade-in"
      style={{ animationDelay: `${animationDelay}s` }}
      aria-label={`Repository: ${repo.name}`}
    >
      {/* Header */}
      <div className="repo-card__header">
        <span className="repo-card__icon" aria-hidden="true">📁</span>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-card__name"
          aria-label={`Open ${repo.name} on GitHub`}
        >
          {repo.name}
        </a>
        {!repo.private && (
          <span className="repo-card__visibility">Public</span>
        )}
      </div>

      {/* Description */}
      {repo.description ? (
        <p className="repo-card__desc">{repo.description}</p>
      ) : (
        <p className="repo-card__desc repo-card__desc--empty">No description provided.</p>
      )}

      {/* Meta */}
      <div className="repo-card__meta">
        {repo.language && (
          <span className="repo-card__meta-item repo-card__meta-item--lang">
            <span className={`lang-dot lang--${langClass}`} aria-label={`Language: ${repo.language}`} />
            {repo.language}
          </span>
        )}
        <span className="repo-card__meta-item" title={`${repo.stargazers_count} stars`}>
          ⭐ {formatCount(repo.stargazers_count)}
        </span>
        <span className="repo-card__meta-item" title={`${repo.forks_count} forks`}>
          🍴 {formatCount(repo.forks_count)}
        </span>
      </div>

      <p className="repo-card__updated">Updated {formatDate(repo.updated_at)}</p>
    </article>
  );
});

export default RepoCard;
