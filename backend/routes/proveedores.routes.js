const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM proveedores');
        res.json({ ok: true, proveedores: rows });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar la base de datos' });
    }
});

// Crear un nuevo proveedor
router.post('/', async (req, res) => {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)',
            [nombre, contacto, telefono, email, direccion]
        );
        res.json({ ok: true, id: result.insertId, mensaje: 'Proveedor registrado con éxito' });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al registrar proveedor' });
    }
});

module.exports = router;