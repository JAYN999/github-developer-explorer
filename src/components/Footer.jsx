/**
 * Footer.jsx
 * ----------
 * App-wide footer with branding, external resource links,
 * and an "About" trigger that opens the AboutModal.
 *
 * Props:
 *   onAbout (fn) – callback to open the About modal
 */

import { memo } from 'react';

export default memo(function Footer({ onAbout }) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container">
        <div className="footer__inner">
          {/* Branding */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span aria-hidden="true">⚡</span>
              <span>DevExplorer</span>
            </div>
            <p className="footer__tagline">
              Powered by the{' '}
              <a
                href="https://docs.github.com/en/rest"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub REST API documentation"
              >
                GitHub REST API
              </a>
            </p>
          </div>

          {/* Links */}
          <nav className="footer__links" aria-label="Footer navigation">
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              API Docs ↗
            </a>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              Get Token ↗
            </a>
            <a
              href="https://docs.github.com/en/rest/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              Rate Limits ↗
            </a>
            <button
              className="footer__link footer__link--btn"
              onClick={onAbout}
              aria-label="Open About dialog"
            >
              About
            </button>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>© {year} GitHub Developer Explorer. MIT License.</span>
          <span className="footer__stack">React · Redux Toolkit · Axios</span>
        </div>
      </div>
    </footer>
  );
});
