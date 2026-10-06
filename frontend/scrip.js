const API_URL = "http://127.0.0.1:5000/api";

let usuarioActivo = null;
let carrito = [];
let totalActual = 0;
let clienteEnEdicion = "";
let cuentasAbiertas = JSON.parse(localStorage.getItem("cuentasAbiertas")) || [];
let historialVentasRealizadas = JSON.parse(localStorage.getItem("historialVentas")) || [];


// NAVEGACIÓN Y AUTENTICACIÓN

function navegarA(idVista) {
  document.querySelectorAll(".vista-sistema").forEach((vista) => {
    vista.style.display = "none";
  });

  const vistaDestino = document.getElementById(idVista);
  if (!vistaDestino) return;

  if (idVista === "vista-login") {
    vistaDestino.style.display = "flex";
  } else {
    vistaDestino.style.display = "block";
  }

  if (idVista === "vista-ventas") {
    cargarBotones();
    actualizarPanelCuentasAbiertas();
  }
  if (idVista === "vista-gestion-productos") cargarListaProductos();
  if (idVista === "vista-inventario") cargarInventario();
  if (idVista === "vista-proveedores") cargarProveedores();
  if (idVista === "vista-produccion") cargarProduccion();
}

async function autenticarUsuario() {
  const userInput = document.getElementById("login-usuario").value.trim();
  const passInput = document.getElementById("login-contrasena").value;

  if (!userInput || !passInput) {
    alert("Por favor, ingresa tu usuario y contraseña.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: userInput, contrasena: passInput })
    });

    const data = await respuesta.json();

    if (respuesta.ok && data.ok) {
      usuarioActivo = data.usuario;
      mostrarNotificacion(`Bienvenido, ${usuarioActivo.nombre} (${usuarioActivo.rol})`);
      document.getElementById("login-usuario").value = "";
      document.getElementById("login-contrasena").value = "";
      navegarA("vista-modulos");
    } else {
      alert(data.mensaje || "Usuario o contraseña incorrectos.");
    }
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    alert("❌ Error de conexión: Asegúrate de que el servidor Backend esté ejecutándose en el puerto 5000.");
  }
}

function cerrarSesion() {
  usuarioActivo = null;
  navegarA("vista-login");
}


//  CAJA POS Y PALETA DE COLORES

function obtenerColorPorCategoria(cat, nombre) {
  const texto = ((cat || "") + " " + (nombre || "")).toLowerCase();
  
  if (texto.includes("capuchino") || texto.includes("tinto") || texto.includes("milo")) return "#d7ccc8";
  if (texto.includes("pastel")) return "#ffe0b2";
  if (texto.includes("palito") || texto.includes("brigadeiro") || texto.includes("galletas")) return "#ffe0b2";
  if (texto.includes("sánduche") || texto.includes("sanduche")) return "#f8bbd0";
  if (texto.includes("soda") || texto.includes("coca") || texto.includes("malta") || texto.includes("jugo")) return "#b3e5fc";
  if (texto.includes("cerveza")) return "#fff9c4";
  return "#e0e0e0";
}

async function cargarBotones() {
  const grid = document.getElementById("grid-botones");
  if (!grid) return;
  grid.innerHTML = "<p>Cargando productos desde MySQL...</p>";

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const data = await respuesta.json();

    if (respuesta.ok && data.ok) {
      grid.innerHTML = "";
      data.productos.forEach((prod) => {
        const boton = document.createElement("button");
        boton.className = "btn-producto";
        boton.style.backgroundColor = obtenerColorPorCategoria(prod.categoria, prod.nombre);

        const precioNumero = parseFloat(prod.precio || prod.precio_venta || 0);

        boton.innerHTML = `<b>${prod.nombre}</b>$${precioNumero.toLocaleString()}`;
        boton.onclick = () => agregarAlCarrito({ ...prod, precio: precioNumero });
        grid.appendChild(boton);
      });
    } else {
      grid.innerHTML = "<p>No hay productos guardados en MySQL.</p>";
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);
    grid.innerHTML = "<p>❌ Error de conexión al consultar la base de datos.</p>";
  }
}

