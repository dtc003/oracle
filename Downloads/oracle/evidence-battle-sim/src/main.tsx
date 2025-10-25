import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx loaded');
console.log('Root element:', document.getElementById('root'));

const root = document.getElementById('root');
if (root) {
  console.log('Creating React root...');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}
