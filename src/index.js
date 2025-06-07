import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Para estilos muito básicos do index, se necessário
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)