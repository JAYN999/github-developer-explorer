/**
 * AboutModal.jsx
 * --------------
 * Accessible modal dialog describing the project.
 *
 * Accessibility:
 *  - Focus is trapped inside when open
 *  - Escape key closes it
 *  - Backdrop click closes it
 *  - role="dialog" + aria-modal + aria-labelledby
 *
 * Props:
 *   isOpen (bool) – controls visibility
 *   onClose (fn)  – called to close
 */

import { useEffect, useRef } from 'react';

const TECH_STACK = [
  { name: 'React 18',         role: 'UI framework (functional components + hooks)' },
  { name: 'React Router v6',  role: 'Client-side routing' },
  { name: 'Redux Toolkit',    role: 'Global state management' },
  { name: 'Axios',            role: 'HTTP client with interceptors' },
  { name: 'Vite',             role: 'Development server & bundler' },
  { name: 'Vanilla CSS',      role: 'Custom dark theme + glassmorphism' },
];

export default function AboutModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Trap focus inside the modal when open
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button immediately
    closeBtnRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, a, input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div>
            <h2 id="about-modal-title" className="modal__title">
              ⚡ About DevExplorer
            </h2>
            <p className="modal__subtitle">GitHub Developer Explorer v1.0</p>
          </div>
          <button
            ref={closeBtnRef}
            className="modal__close"
            onClick={onClose}
            aria-label="Close About dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          <p className="modal__desc">
            A professional developer discovery platform built with modern React.
            Search GitHub's 100M+ developer profiles, explore repositories, and
            bookmark your favourites — all in a stunning dark-mode UI.
          </p>

          {/* Tech stack */}
          <h3 className="modal__section-title">🛠 Tech Stack</h3>
          <table className="modal__table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {TECH_STACK.map((t) => (
                <tr key={t.name}>
                  <td><code>{t.name}</code></td>
                  <td>{t.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Token setup */}
          <h3 className="modal__section-title">🔑 GitHub Token Setup</h3>
          <p className="modal__desc">
            Without a token, the GitHub API allows <strong>60 requests/hour</strong>.
            With one, you get <strong>5,000 requests/hour</strong>.
          </p>
          <ol className="modal__steps">
            <li>Visit <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">github.com/settings/tokens</a></li>
            <li>Generate a new classic token (no scopes needed)</li>
            <li>Create a <code>.env</code> file at the project root</li>
            <li>Add: <code>VITE_GITHUB_TOKEN=ghp_your_token</code></li>
            <li>Restart the dev server</li>
          </ol>

          {/* Attribution */}
          <div className="modal__attribution">
            <span>Built with ❤️ using the</span>{' '}
            <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer">
              GitHub REST API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
