import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [servicios, setServicios] = useState([]);
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('carrito');
    return saved ? JSON.parse(saved) : [];
  });
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar servicios desde el backend
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoading(true);
        const response = await api.getServicios();
        if (response.success) {
          setServicios(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarServicios();
  }, []);

  // Guardar carrito en localStorage (temporal hasta checkout)
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Guardar usuario en localStorage y verificar rol
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('token', usuario.token);
      // Usar rol real del backend, NO email.includes('admin')
      setEsAdmin(usuario.rol === 'admin');
    } else {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      setEsAdmin(false);
    }
  }, [usuario]);

  // Login
  const login = async (correo, password) => {
    try {
      const response = await api.login({ correo, password });
      if (response.success) {
        setUsuario(response.data);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Register
  const register = async (nombre, correo, password) => {
    try {
      const response = await api.register({ nombre, correo, password });
      if (response.success) {
        setUsuario(response.data);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = () => {
    setUsuario(null);
    setCarrito([]);
  };

  // ==================== SERVICIOS (Admin) ====================
  const agregarServicio = async (servicio) => {
    try {
      const response = await api.createServicio(servicio);
      if (response.success) {
        setServicios([...servicios, response.data]);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const editarServicio = async (id, datosActualizados) => {
    try {
      const response = await api.updateServicio(id, datosActualizados);
      if (response.success) {
        setServicios(servicios.map(s => 
          s.id_servicio === id ? { ...s, ...response.data } : s
        ));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const eliminarServicio = async (id) => {
    try {
      await api.deleteServicio(id);
      setServicios(servicios.filter(s => s.id_servicio !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ==================== CARRITO ====================
  const agregarAlCarrito = (servicio) => {
    const existe = carrito.find(item => item.id_servicio === servicio.id_servicio);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.id_servicio === servicio.id_servicio
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...servicio, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id_servicio) => {
    setCarrito(carrito.filter(item => item.id_servicio !== id_servicio));
  };

  const actualizarCantidad = (id_servicio, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id_servicio);
    } else {
      setCarrito(carrito.map(item =>
        item.id_servicio === id_servicio ? { ...item, cantidad } : item
      ));
    }
  };

  const vaciarCarrito = () => setCarrito([]);

  const totalCarrito = carrito.reduce((sum, item) => 
    sum + (item.precio * item.cantidad), 0
  );

  // ==================== RESERVAS ====================
  const crearReserva = async () => {
    if (!usuario) return { success: false, error: 'Debes iniciar sesión' };

    try {
      for (const item of carrito) {
        await api.createReserva({
          id_servicio: item.id_servicio,
          cantidad: item.cantidad,
        });
      }
      vaciarCarrito();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AppContext.Provider value={{
      servicios,
      carrito,
      usuario,
      esAdmin,
      loading,
      error,
      login,
      register,
      logout,
      setUsuario,      // ← AGREGAR
      setEsAdmin,      // ← AGREGAR
      agregarServicio,
      editarServicio,
      eliminarServicio,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      totalCarrito,
      crearReserva,
    }}>
      {children}
    </AppContext.Provider>
  );
};