function agregarAlCarrito(prod) {
  const inputCant = document.getElementById("cantidad-input");
  const cant = parseInt(inputCant ? inputCant.value : 1) || 1;
  
  for (let i = 0; i < cant; i++) {
    carrito.push({ ...prod });
    totalActual += prod.precio;
  }
  actualizarInterfazVentas();
  if (inputCant) inputCant.value = 1;
}

function actualizarInterfazVentas() {
  const lista = document.getElementById("lista-ventas");
  if (!lista) return;
  lista.innerHTML = "";
  
  const agrupados = {};
  carrito.forEach((item) => {
    agrupados[item.nombre] = agrupados[item.nombre] || { cant: 0, precio: item.precio };
    agrupados[item.nombre].cant++;
  });

  for (const nombre in agrupados) {
    const info = agrupados[nombre];
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "4px 0";
    li.style.borderBottom = "1px solid #f0f0f0";
    li.style.fontSize = "13px";
    li.innerHTML = `
      <span>${info.cant > 1 ? `<b>${info.cant}x</b> ` : ""}${nombre}</span>
      <span>$${(info.cant * info.precio).toLocaleString()}
      <button onclick="eliminarGrupo('${nombre}')" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold; margin-left:8px;">✕</button></span>
    `;
    lista.appendChild(li);
  }

  const elTotal = document.getElementById("total-pagar");
  if (elTotal) elTotal.textContent = `$${totalActual.toLocaleString()}`;
  calcularCambio();
}

function eliminarGrupo(nombre) {
  const items = carrito.filter((item) => item.nombre === nombre);
  if (items.length > 0) {
    totalActual -= items.length * items[0].precio;
    carrito = carrito.filter((item) => item.nombre !== nombre);
    actualizarInterfazVentas();
  }
}

function calcularCambio() {
  const elPago = document.getElementById("pago-con");
  const pagoCon = parseInt(elPago ? elPago.value : 0) || 0;
  const cambio = pagoCon - totalActual;
  const res = document.getElementById("cambio-resultado");
  
  if (res) {
    if (pagoCon > 0) {
      res.textContent = `$${cambio.toLocaleString()}`;
      res.style.color = cambio < 0 ? "red" : "#2e7d32";
    } else {
      res.textContent = "$0";
    }
  }
}

function limpiarCuenta() {
  carrito = [];
  totalActual = 0;
  clienteEnEdicion = "";
  actualizarInterfazVentas();
  const elPago = document.getElementById("pago-con");
  if (elPago) elPago.value = "";
}


// CUENTAS ABIERTAS

function abrirModalAlias() {
  if (carrito.length === 0) return alert("La caja está vacía.");
  const elAlias = document.getElementById("alias-cliente");
  if (elAlias) elAlias.value = clienteEnEdicion;
  const modal = document.getElementById("modal-alias");
  if (modal) modal.style.display = "flex";
}

function cerrarModalAlias() {
  const modal = document.getElementById("modal-alias");
  if (modal) modal.style.display = "none";
}

function confirmarGuardarCuenta() {
  const elAlias = document.getElementById("alias-cliente");
  const alias = elAlias ? elAlias.value.trim() : "";
  if (!alias) return alert("Escribe un nombre o mesa para la cuenta.");

  const index = cuentasAbiertas.findIndex(
    (c) => c.alias.toLowerCase() === alias.toLowerCase()
  );
  const nuevaCuenta = { alias, productos: [...carrito], total: totalActual };

  if (index !== -1) {
    cuentasAbiertas[index] = nuevaCuenta;
  } else {
    cuentasAbiertas.push(nuevaCuenta);
  }

  localStorage.setItem("cuentasAbiertas", JSON.stringify(cuentasAbiertas));
  limpiarCuenta();
  cerrarModalAlias();
  actualizarPanelCuentasAbiertas();
  mostrarNotificacion("Cuenta Guardada");
}

function actualizarPanelCuentasAbiertas() {
  const panel = document.getElementById("lista-cuentas-abiertas");
  if (!panel) return;
  panel.innerHTML = "";

  if (cuentasAbiertas.length === 0) {
    panel.innerHTML = '<p style="color: #888; font-size: 13px;">No hay cuentas pendientes.</p>';
    return;
  }

  cuentasAbiertas.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "tarjeta-cuenta";
    div.innerHTML = `
      <div>
        <p style="font-size: 12px; font-weight: bold;">${c.alias.toUpperCase()}</p>
        <span style="font-size: 11px; color: #555;">$${c.total.toLocaleString()}</span>
      </div>
      <button class="btn-cargar" onclick="cargarCuentaAbierta(${i})">Cargar</button>
    `;
    panel.appendChild(div);
  });
}

