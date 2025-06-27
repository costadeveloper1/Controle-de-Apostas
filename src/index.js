import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Para estilos muito básicos do index, se necessário
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="867671556654-nqm4emvupgpavq9cpovr3hoqgjjicf2b.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)