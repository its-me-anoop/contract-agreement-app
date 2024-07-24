import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ContractPage from './components/ContractPage';
import Authentication from './components/Authentication';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contract/:id" element={<ContractPage />} />
        <Route path="/login" element={<Authentication />} />
      </Routes>
    </Router>
  );
}

export default App;