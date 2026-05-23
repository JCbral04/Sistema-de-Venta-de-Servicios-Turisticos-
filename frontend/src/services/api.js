const API_URL = 'https://turismo-global-api.onrender.com/api';

const getToken = () => localStorage.getItem('token');

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // ✅ Si la respuesta está vacía (204 No Content, etc.)
    if (response.status === 204) {
      return { success: true };
    }

    // ✅ Intentar parsear JSON, si falla manejar el error
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || `Error ${response.status}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    // ✅ Distinguir entre error de red/CORS y error del servidor
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión o que el servidor esté activo.');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Posible problema de CORS o el servidor no responde.');
    }
    throw error;
  }
};

// ==================== AUTH ====================
export const register = (userData) =>
  fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const login = (credentials) =>
  fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const getMe = () => fetchWithAuth('/auth/me');

// ==================== CATÁLOGO (público) ====================
export const getServicios = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return fetchWithAuth(`/catalogo/servicios?${params}`);
};

export const getServicio = (id) => fetchWithAuth(`/catalogo/servicios/${id}`);
export const getPaises = () => fetchWithAuth('/catalogo/paises');
export const getCiudades = (paisId) =>
  fetchWithAuth(`/catalogo/ciudades${paisId ? `?pais=${paisId}` : ''}`);
export const getCategorias = () => fetchWithAuth('/catalogo/categorias');

// ==================== SERVICIOS (Admin) ====================
export const createServicio = (data) =>
  fetchWithAuth('/servicios', { method: 'POST', body: JSON.stringify(data) });

export const updateServicio = (id, data) =>
  fetchWithAuth(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteServicio = (id) =>
  fetchWithAuth(`/servicios/${id}`, { method: 'DELETE' });

export const getAllServiciosAdmin = () => fetchWithAuth('/servicios');

// ==================== RESERVAS ====================
export const createReserva = (data) =>
  fetchWithAuth('/reservas', { method: 'POST', body: JSON.stringify(data) });

export const getMisReservas = () => fetchWithAuth('/reservas/mis-reservas');

export const cancelarReserva = (id) =>
  fetchWithAuth(`/reservas/${id}/cancelar`, { method: 'PUT' });

// ==================== USUARIOS (Admin) ====================
export const getUsuarios = () => fetchWithAuth('/usuarios');

export const updateRol = (id, rol) =>
  fetchWithAuth(`/usuarios/${id}/rol`, { method: 'PUT', body: JSON.stringify({ rol }) });