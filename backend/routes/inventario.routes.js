const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener el inventario de materias primas o insumos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventario');
        res.json({ ok: true, inventario: rows });
    } catch (error) {
        console.error('Error al consultar inventario:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar inventario' });
    }
});

// Actualizar stock de un insumo
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { stock_actual } = req.body;
    try {
        await pool.query('UPDATE inventario SET stock_actual = ? WHERE id_inventario = ?', [stock_actual, id]);
        res.json({ ok: true, mensaje: 'Stock actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar inventario:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el stock' });
    }
});

module.exports = router;