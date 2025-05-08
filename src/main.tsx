
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check for redirect from 404 page
const redirect = sessionStorage.redirect;
if (redirect) {
  // Clear the sessionStorage
  delete sessionStorage.redirect;
  
  // Get the basename from environment
  const basename = import.meta.env.BASE_URL || '/barcode-lookup-web-app/';
  
  // Extract the redirect path and navigate to it
  const path = redirect;
  
  // Use history API to navigate to the intended URL
  if (path !== basename && !path.startsWith(basename + 'assets/')) {
    window.history.replaceState(null, '', path);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(<App />);
