/**
 * App.jsx
 * -------
 * Root component that owns the route tree.
 *
 * Enhanced version adds:
 *  - <PageTransition> wrapper around Routes
 *  - <Footer> and <AboutModal>
 *  - RateLimitBanner integrated into Navbar (via App.css update)
 */

import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DeveloperDetailsPage from './pages/DeveloperDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import PageTransition from './components/PageTransition';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import './App.css';

// Simple inline 404 page — keeps the bundle lean
function NotFoundPage() {
  return (
    <main className="page" id="main-content">
      <div className="container">
        <div className="empty-state">
          <div className="empty-state__icon">🚧</div>
          <h1 className="empty-state__title">404 — Page not found</h1>
          <p className="empty-state__desc">
            The page you're looking for doesn't exist.
          </p>
          <a href="/" className="btn btn--primary" style={{ marginTop: '16px' }}>
            🏠 Go Home
          </a>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      {/* Ambient background orbs */}
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg__orb app-bg__orb--1" />
        <div className="app-bg__orb app-bg__orb--2" />
        <div className="app-bg__orb app-bg__orb--3" />
      </div>

      {/* Fixed navigation */}
      <Navbar />

      {/* Page content with transition wrapper */}
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/developer/:username" element={<DeveloperDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>

      {/* Footer & Modals */}
      <Footer onAbout={() => setIsAboutOpen(true)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
