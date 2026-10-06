const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const produccionRoutes = require('./routes/produccion.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Probar estado de la API
app.get('/', (req, res) => {
  res.send('<h1>🍞 Backend PanLogic Activo</h1>');
});

// Enlazar Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/produccion', produccionRoutes);

// Endpoint opcional de Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT COUNT(*) as totalProductos FROM productos');
    const [ventas] = await pool.query('SELECT COUNT(*) as totalVentas, SUM(monto) as totalIngresos FROM ventas');
    
    res.json({
      ok: true,
      totalProductos: productos[0].totalProductos,
      totalVentas: ventas[0].totalVentas,
      totalIngresos: ventas[0].totalIngresos || 0
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🔥 Servidor PanLogic corriendo en: http://localhost:${PORT}`);
  console.log(`==================================================`);

  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
  }
});