function cargarCuentaAbierta(i) {
  const c = cuentasAbiertas[i];
  carrito = [...c.productos];
  totalActual = c.total;
  clienteEnEdicion = c.alias;

  cuentasAbiertas.splice(i, 1);
  localStorage.setItem("cuentasAbiertas", JSON.stringify(cuentasAbiertas));

  actualizarInterfazVentas();
  actualizarPanelCuentasAbiertas();
}



// REGISTRO DE VENTAS Y REPORTE DE CIERRE


function cobrar(metodo) {
  if (carrito.length === 0) return alert("La caja está vacía.");

  const ventaActual = {
    metodo: metodo,
    items: [...carrito],
    total: totalActual
  };

  historialVentasRealizadas.push(ventaActual);
  localStorage.setItem("historialVentas", JSON.stringify(historialVentasRealizadas));

  limpiarCuenta();
  mostrarNotificacion(`Venta cobrada (${metodo})`);
}

function generarDatosConsolidados() {
  const productosConsolidados = {};
  let totalEfectivo = 0;
  let totalTransferencia = 0;

  historialVentasRealizadas.forEach((venta) => {
    if (venta.metodo === "Efectivo") {
      totalEfectivo += venta.total;
    } else {
      totalTransferencia += venta.total;
    }

    if (Array.isArray(venta.items)) {
      venta.items.forEach((prod) => {
        const nombreProd = prod.nombre || "Producto";
        productosConsolidados[nombreProd] = (productosConsolidados[nombreProd] || 0) + 1;
      });
    }
  });

  return {
    productos: productosConsolidados,
    efectivo: totalEfectivo,
    transferencia: totalTransferencia,
    total: totalEfectivo + totalTransferencia
  };
}

