import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ContractPage from './components/ContractPage';
import CreateContract from './components/CreateContract';
import Authentication from './components/Authentication';
import LegalDoc from './components/LegalDoc';
import Footer from './components/Footer';
import 'react-quill/dist/quill.snow.css';
import './index.css';  // or whatever your main CSS file is named

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} />
        <main className="container mx-auto mt-4 p-4">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Authentication />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/contract/:id"
              element={user ? <ContractPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/create-contract"
              element={user ? <CreateContract /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Authentication />} />
            <Route path="/legal/:docType" element={<LegalDoc />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;