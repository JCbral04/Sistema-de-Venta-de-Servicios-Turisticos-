import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import DetalleServicio from './pages/DetalleServicio';
import CarritoPage from './pages/CarritoPage';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';
import MisReservas from './pages/MisReservas';
import LoginPage from './pages/LoginPage'; // ← NUEVO

const RutaProtegida = ({ children }) => {
  const { esAdmin } = useApp();
  return esAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/servicio/:id" element={<DetalleServicio />} />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mis-reservas" element={<MisReservas />} />
              <Route path="/login" element={<LoginPage />} /> {/* ← NUEVO */}
              <Route path="/admin" element={
                <RutaProtegida>
                  <AdminPanel />
                </RutaProtegida>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;