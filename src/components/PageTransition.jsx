/**
 * PageTransition.jsx
 * ------------------
 * Wraps page content with a fade-in animation triggered on every
 * route change. Uses the current pathname as the React `key` so
 * React remounts the div (and thus re-triggers the CSS animation)
 * whenever the user navigates to a different page.
 */

import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}
