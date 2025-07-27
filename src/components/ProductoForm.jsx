import React, { useState } from "react";

const ProductoForm = ({ onAgregar }) => {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
    unidad: "kg",
  });

  const validarNumero = (valor, decimales) => {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimales}})?$`);
    return regex.test(valor);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "precio" && !validarNumero(value, 2)) return;
    if (name === "stock" && !validarNumero(value, 3)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { nombre, precio, stock, unidad } = form;

    if (!nombre.trim()) return alert("El nombre es obligatorio");
    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0)
      return alert("Precio inválido");
    if (isNaN(parseFloat(stock)) || parseFloat(stock) < 0)
      return alert("Stock inválido");

    onAgregar({
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      stock: parseFloat(stock),
      unidad: unidad || "kg",
    });

    setForm({ nombre: "", precio: "", stock: "", unidad: "kg" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}
    >
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        required
        style={{ flex: "1 1 150px" }}
      />
      <input
        type="text"
        name="precio"
        placeholder="Precio por unidad"
        value={form.precio}
        onChange={handleChange}
        required
        style={{ width: 120 }}
      />
      <input
        type="text"
        name="stock"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
        required
        style={{ width: 120 }}
      />
      <select
        name="unidad"
        value={form.unidad}
        onChange={handleChange}
        style={{ width: 120 }}
      >
        <option value="kg">kg</option>
        <option value="grs">grs</option>
        <option value="unidad">unidad</option>
      </select>
      <button type="submit" style={{ padding: "0 20px" }}>
        Agregar
      </button>
    </form>
  );
};

export default ProductoForm;
