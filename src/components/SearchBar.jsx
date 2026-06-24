/**
 * SearchBar.jsx
 * -------------
 * Enhanced search input with:
 *  - 500ms debounce (API only called after user pauses)
 *  - Recent searches stored in localStorage (max 5, clickable)
 *  - Dropdown appears when focused with an empty input
 *  - Individual recent search removal
 *  - Inline loading spinner and clear button
 *  - Escape key clears the input / closes the dropdown
 *
 * Props:
 *   onSearch  (fn)   – called with the debounced query string
 *   onClear   (fn)   – called when the user clears the input
 *   isLoading (bool) – shows a spinner icon
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_MS  = 500;
const STORAGE_KEY  = 'gde_recent_searches';
const MAX_RECENTS  = 5;

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadRecents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecents(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

function addToRecents(query, current) {
  const trimmed = query.trim();
  if (!trimmed) return current;
  // Dedup + prepend + cap at MAX_RECENTS
  const next = [trimmed, ...current.filter((r) => r !== trimmed)].slice(0, MAX_RECENTS);
  saveRecents(next);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchBar({ onSearch, onClear, isLoading }) {
  const [value,       setValue]       = useState('');
  const [recents,     setRecents]     = useState(loadRecents);
  const [showDropdown,setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const inputRef      = useRef(null);
  const wrapRef       = useRef(null);

  // Debounced search dispatch
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = value.trim();
    if (!trimmed) { onClear?.(); return; }

    debounceTimer.current = setTimeout(() => {
      // Persist to recent searches on actual API call
      setRecents((prev) => addToRecents(trimmed, prev));
      onSearch(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside the search wrapper
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => setValue(e.target.value);

  const handleFocus = () => {
    if (!value.trim()) setShowDropdown(true);
  };

  const handleClear = useCallback(() => {
    setValue('');
    setShowDropdown(true); // show recents after clearing
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (showDropdown) { setShowDropdown(false); return; }
      handleClear();
    }
  };

  const handleSelectRecent = (query) => {
    setValue(query);
    setShowDropdown(false);
    setRecents((prev) => addToRecents(query, prev));
    onSearch(query);
  };

  const handleRemoveRecent = (e, query) => {
    e.stopPropagation();
    const next = recents.filter((r) => r !== query);
    setRecents(next);
    saveRecents(next);
  };

  const shouldShowDropdown = showDropdown && !value.trim() && recents.length > 0;

  return (
    <div className="search-bar" role="search" ref={wrapRef}>
      <div className="search-bar__input-wrap">
        <span className="search-bar__icon" aria-hidden="true">🔍</span>

        <input
          ref={inputRef}
          id="developer-search"
          type="search"
          className="search-bar__input"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search GitHub developers…"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search GitHub developers"
          aria-expanded={shouldShowDropdown}
          aria-autocomplete="list"
          aria-controls="search-recents"
        />

        <div className="search-bar__right">
          {isLoading && <div className="search-bar__spinner" aria-hidden="true" />}
          {value && !isLoading && (
            <button
              className="search-bar__clear"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear (Esc)"
            >
              ✕
            </button>
          )}
        </div>

        {/* Recent searches dropdown */}
        {shouldShowDropdown && (
          <ul
            id="search-recents"
            className="search-dropdown"
            role="listbox"
            aria-label="Recent searches"
          >
            <li className="search-dropdown__header">Recent searches</li>
            {recents.map((query) => (
              <li
                key={query}
                className="search-dropdown__item"
                role="option"
                aria-selected="false"
                onClick={() => handleSelectRecent(query)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectRecent(query)}
                tabIndex={0}
              >
                <span className="search-dropdown__icon" aria-hidden="true">🕐</span>
                <span className="search-dropdown__text">{query}</span>
                <button
                  className="search-dropdown__remove"
                  onClick={(e) => handleRemoveRecent(e, query)}
                  aria-label={`Remove "${query}" from recent searches`}
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="search-bar__hint">
        Type to search · results update automatically · Esc to clear
      </p>
    </div>
  );
}
