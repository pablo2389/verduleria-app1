import React, { useState } from "react";

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState({
    nombre: "",
    precio: "",
    stock: "",
  });
  const [venta, setVenta] = useState({});
  const [mostrarProductos, setMostrarProductos] = useState(true);
  const [totalVentas, setTotalVentas] = useState(0);

  const agregarProducto = () => {
    const { nombre, precio, stock } = productoActual;

    if (!nombre || !precio || !stock) return alert("Complete todos los campos.");

    const existente = productos.find(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existente) {
      // Actualiza stock y precio si ya existe
      setProductos((prev) =>
        prev.map((p) =>
          p.nombre.toLowerCase() === nombre.toLowerCase()
            ? {
                ...p,
                stock: parseFloat(p.stock) + parseFloat(stock),
                precio: parseFloat(precio),
              }
            : p
        )
      );
    } else {
      setProductos([
        ...productos,
        {
          nombre,
          precio: parseFloat(precio),
          stock: parseFloat(stock),
        },
      ]);
    }

    setProductoActual({ nombre: "", precio: "", stock: "" });
  };

  const modificarCantidadVenta = (nombre, cantidad) => {
    setVenta((prev) => {
      const actual = parseFloat(prev[nombre] || 0);
      const nuevo = Math.max(0, actual + cantidad);
      return { ...prev, [nombre]: nuevo };
    });
  };

  const registrarVenta = () => {
    let total = 0;

    const nuevosProductos = productos.map((p) => {
      const vendido = parseFloat(venta[p.nombre] || 0);
      if (vendido > 0 && vendido <= p.stock) {
        total += vendido * p.precio;
        return { ...p, stock: p.stock - vendido };
      }
      return p;
    });

    setProductos(nuevosProductos);
    setVenta({});
    setTotalVentas((prev) => prev + total);
  };

  const quitarProducto = (nombre) => {
    setProductos((prev) => prev.filter((p) => p.nombre !== nombre));
    setVenta((prev) => {
      const nuevo = { ...prev };
      delete nuevo[nombre];
      return nuevo;
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🛒 Verdulería - Caja Registradora</h2>

      <h3>Agregar producto</h3>
      <input
        placeholder="Nombre"
        value={productoActual.nombre}
        onChange={(e) =>
          setProductoActual({ ...productoActual, nombre: e.target.value })
        }
      />
      <input
        placeholder="Precio por kilo"
        type="number"
        value={productoActual.precio}
        onChange={(e) =>
          setProductoActual({ ...productoActual, precio: e.target.value })
        }
      />
      <input
        placeholder="Stock (kg)"
        type="number"
        value={productoActual.stock}
        onChange={(e) =>
          setProductoActual({ ...productoActual, stock: e.target.value })
        }
      />
      <button onClick={agregarProducto}>Agregar</button>

      <br />
      <br />
      <button onClick={() => setMostrarProductos(!mostrarProductos)}>
        {mostrarProductos ? "Ocultar productos" : "Mostrar productos"}
      </button>

      {mostrarProductos && (
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <h3>Productos</h3>
          {productos.length === 0 && <p>No hay productos</p>}

          {productos.map((prod) => (
            <div
              key={prod.nombre}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div>
                <strong>{prod.nombre}</strong> - ${prod.precio} - Stock: {prod.stock.toFixed(2)} kg
              </div>
              <div>
                <button onClick={() => modificarCantidadVenta(prod.nombre, 1)}>➕</button>
                <button onClick={() => modificarCantidadVenta(prod.nombre, -1)}>➖</button>
                <button onClick={() => quitarProducto(prod.nombre)}>❌</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Registrar venta</h3>
      {Object.keys(venta).length === 0 && <p>No hay productos seleccionados</p>}
      {Object.entries(venta).map(([nombre, kg]) => {
        const prod = productos.find((p) => p.nombre === nombre);
        if (!prod || kg === 0) return null;

        return (
          <div key={nombre}>
            {nombre} - Stock: {prod.stock.toFixed(3)} kg - Precio: ${prod.precio.toFixed(2)}
            <br />
            Kilos vendidos: {kg.toFixed(2)} kg - Total: ${(kg * prod.precio).toFixed(2)}
          </div>
        );
      })}
      <br />
      <button onClick={registrarVenta}>Registrar Venta</button>

      <h3>Caja registradora</h3>
      <p>Total ventas sesión: ${totalVentas.toFixed(2)}</p>
    </div>
  );
};

export default Dashboard;
