const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Ruta para iniciar sesión consultando la tabla usuarios en MySQL
router.post('/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // Consultamos a MySQL el usuario y contraseña
        const [rows] = await pool.query(
            'SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.usuario = ? AND u.contrasena = ?',
            [usuario, contrasena]
        );

        if (rows.length > 0) {
            const usuarioEncontrado = rows[0];
            res.json({
                ok: true,
                mensaje: 'Autenticación exitosa',
                usuario: {
                    id: usuarioEncontrado.id_usuario,
                    nombre: usuarioEncontrado.nombre,
                    user: usuarioEncontrado.usuario,
                    rol: usuarioEncontrado.nombre_rol
                }
            });
        } else {
            res.status(401).json({
                ok: false,
                mensaje: 'Usuario o contraseña incorrectos'
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;