import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { carrito, usuario, esAdmin, logout } = useApp(); // ← Usar logout del contexto
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const cantidadItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // ← Usar la función logout del contexto
    setMenuAbierto(false);
    window.location.reload();
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#2563eb',
          textDecoration: 'none'
        }}>
          🌍 TurismoGlobal
        </Link>
        
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <Link to="/" style={{ color: '#1e293b', textDecoration: 'none', fontWeight: 500 }}>Servicios</Link>
          {usuario && (
            <Link to="/mis-reservas" style={{ color: '#1e293b', textDecoration: 'none', fontWeight: 500 }}>
              Mis Reservas
            </Link>
          )}
          {esAdmin && (
            <Link to="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              Panel Admin
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/carrito" style={{
            position: 'relative',
            padding: '0.5rem',
            color: '#1e293b',
            textDecoration: 'none'
          }}>
            🛒
            {cantidadItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#dc2626',
                color: 'white',
                fontSize: '0.7rem',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cantidadItems}
              </span>
            )}
          </Link>
          
          {usuario ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  userSelect: 'none'
                }}
              >
                👤 {usuario.nombre}
              </div>
              
              {menuAbierto && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{usuario.nombre}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{usuario.correo}</p>
                  </div>
                  <Link 
                    to="/mis-reservas" 
                    onClick={() => setMenuAbierto(false)}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: '#1e293b',
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    📋 Mis Reservas
                  </Link>
                  <div 
                    onClick={handleLogout}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      borderTop: '1px solid #e2e8f0'
                    }}
                  >
                    🚪 Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;