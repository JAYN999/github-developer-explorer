/**
 * ErrorMessage.jsx
 * ----------------
 * Styled error box with an icon, title, message, and optional retry button.
 *
 * Props:
 *   message  (string)   – human-readable error text
 *   onRetry  (fn|null)  – if provided, shows a "Try again" button
 *   compact  (bool)     – smaller inline variant (no extra margin)
 */

export default function ErrorMessage({ message, onRetry, compact = false }) {
  return (
    <div
      className="error-box"
      role="alert"
      aria-live="assertive"
      style={compact ? { margin: 0, maxWidth: '100%' } : undefined}
    >
      <div className="error-box__icon" aria-hidden="true">⚠️</div>
      <h3 className="error-box__title">Something went wrong</h3>
      <p className="error-box__message">
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry} aria-label="Retry the failed request">
          🔄 Try again
        </button>
      )}
    </div>
  );
}
