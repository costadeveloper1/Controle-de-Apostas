import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BettingTracker from './BettingTracker';
import ReportsPage from './components/ReportsPage'; // Certifique-se de que este arquivo exista!
import './App.css'; // Futuramente podemos adicionar estilos globais aqui

function App() {
  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen text-gray-100">
        <Routes>
          <Route path="/*" element={<BettingTracker />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 