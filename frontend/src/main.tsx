import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import local font weights for Geist if we were using local files, 
// but for now we assume it's correctly linked or loaded via npm.
// import 'geist/dist/index.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
