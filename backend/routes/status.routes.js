const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { conectarDB } = require('./config/db');

// Importar rutas
const statusRoutes = require('./routes/status.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Ruta raíz de prueba
app.get('/', (req, res) => {
    res.send("<h1>🍞 ¡El backend de PanLogic está perfectamente conectado y vivo!</h1>");
});

// Vincular rutas al servidor
app.use('/api', statusRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000; 

// Inicialización
conectarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n==================================================`);
        console.log(`🔥 ¡ALERTA! SERVIDOR REAL CORRIENDO EN: http://localhost:${PORT}`);
        console.log(`==================================================`);
    });
});