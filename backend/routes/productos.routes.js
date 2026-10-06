const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Ruta GET para obtener todos los productos guardados en MySQL
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json({
            ok: true,
            productos: rows
        });
    } catch (error) {
        console.error('Error al obtener productos de MySQL:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar la base de datos' });
    }
});

module.exports = router;