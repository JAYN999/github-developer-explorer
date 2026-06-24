# ⚡ GitHub Developer Explorer

A **production-quality** developer discovery platform built with React 18, Redux Toolkit, and the GitHub REST API. Search millions of developers, explore their repositories, and bookmark your favorites — all in a stunning dark-mode UI with glassmorphism design.

---

## 🖼 Screenshots

| Home Page | Developer Details | Favorites |
|-----------|-------------------|-----------|
| Live developer grid with search | Full profile + repo grid | Saved developers with search/export |

---

## ✨ Features

- 🔍 **Real-time search** with 500ms debounce and recent search history
- 👤 **Developer profiles** — bio, stats, company, location, social links
- 📂 **Repository explorer** — sort by stars/updated/name, filter by language
- 🔖 **Favorites system** — bookmark, search, sort, and export to JSON
- ⚡ **Rate limit monitor** — live countdown and token setup prompts
- 📊 **Dashboard stats** — developers loaded, favorites saved, profiles explored
- 💾 **Persistence** — favorites survive page refresh via `localStorage`
- 🎨 **Premium dark UI** — glassmorphism cards, gradient accents, smooth animations
- ♿ **Accessible** — keyboard navigation, focus rings, ARIA attributes throughout

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework — functional components + hooks |
| React Router | v6 | Client-side routing |
| Redux Toolkit | latest | Global state management |
| React Redux | latest | React bindings for Redux |
| Axios | latest | HTTP client with interceptors |
| Vite | latest | Dev server & build tool |
| Vanilla CSS | — | Custom design system, no Tailwind |

---

## 🚀 Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/github-developer-explorer.git
cd github-developer-explorer

# 2. Install dependencies
npm install

# 3. (Optional but recommended) Set up a GitHub token — see below

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 GitHub Token Setup

The GitHub API allows **60 requests/hour** for unauthenticated requests. With a personal access token you get **5,000 requests/hour**.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name — no scopes are required (public API access only)
4. Copy the generated token
5. Create a `.env` file in the project root:

```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

6. Restart the dev server (`npm run dev`)

> **Never commit your `.env` file.** It is already in `.gitignore`.

---

## 📁 Project Architecture

```
src/
├── components/              # Reusable UI components
│   ├── Navbar.jsx           # Fixed navigation + favorites badge
│   ├── SearchBar.jsx        # Debounced search + recent searches dropdown
│   ├── DeveloperCard.jsx    # Glassmorphism card (React.memo)
│   ├── RepoCard.jsx         # Repository card (React.memo)
│   ├── Loader.jsx           # Skeleton cards + full-page spinner
│   ├── ErrorMessage.jsx     # Error box with retry
│   ├── RateLimitBanner.jsx  # Rate limit warning toast
│   ├── StatsBar.jsx         # Dashboard stats row
│   ├── PageTransition.jsx   # Route-change fade animation
│   ├── Footer.jsx           # App footer
│   └── AboutModal.jsx       # Accessible info modal
│
├── pages/                   # Route-level page components
│   ├── HomePage.jsx         # Search + developer grid + stats
│   ├── DeveloperDetailsPage.jsx  # Profile + repo sort/filter
│   └── FavoritesPage.jsx    # Saved developers + search/export
│
├── redux/                   # State management
│   ├── store.js             # Configured store + localStorage sync
│   ├── developersSlice.js   # Developer data + 4 async thunks
│   └── favoritesSlice.js    # Favorites CRUD + localStorage helpers
│
├── services/
│   └── githubApi.js         # Axios instance + interceptors + API methods
│
├── utils/
│   └── sessionStats.js      # Session-scoped profile-visit counter
│
├── App.jsx                  # Routes + layout shell
├── main.jsx                 # Entry point — Provider + BrowserRouter
├── App.css                  # All component styles
└── index.css                # Design tokens, reset, animations
```

### Data Flow

```
User action → Component → dispatch(thunk) → githubApi.js → GitHub REST API
                                   ↓
                           Redux Store update
                                   ↓
                    Subscribed components re-render
```

### Persistence Strategy

- **Favorites** — stored in `localStorage` as JSON. Loaded at boot; updated via store subscription.
- **Recent Searches** — stored in `localStorage` (max 5 entries). Managed within `SearchBar`.
- **Profiles Viewed** — stored in `sessionStorage`. Reset on tab close.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |

---

## 🌐 API Reference

This project uses the [GitHub REST API](https://docs.github.com/en/rest):

| Endpoint | Used For |
|---|---|
| `GET /users` | Default developer listing |
| `GET /search/users?q=` | Developer search |
| `GET /users/{username}` | Full profile data |
| `GET /users/{username}/repos` | Repository listing |

Rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) are intercepted by the Axios response interceptor and displayed in the `RateLimitBanner` component.

---

## 📄 License

All rights reserved. This repository and its code are for personal portfolio review and viewing purposes only. No permission is granted to copy, modify, distribute, or use this code for any other purpose.
