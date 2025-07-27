import React, { useState, useEffect } from "react";

const VentaForm = ({ productos, onRegistrarVenta }) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [kilosVenta, setKilosVenta] = useState("");
  const [totalVenta, setTotalVenta] = useState(0);

  useEffect(() => {
    if (productos.length > 0 && !productoSeleccionado) {
      setProductoSeleccionado(productos[0].id);
    }
  }, [productos, productoSeleccionado]);

  useEffect(() => {
    if (!productoSeleccionado || kilosVenta === "") {
      setTotalVenta(0);
      return;
    }
    const prod = productos.find((p) => p.id === productoSeleccionado);
    if (prod) {
      const kilos = parseFloat(kilosVenta);
      if (!isNaN(kilos)) setTotalVenta(kilos * prod.precio);
      else setTotalVenta(0);
    }
  }, [kilosVenta, productoSeleccionado, productos]);

  const validarNumero = (valor, decimales) => {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimales}})?$`);
    return regex.test(valor);
  };

  const handleKilosChange = (e) => {
    const val = e.target.value;
    if (validarNumero(val, 3)) setKilosVenta(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const kilos = parseFloat(kilosVenta);
    const prod = productos.find((p) => p.id === productoSeleccionado);

    if (!prod) {
      alert("Seleccione un producto válido.");
      return;
    }
    if (isNaN(kilos) || kilos <= 0) {
      alert("Ingrese kilos válidos mayor a 0.");
      return;
    }
    if (kilos > prod.stock) {
      alert("No hay suficiente stock disponible.");
      return;
    }

    onRegistrarVenta(productoSeleccionado, kilos);
    setKilosVenta("");
    setTotalVenta(0);
  };

  const isSubmitDisabled =
    !productoSeleccionado || !kilosVenta || parseFloat(kilosVenta) <= 0;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 40 }}>
      <h2>Registrar venta</h2>
      <select
        value={productoSeleccionado || ""}
        onChange={(e) => setProductoSeleccionado(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      >
        {productos.map(({ id, nombre, stock, precio }) => (
          <option key={id} value={id}>
            {nombre} - Stock: {stock.toFixed(3)} kg - Precio: ${precio.toFixed(2)}
          </option>
        ))}
      </select>

      <input
        type="text"
        inputMode="decimal"
        placeholder="Kilos vendidos"
        value={kilosVenta}
        onChange={handleKilosChange}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      <p>
        Total: <strong>${totalVenta.toFixed(2)}</strong>
      </p>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        style={{
          width: "100%",
          padding: 12,
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          cursor: isSubmitDisabled ? "not-allowed" : "pointer",
          opacity: isSubmitDisabled ? 0.6 : 1,
          pointerEvents: isSubmitDisabled ? "none" : "auto",
        }}
      >
        Registrar Venta
      </button>
    </form>
  );
};

export default VentaForm;
