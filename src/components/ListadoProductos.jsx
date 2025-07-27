import React from "react";

const ListadoProductos = ({ productos, onActualizar, onAjustarStock, onEliminarProducto }) => {
  const validarNumero = (valor, decimales) => {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimales}})?$`);
    return regex.test(valor);
  };

  const handleChange = (id, campo, e) => {
    const val = e.target.value;
    if (campo === "precio" && !validarNumero(val, 2)) return;
    if (campo === "stock" && !validarNumero(val, 3)) return;
    onActualizar(id, campo, val);
  };

  return (
    <div>
      <h2>Productos</h2>
      {productos.length === 0 ? (
        <p>No hay productos.</p>
      ) : (
        productos.map(({ id, nombre, precio, stock, unidad }) => (
          <div
            key={id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            <div style={{ flex: 2, fontWeight: "bold" }}>{nombre}</div>
            <input
              type="text"
              value={precio}
              onChange={(e) => handleChange(id, "precio", e)}
              style={{ width: 100 }}
              title="Precio por kilo"
            />
            <input
              type="text"
              value={stock}
              onChange={(e) => handleChange(id, "stock", e)}
              style={{ width: 100 }}
              title="Stock en kilos"
            />
            <div>{unidad}</div>

            <button onClick={() => onAjustarStock(id, +1)}>➕</button>
            <button onClick={() => onAjustarStock(id, -1)} disabled={stock <= 0}>
              ➖
            </button>

            <button
              onClick={() => onEliminarProducto(id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: 4,
                cursor: "pointer",
                marginLeft: 10,
              }}
              title="Quitar producto"
            >
              Quitar
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ListadoProductos;
