DROP DATABASE IF EXISTS panlogic_db;
CREATE DATABASE panlogic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE panlogic_db;

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL,
    descripcion VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    ultimo_acceso DATETIME,
    intentos_fallidos INT DEFAULT 0,
    estado ENUM('Activo', 'Bloqueado', 'Inactivo') DEFAULT 'Activo',
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(150),
    insumos TEXT
) ENGINE=InnoDB;

CREATE TABLE materia_prima (
    id_materia_prima INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_adquisicion DATE,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20),
    stock INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE recetas (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL UNIQUE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ingredientes_receta (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_materia_prima INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_materia_prima) REFERENCES materia_prima(id_materia_prima) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NULL,
    id_materia_prima INT NULL,
    tipo_inventario VARCHAR(30) NOT NULL,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    alerta_activa BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_materia_prima) REFERENCES materia_prima(id_materia_prima) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE alertas_stock (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    id_inventario INT NOT NULL,
    nivel_actual DECIMAL(10,2) NOT NULL,
    stock_minimo DECIMAL(10,2) NOT NULL,
    fecha DATE DEFAULT (CURRENT_DATE),
    estado VARCHAR(30) DEFAULT 'Pendiente',
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE produccion (
    id_produccion INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE DEFAULT (CURRENT_DATE),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    id_cajero INT NOT NULL,
    estado VARCHAR(30) DEFAULT 'Completada',
    FOREIGN KEY (id_cajero) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE item_ventas (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE facturas (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    cliente VARCHAR(100) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado_factura VARCHAR(30) DEFAULT 'Emitida',
    id_venta INT NOT NULL UNIQUE,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


INSERT INTO roles (nombre_rol, descripcion) VALUES
('Administrador', 'Acceso total al sistema y configuración'),
('Panadero', 'Gestión de producción, recetas e insumos'),
('Cajero', 'Registro de ventas y generación de facturas');

INSERT INTO usuarios (nombre, usuario, contrasena, id_rol) VALUES
('Carlos Administrador', 'admin', 'hash_secure_password_1', 1),
('Juan Panadero', 'jpanadero', 'hash_secure_password_2', 2),
('María Cajera', 'mcajera', 'hash_secure_password_3', 3);

INSERT INTO proveedores (nombre, telefono, email, direccion, insumos) VALUES
('Harinas del Valle S.A.', '6015551234', 'contacto@harinasvalle.com', 'Calle 45 # 12-30', 'Harina de trigo, Levadura'),
('Lácteos El Recreo', '6015555678', 'ventas@elrecreo.com', 'Carrera 10 # 20-50', 'Mantequilla, Leche');

INSERT INTO materia_prima (nombre, unidad, cantidad, fecha_adquisicion, id_proveedor) VALUES
('Harina de Trigo', 'Kg', 500.00, '2026-08-01', 1),
('Mantequilla', 'Kg', 50.00, '2026-08-05', 2),
('Levadura', 'Kg', 20.00, '2026-08-01', 1);

INSERT INTO productos (nombre, categoria, precio, unidad, stock) VALUES
('Pan Blandito x10', 'Panadería', 5000.00, 'Bolsa', 40),
('Croissant de Queso', 'Hojaldres', 3500.00, 'Unidad', 25);

INSERT INTO recetas (id_producto) VALUES (1);

INSERT INTO ingredientes_receta (id_receta, id_materia_prima, cantidad, unidad) VALUES
(1, 1, 0.50, 'Kg'),
(1, 2, 0.10, 'Kg'),
(1, 3, 0.02, 'Kg');

INSERT INTO inventario (id_materia_prima, tipo_inventario, stock_minimo, alerta_activa) VALUES
(2, 'Insumo', 10.00, TRUE);

INSERT INTO alertas_stock (id_inventario, nivel_actual, stock_minimo, estado) VALUES
(1, 8.50, 10.00, 'Activa');

INSERT INTO ventas (total, id_cajero) VALUES (12000.00, 3);

INSERT INTO item_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 5000.00, 5000.00),
(1, 2, 2, 3500.00, 7000.00);

INSERT INTO facturas (numero, fecha, cliente, total, id_venta) VALUES
('FACT-0001', NOW(), 'Cliente Mostrador', 12000.00, 1);

SELECT * FROM usuarios;

SELECT u.id_usuario, u.nombre, u.usuario, r.nombre_rol 
FROM usuarios u 
JOIN roles r ON u.id_rol = r.id_rol;

SELECT * FROM productos;
SELECT * FROM materia_prima;

SELECT v.id_venta, v.fecha, f.numero AS numero_factura, f.cliente, v.total 
FROM ventas v 
JOIN facturas f ON v.id_venta = f.id_venta;

