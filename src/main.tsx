
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check for redirect from 404 page
const redirect = sessionStorage.redirect;
if (redirect) {
  // Clear the sessionStorage
  delete sessionStorage.redirect;
  
  // Extract the path from the redirected URL
  const url = new URL(redirect);
  const basename = import.meta.env.PROD ? '/barcode-lookup-web-app' : '';
  
  // If there's a path after the basename, use history API to navigate there
  if (url.pathname.includes(basename) && url.pathname !== basename && url.pathname !== basename + '/') {
    const path = url.pathname.replace(basename, '');
    window.history.replaceState(null, '', basename + path + (url.search || '') + (url.hash || ''));
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(<App />);
