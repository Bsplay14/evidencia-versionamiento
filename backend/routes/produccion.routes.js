const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener registros de producción/lotes
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pr.*, p.nombre AS nombre_producto 
            FROM produccion pr 
            LEFT JOIN productos p ON pr.id_producto = p.id_producto
            ORDER BY pr.fecha_produccion DESC
        `);
        res.json({ ok: true, produccion: rows });
    } catch (error) {
        console.error('Error al obtener registros de producción:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar producción' });
    }
});

// Registrar una nueva producción
router.post('/', async (req, res) => {
    const { id_producto, cantidad_producida, fecha_produccion, id_usuario } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO produccion (id_producto, cantidad_producida, fecha_produccion, id_usuario) VALUES (?, ?, ?, ?)',
            [id_producto, cantidad_producida, fecha_produccion || new Date(), id_usuario]
        );
        res.json({ ok: true, id: result.insertId, mensaje: 'Lote de producción registrado' });
    } catch (error) {
        console.error('Error al registrar producción:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al registrar producción' });
    }
});

module.exports = router;