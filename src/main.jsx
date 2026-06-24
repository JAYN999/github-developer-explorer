/**
 * main.jsx
 * --------
 * Application entry point.
 *
 * Wraps the app in:
 *   <Provider>      – makes the Redux store available everywhere
 *   <BrowserRouter> – enables React Router's client-side routing
 *
 * StrictMode is included to surface potential issues during development.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './redux/store';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
