/**
 * Loader.jsx
 * ----------
 * Provides two visual loading states:
 *
 *  1. <Loader type="skeleton" count={n} />
 *     Renders `count` skeleton cards that match the DeveloperCard shape.
 *     Use this while the developer grid is loading.
 *
 *  2. <Loader type="spinner" />
 *     A centred spinning circle. Use for smaller async actions.
 *
 * Props:
 *   type  ("skeleton" | "spinner") – which variant to render (default: "skeleton")
 *   count (number)                  – how many skeleton cards to render (default: 8)
 */

function SkeletonCard({ index }) {
  return (
    <div
      className="skeleton-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-hidden="true"
    >
      <div className="skeleton-card__header">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-btn" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton skeleton-line skeleton-line--lg" style={{ width: '65%' }} />
        <div className="skeleton skeleton-line skeleton-line--sm" style={{ width: '40%' }} />
        <div className="skeleton skeleton-line skeleton-line--sm" style={{ width: '55%' }} />
      </div>
      <div className="skeleton-actions">
        <div className="skeleton" />
        <div className="skeleton" style={{ flex: '0 0 36px' }} />
      </div>
    </div>
  );
}

export default function Loader({ type = 'skeleton', count = 8 }) {
  if (type === 'spinner') {
    return (
      <div className="spinner-wrap" role="status" aria-label="Loading…">
        <div className="spinner" />
      </div>
    );
  }

  // Skeleton grid
  return (
    <div className="card-grid" role="status" aria-label="Loading developers…">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}
