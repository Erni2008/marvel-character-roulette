import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/theme.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// A new build takes over immediately: reload once when the new service worker is in control
// (skipped mid-round so a running guess is never interrupted; the next screen change picks it up).
if ('serviceWorker' in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    const apply = () => {
      if (reloaded) return;
      reloaded = true;
      location.reload();
    };
    if (/#\/(draw|guess)/.test(location.hash)) window.addEventListener('hashchange', apply, { once: true });
    else apply();
  });
}