function cerrarCaja() {
  const datos = generarDatosConsolidados();
  const tbody = document.getElementById("tabla-cierre-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const nombresProductos = Object.keys(datos.productos);

  if (nombresProductos.length === 0) {
    tbody.innerHTML = "<tr><td colspan='2' style='text-align:center;'>No hay ventas registradas en este turno.</td></tr>";
  } else {
    nombresProductos.forEach((prod) => {
      tbody.innerHTML += `
        <tr>
          <td>${prod}</td>
          <td style="text-align: center; font-weight: bold;">${datos.productos[prod]}</td>
        </tr>
      `;
    });
  }

  document.getElementById("resumen-efectivo").textContent = `$${datos.efectivo.toLocaleString()}`;
  document.getElementById("resumen-transferencia").textContent = `$${datos.transferencia.toLocaleString()}`;
  document.getElementById("resumen-total").textContent = `$${datos.total.toLocaleString()}`;

  const modal = document.getElementById("modal-cierre-caja");
  if (modal) modal.style.display = "flex";
}

function cerrarModalReporte() {
  const modal = document.getElementById("modal-cierre-caja");
  if (modal) modal.style.display = "none";
}

function descargarExcelCierre() {
  if (historialVentasRealizadas.length === 0) {
    return alert("No hay ventas grabadas en el turno actual para exportar.");
  }

  const datos = generarDatosConsolidados();

  
  let contenidoCSV = "Producto;Cantidad\n";
  for (const prod in datos.productos) {
    contenidoCSV += `"${prod}";${datos.productos[prod]}\n`;
  }

  contenidoCSV += "\nRESUMEN;\n";
  contenidoCSV += `Efectivo;${datos.efectivo}\n`;
  contenidoCSV += `Transferencia;${datos.transferencia}\n`;
  contenidoCSV += `TOTAL;${datos.total}\n`;

  const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.setAttribute("href", url);
  enlace.setAttribute("download", `Reporte_Ventas_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  // LIMPIAR Y REINICIAR HISTORIAL DE VENTAS DEL TURNO
  historialVentasRealizadas = [];
  localStorage.removeItem("historialVentas");

  cerrarModalReporte();
  mostrarNotificacion("Cierre de caja completado y caja reiniciada a $0");
}

function descargarReporteExcel() {
  cerrarCaja();
}


// RESTO DE MÓDULOS

async function cargarListaProductos() {
  const tbody = document.getElementById("tabla-productos-body");
  if (!tbody) return;
  try {
    const res = await fetch(`${API_URL}/productos`);
    const data = await res.json();
    if (res.ok && data.ok) {
      tbody.innerHTML = "";
      data.productos.forEach((p) => {
        tbody.innerHTML += `
          <tr>
            <td><b>${p.nombre}</b></td>
            <td>${p.categoria || "Panadería"}</td>
            <td>$${p.precio_costo || 0}</td>
            <td>$${p.precio || p.precio_venta || 0}</td>
            <td style="text-align: center;"><button class="btn-tabla-editar">Editar</button></td>
          </tr>
        `;
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function cargarInventario() {
  const tbody = document.getElementById("tabla-inventario-body");
  if (!tbody) return;
  try {
    const res = await fetch(`${API_URL}/inventario`);
    const data = await res.json();
    if (res.ok && data.ok) {
      tbody.innerHTML = "";
      data.inventario.forEach((item) => {
        const id = item.id_inventario || item.id;
        tbody.innerHTML += `
          <tr>
            <td>INS-${id}</td>
            <td><b>${item.nombre_item || item.nombre || "Insumo"}</b></td>
            <td>${item.categoria || "General"}</td>
            <td>${item.stock_actual || 0} ${item.unidad_medida || ''}</td>
            <td>${item.stock_minimo || 10}</td>
            <td style="text-align: center;">
              <button class="btn-tabla-editar" onclick="actualizarStockPrompt(${id}, ${item.stock_actual || 0})">Editar Stock</button>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function actualizarStockPrompt(id, stockActual) {
  const nuevoStock = prompt("Ingresa la nueva cantidad en stock:", stockActual);
  if (nuevoStock === null || nuevoStock === "") return;

  try {
    const respuesta = await fetch(`${API_URL}/inventario/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_actual: parseFloat(nuevoStock) })
    });
    const data = await respuesta.json();
    if (respuesta.ok && data.ok) {
      mostrarNotificacion("Stock actualizado");
      cargarInventario();
    }
  } catch (error) {
    console.error(error);
  }
}

let idProveedorSeleccionado = null;

async function cargarProveedores() {
  const tbody = document.getElementById("tabla-proveedores-body");
  if (!tbody) return;
  try {
    const res = await fetch(`${API_URL}/proveedores`);
    const data = await res.json();
    if (res.ok && data.ok) {
      tbody.innerHTML = "";
      data.proveedores.forEach((prov) => {
        tbody.innerHTML += `
          <tr>
            <td><b>${prov.nombre || prov.empresa}</b></td>
            <td>${prov.contacto || "-"}</td>
            <td>${prov.telefono || "-"}</td>
            <td>${prov.email || prov.direccion || "-"}</td>
            <td style="text-align: center;"><button class="btn-tabla-editar">Editar</button></td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function cargarProduccion() {
  const tabla = document.getElementById("tabla-produccion-body");
  if (!tabla) return;
  try {
    const respuesta = await fetch(`${API_URL}/produccion`);
    const data = await respuesta.json();
    if (respuesta.ok && data.ok) {
      tabla.innerHTML = "";
      data.produccion.forEach((prod) => {
        const fecha = new Date(prod.fecha_produccion).toLocaleDateString();
        tabla.innerHTML += `
          <tr>
            <td>${prod.id_produccion || '-'}</td>
            <td>${prod.nombre_producto || 'Lote ID: ' + prod.id_producto}</td>
            <td>${prod.cantidad_producida} un.</td>
            <td>${fecha}</td>
            <td style="text-align: center;"><button class="btn-tabla-editar">Ver</button></td>
          </tr>
        `;
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function mostrarNotificacion(msg) {
  const n = document.getElementById("notificacion");
  if (!n) return;
  n.textContent = "✅ " + msg;
  n.style.display = "block";
  setTimeout(() => (n.style.display = "none"), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  navegarA("vista-login");
});