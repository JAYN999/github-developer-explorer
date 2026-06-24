/**
 * RateLimitBanner.jsx
 * -------------------
 * Floating notification that appears when GitHub API rate limit
 * is running low (< 15 requests remaining).
 *
 * Listens to the 'ratelimit-update' CustomEvent dispatched by the
 * Axios response interceptor in githubApi.js — no polling needed.
 *
 * Features:
 *  - Live countdown to rate-limit reset
 *  - "Set token" instructions link
 *  - Dismissible per session
 *  - Two severity levels: warning (< 15) and exhausted (0)
 */

import { useState, useEffect } from 'react';

const WARN_THRESHOLD = 15;

export default function RateLimitBanner() {
  const [info, setInfo] = useState({ remaining: null, limit: null, resetAt: null });
  const [dismissed, setDismissed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Listen for rate limit updates dispatched from the Axios interceptor
  useEffect(() => {
    const handler = (e) => {
      setInfo(e.detail);
      setDismissed(false); // re-show if severity worsens
    };
    window.addEventListener('ratelimit-update', handler);
    return () => window.removeEventListener('ratelimit-update', handler);
  }, []);

  // Live countdown to reset time
  useEffect(() => {
    if (!info.resetAt) return;
    const update = () =>
      setSecondsLeft(Math.max(0, Math.ceil((info.resetAt - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [info.resetAt]);

  const { remaining } = info;
  if (dismissed || remaining === null || remaining > WARN_THRESHOLD) return null;

  const isExhausted = remaining === 0;
  const hasToken = !!import.meta.env.VITE_GITHUB_TOKEN;

  const formatCountdown = (s) => {
    if (s === null || s < 0) return '…';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div
      className={`rate-limit-banner ${isExhausted ? 'rate-limit-banner--exhausted' : 'rate-limit-banner--warning'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="rate-limit-banner__icon" aria-hidden="true">
        {isExhausted ? '🚫' : '⚠️'}
      </div>
      <div className="rate-limit-banner__body">
        <strong className="rate-limit-banner__title">
          {isExhausted ? 'API Rate Limit Reached' : `Rate Limit Low — ${remaining} requests left`}
        </strong>
        <p className="rate-limit-banner__desc">
          {isExhausted
            ? `Resets in ${formatCountdown(secondsLeft)}.`
            : `Resets in ${formatCountdown(secondsLeft)}.`}
          {!hasToken && (
            <>
              {' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="rate-limit-banner__link"
              >
                Add a token
              </a>{' '}
              to get 5,000 req/hr.
            </>
          )}
        </p>
      </div>
      <button
        className="rate-limit-banner__close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss rate limit warning"
      >
        ✕
      </button>
    </div>
  );
}
