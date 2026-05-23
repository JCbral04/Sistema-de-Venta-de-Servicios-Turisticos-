import { supabase } from '../config/supabase.js';
import { formatResponse, handleError } from '../utils/helpers.js';

// GET /api/catalogo/servicios
export const getServicios = async (req, res) => {
  try {
    const { pais, categoria, disponible = 'true' } = req.query;

    // Primero obtener servicios con joins manuales
    let query = supabase
      .from('servicios')
      .select('*');

    if (disponible === 'true') {
      query = query.eq('estado', 'disponible');
    }

    // Aplicar filtros si existen
    if (pais) {
      // Necesitamos filtrar por país a través de la relación ciudad -> país
      // Primero obtener IDs de ciudades que pertenecen a ese país
      const { data: ciudadesPais } = await supabase
        .from('ciudades')
        .select('id_ciudad')
        .eq('id_pais', pais);
      
      if (ciudadesPais && ciudadesPais.length > 0) {
        const ciudadIds = ciudadesPais.map(c => c.id_ciudad);
        query = query.in('id_ciudad', ciudadIds);
      }
    }

    if (categoria) {
      query = query.eq('id_categoria', categoria);
    }

    const { data: servicios, error } = await query;

    if (error) throw error;

    // Obtener datos relacionados manualmente
    const [ciudadesRes, paisesRes, categoriasRes] = await Promise.all([
      supabase.from('ciudades').select('*, paises(*)'),
      supabase.from('paises').select('*'),
      supabase.from('categorias').select('*')
    ]);

    const ciudadesMap = new Map(ciudadesRes.data?.map(c => [c.id_ciudad, c]) || []);
    const categoriasMap = new Map(categoriasRes.data?.map(c => [c.id_categoria, c]) || []);

    // Formatear respuesta
    const serviciosFormateados = servicios?.map(s => {
      const ciudad = ciudadesMap.get(s.id_ciudad);
      const categoria = categoriasMap.get(s.id_categoria);
      
      return {
        id_servicio: s.id_servicio,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precio: s.precio,
        estado: s.estado,
        cupos_disponibles: s.cupos_disponibles,
        imagen: s.imagen,
        duracion: s.duracion,
        ciudad: ciudad?.nombre_ciudad,
        pais: ciudad?.paises?.nombre_pais,
        codigo_iso: ciudad?.paises?.codigo_iso,
        categoria: categoria?.nombre_categoria,
        id_ciudad: s.id_ciudad,
        id_categoria: s.id_categoria,
        id_pais: ciudad?.paises?.id_pais
      };
    }) || [];

    return res.json(formatResponse(true, serviciosFormateados));
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/catalogo/servicios/:id
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: servicio, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('id_servicio', id)
      .single();

    if (error) throw error;
    if (!servicio) {
      return res.status(404).json(formatResponse(false, null, 'Servicio no encontrado'));
    }

    // Obtener datos relacionados
    const [{ data: ciudades }, { data: categorias }] = await Promise.all([
      supabase.from('ciudades').select('*, paises(*)').eq('id_ciudad', servicio.id_ciudad),
      supabase.from('categorias').select('*').eq('id_categoria', servicio.id_categoria)
    ]);

    const ciudad = ciudades?.[0];
    const categoria = categorias?.[0];

    const servicioFormateado = {
      id_servicio: servicio.id_servicio,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      estado: servicio.estado,
      cupos_disponibles: servicio.cupos_disponibles,
      imagen: servicio.imagen,
      duracion: servicio.duracion,
      ciudad: ciudad?.nombre_ciudad,
      pais: ciudad?.paises?.nombre_pais,
      codigo_iso: ciudad?.paises?.codigo_iso,
      categoria: categoria?.nombre_categoria,
      id_ciudad: servicio.id_ciudad,
      id_categoria: servicio.id_categoria,
      id_pais: ciudad?.paises?.id_pais
    };

    return res.json(formatResponse(true, servicioFormateado));
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/catalogo/paises
export const getPaises = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('paises')
      .select('*')
      .order('nombre_pais');

    if (error) throw error;
    return res.json(formatResponse(true, data));
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/catalogo/ciudades
export const getCiudades = async (req, res) => {
  try {
    const { pais } = req.query;

    let query = supabase
      .from('ciudades')
      .select('*, paises(id_pais, nombre_pais)')
      .order('nombre_ciudad');

    if (pais) {
      query = query.eq('id_pais', pais);
    }

    const { data, error } = await query;

    if (error) throw error;
    return res.json(formatResponse(true, data));
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/catalogo/categorias
export const getCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre_categoria');

    if (error) throw error;
    return res.json(formatResponse(true, data));
  } catch (error) {
    return handleError(res, error);
  }
};