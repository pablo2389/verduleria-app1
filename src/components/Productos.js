import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const productosCol = collection(db, "productos");

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [unidad, setUnidad] = useState("kg");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const data = await getDocs(productosCol);
    setProductos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const agregarProducto = async () => {
    if (!nombre.trim() || !precio || !stock) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (parseFloat(precio) <= 0) {
      alert("El precio debe ser mayor a cero");
      return;
    }

    if (parseFloat(stock) < 0) {
      alert("El stock no puede ser negativo");
      return;
    }

    // Opcional: validar nombre duplicado
    if (productos.some(p => p.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      alert("Ya existe un producto con ese nombre");
      return;
    }

    try {
      await addDoc(productosCol, {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        stock: parseFloat(stock),
        unidad,
      });
      setNombre("");
      setPrecio("");
      setStock("");
      setUnidad("kg");
      obtenerProductos();
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error al agregar producto");
    }
  };

  const handleDeleteProducto = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este producto?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "productos", id));
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto", fontFamily: "Arial" }}>
      <h1>🛒 Verdulería - Caja Registradora</h1>

      <h2>Agregar producto</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ marginRight: 10, padding: 6 }}
      />
      <input
        type="number"
        placeholder="Precio por unidad"
        value={precio}
        min="0.01"
        step="0.01"
        onChange={(e) => setPrecio(e.target.value)}
        style={{ marginRight: 10, padding: 6 }}
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        min="0"
        step="0.001"
        onChange={(e) => setStock(e.target.value)}
        style={{ marginRight: 10, padding: 6 }}
      />
      <select
        value={unidad}
        onChange={(e) => setUnidad(e.target.value)}
        style={{ marginRight: 10, padding: 6 }}
      >
        <option value="kg">kg</option>
        <option value="grs">grs</option>
        <option value="unidad">unidad</option>
      </select>
      <button onClick={agregarProducto} style={{ padding: "6px 12px" }}>
        Agregar
      </button>

      <h2 style={{ marginTop: 40 }}>Productos</h2>
      {productos.length === 0 && <p>No hay productos agregados.</p>}

      {productos.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid #ccc",
          }}
        >
          <div>
            <strong>{p.nombre}</strong> - Stock: {p.stock.toFixed(3)} {p.unidad} - Precio: ${p.precio.toFixed(2)}
          </div>

          <button
            onClick={() => handleDeleteProducto(p.id)}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Quitar producto
          </button>
        </div>
      ))}
    </div>
  );
};

export default Productos;
