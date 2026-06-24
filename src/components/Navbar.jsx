/**
 * Navbar.jsx
 * ----------
 * Fixed top navigation bar with:
 *  - Logo linking to home
 *  - RateLimitBanner integrated into the center
 *  - Nav links: Home, Favorites
 *  - Animated badge showing the count of saved favorites
 *  - Scrolled shadow effect
 */

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RateLimitBanner from './RateLimitBanner';

export default function Navbar() {
  const favCount = useSelector(
    (state) => state.favorites.favoriteDevelopers.length
  );
  const [scrolled, setScrolled] = useState(false);

  // Add shadow when page is scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
      <div className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="GitHub Developer Explorer home">
          <div className="navbar__logo-icon" aria-hidden="true">⚡</div>
          <span className="navbar__logo-text">DevExplorer</span>
        </NavLink>

        {/* Center: Rate Limit Banner */}
        <div className="navbar__center">
          <RateLimitBanner />
        </div>

        {/* Navigation links */}
        <div className="navbar__links" role="list">
          <NavLink
            to="/"
            end
            role="listitem"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' active' : ''}`
            }
            aria-label="Home"
          >
            <span aria-hidden="true">🏠</span>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/favorites"
            role="listitem"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' active' : ''}`
            }
            aria-label={`Favorites${favCount > 0 ? ` (${favCount} saved)` : ''}`}
          >
            <span aria-hidden="true">🔖</span>
            <span>Favorites</span>
            {/* Animated counter badge */}
            {favCount > 0 && (
              <span className="navbar__badge" aria-hidden="true">
                {favCount > 99 ? '99+' : favCount}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
