import React, { useState, useEffect } from "react";
import { db } from "../services/firebase"; // Ajusta el path si tu archivo firebase.js está en otro lugar
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const Productos = () => {
  const [productos, setProductos] = useState([]);

  // Estado para el formulario de agregar producto
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
    unidad: "",
    ventaMinima: "",
  });

  const productosCol = collection(db, "productos");

  // Obtener productos al cargar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(productosCol);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(lista);
    };

    fetchProductos();
  }, []);

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sumar stock
  const handleSumar = async (id, stockActual) => {
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, { stock: stockActual + 1 });
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, stock: prod.stock + 1 } : prod
      )
    );
  };

  // Restar stock
  const handleRestar = async (id, stockActual) => {
    if (stockActual <= 0) return;
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, { stock: stockActual - 1 });
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, stock: prod.stock - 1 } : prod
      )
    );
  };

  // Eliminar producto
  const handleEliminar = async (id) => {
    await deleteDoc(doc(db, "productos", id));
    setProductos((prev) => prev.filter((prod) => prod.id !== id));
  };

  // Agregar producto
  const handleAgregar = async (e) => {
    e.preventDefault();

    if (
      !form.nombre ||
      !form.precio ||
      !form.stock ||
      !form.unidad ||
      !form.ventaMinima
    ) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const nuevoProducto = {
      nombre: form.nombre,
      precio: Number(form.precio),
      stock: Number(form.stock),
      unidad: form.unidad,
      ventaMinima: Number(form.ventaMinima),
    };

    const docRef = await addDoc(productosCol, nuevoProducto);
    setProductos((prev) => [...prev, { id: docRef.id, ...nuevoProducto }]);

    // Resetear formulario
    setForm({
      nombre: "",
      precio: "",
      stock: "",
      unidad: "",
      ventaMinima: "",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Verdulería - Productos</h1>

      {/* Formulario de agregar producto */}
      <form onSubmit={handleAgregar} style={{ marginBottom: 20 }}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          required
          min="0"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />
        <input
          type="text"
          name="unidad"
          placeholder="Unidad (ej: kg, gr, pack, docena)"
          value={form.unidad}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="ventaMinima"
          placeholder="Venta mínima"
          value={form.ventaMinima}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />
        <button type="submit">Agregar producto</button>
      </form>

      {/* Lista de productos */}
      {productos.map(({ id, nombre, precio, stock, unidad, ventaMinima }) => (
        <div key={id} style={{ marginBottom: 12 }}>
          <p>
            <strong>{nombre}</strong> - $ {precio} - Stock: {stock} {unidad} - Venta mínima: {ventaMinima} {unidad}
          </p>
          <button onClick={() => handleSumar(id, stock)}>➕</button>
          <button onClick={() => handleRestar(id, stock)}>➖</button>
          <button onClick={() => handleEliminar(id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
};

export default Productos;
