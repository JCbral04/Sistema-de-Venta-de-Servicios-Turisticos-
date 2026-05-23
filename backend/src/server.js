import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Rutas
import authRoutes from './routes/auth.js';
import catalogoRoutes from './routes/catalogo.js';
import serviciosRoutes from './routes/servicios.js';
import reservasRoutes from './routes/reservas.js';
import usuariosRoutes from './routes/usuarios.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CONFIGURACIÓN CORS CORREGIDA - Múltiples orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',      // Vite dev server
  'http://localhost:3000',      // React dev server alternativo
  'https://jcbral04.github.io',  // GitHub Pages (dominio base)
  process.env.FRONTEND_URL      // Variable de entorno en Render (opcional)
].filter(Boolean); // Elimina undefined/null si FRONTEND_URL no está seteada

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️ Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check mejorado
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API REST - Sistema de Venta de Servicios Turísticos',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// ✅ Ruta raíz para verificar que la API está viva
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API TurismoGlobal está corriendo',
    documentation: '/api/health'
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.path} no encontrada`
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.message);
  
  // Si es error de CORS, devolver 403
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: origen no permitido'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🌴 API REST - Sistema de Venta de Servicios Turísticos ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor corriendo en: http://0.0.0.0:${PORT}         ║`);
  console.log(`║  🌍 Entorno: ${(process.env.NODE_ENV || 'development').padEnd(36)} ║`);
  console.log(`║  🔗 Orígenes permitidos: ${allowedOrigins.length} configurados${' '.repeat(15)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
});

export default app;