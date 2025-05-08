
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check for redirect from 404 page
const redirect = sessionStorage.redirect;
if (redirect) {
  // Clear the sessionStorage
  delete sessionStorage.redirect;
  
  // Use history API to navigate to the intended URL
  if (redirect !== '/barcode-lookup-web-app/' && !redirect.startsWith('/barcode-lookup-web-app/assets/')) {
    window.history.replaceState(null, '', redirect);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(<App />);
