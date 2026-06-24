/**
 * StatsBar.jsx
 * ------------
 * Three live dashboard stat tiles shown on the HomePage hero:
 *
 *   1. Developers Loaded  – current developer array length from Redux
 *   2. Favorites Saved    – favorites count from Redux
 *   3. Profiles Explored  – unique profile visits this session (sessionStorage)
 *
 * The "Profiles Explored" counter updates reactively via the
 * 'stats-update' CustomEvent fired by sessionStats.js — no polling.
 */

import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getProfilesViewedCount } from '../utils/sessionStats';

function StatTile({ icon, value, label, color }) {
  return (
    <div className="stats-tile" style={{ '--tile-color': color }}>
      <span className="stats-tile__icon" aria-hidden="true">{icon}</span>
      <span className="stats-tile__value">{value.toLocaleString()}</span>
      <span className="stats-tile__label">{label}</span>
    </div>
  );
}

export default memo(function StatsBar() {
  const devsLoaded = useSelector((s) => s.developers.developers.length);
  const favCount = useSelector((s) => s.favorites.favoriteDevelopers.length);
  const [profilesViewed, setProfilesViewed] = useState(getProfilesViewedCount);

  // React to profile-visit events from DeveloperDetailsPage
  useEffect(() => {
    const handler = () => setProfilesViewed(getProfilesViewedCount());
    window.addEventListener('stats-update', handler);
    return () => window.removeEventListener('stats-update', handler);
  }, []);

  return (
    <div className="stats-bar" aria-label="Dashboard statistics">
      <StatTile icon="👥" value={devsLoaded} label="Developers Loaded" color="#58a6ff" />
      <StatTile icon="🔖" value={favCount}   label="Favorites Saved"   color="#a371f7" />
      <StatTile icon="🔭" value={profilesViewed} label="Profiles Explored" color="#f78166" />
    </div>
  );
});
