import React, { useState, useEffect } from "react";

const VentaFormMultiple = ({ productos, onRegistrarVenta }) => {
  const [cantidades, setCantidades] = useState({});
  const [ventaTotal, setVentaTotal] = useState(0);

  const handleCantidadChange = (id, value) => {
    const num = Number(value);
    if (num < 0) return; // evitar negativos
    setCantidades({ ...cantidades, [id]: num });
  };

  useEffect(() => {
    let total = 0;
    for (const producto of productos) {
      const cantidad = cantidades[producto.id] || 0;
      if (cantidad > 0) {
        let subtotal = 0;
        if (producto.unidad === "grs") {
          subtotal = producto.precio * (cantidad / 1000);
        } else {
          subtotal = producto.precio * cantidad;
        }
        total += subtotal;
      }
    }
    setVentaTotal(total);
  }, [cantidades, productos]);

  const registrarVentaClick = () => {
    const ventasArray = Object.entries(cantidades)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ productoId: id, cantidad }));

    if (ventasArray.length === 0) {
      alert("Ingrese al menos una cantidad para registrar la venta.");
      return;
    }

    onRegistrarVenta(ventasArray);
    setCantidades({});
    setVentaTotal(0);
  };

  const reiniciar = () => {
    setCantidades({});
    setVentaTotal(0);
  };

  const hayVentas = Object.values(cantidades).some((cantidad) => cantidad > 0);

  return (
    <div>
      <h2>🧾 Registrador de ventas múltiples</h2>
      {productos.map((producto) => (
        <div key={producto.id} style={{ marginBottom: "10px" }}>
          <strong>{producto.nombre}</strong> - Stock:{" "}
          {producto.stock.toFixed(3)} {producto.unidad} - $ {producto.precio.toFixed(2)}
          <br />
          Cantidad ({producto.unidad === "grs" ? "grs" : "kg"}):{" "}
          <input
            type="number"
            min="0"
            value={cantidades[producto.id] || ""}
            onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={registrarVentaClick}
        disabled={!hayVentas}
        style={{
          cursor: hayVentas ? "pointer" : "not-allowed",
          opacity: hayVentas ? 1 : 0.6,
          marginRight: "10px",
          padding: "8px 12px",
        }}
      >
        💰 Registrar Venta
      </button>
      <button onClick={reiniciar} style={{ padding: "8px 12px" }}>
        🧹 Reiniciar
      </button>
      <h3>🧾 Venta total: $ {ventaTotal.toFixed(2)}</h3>
    </div>
  );
};

export default VentaFormMultiple;
