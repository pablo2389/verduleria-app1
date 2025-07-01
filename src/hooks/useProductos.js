import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productosCol = collection(db, "productos");
    const unsubscribe = onSnapshot(productosCol, (snapshot) => {
      const productosList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        stock: Number(doc.data().stock) || 0,
      }));
      setProductos(productosList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const agregarProducto = async (producto) => {
    await addDoc(collection(db, "productos"), producto);
  };

  const borrarProducto = async (id) => {
    await deleteDoc(doc(db, "productos", id));
  };

  const editarProducto = async (id, nuevo) => {
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, nuevo);
  };

  // Actualiza solo localmente el stock (para UX instantáneo)
  const modificarStockLocal = (id, delta) => {
    setProductos((prevProductos) =>
      prevProductos.map((prod) =>
        prod.id === id
          ? { ...prod, stock: Math.max(prod.stock + delta, 0) }
          : prod
      )
    );
  };

  // Actualiza local y en Firestore, con revert si falla
  const modificarStock = async (id, delta) => {
    console.log(`Intentando modificar stock de ${id} en ${delta}`);

    modificarStockLocal(id, delta);

    const productoRef = doc(db, "productos", id);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
      console.warn("Producto no existe en Firestore", id);
      modificarStockLocal(id, -delta); // revertir local
      return;
    }

    const productoData = productoSnap.data();
    const stockActual = Number(productoData.stock) || 0;
    const nuevoStock = stockActual + delta;

    if (nuevoStock < 0) {
      console.warn("No se puede dejar stock negativo");
      modificarStockLocal(id, -delta); // revertir local
      return;
    }

    try {
      await updateDoc(productoRef, { stock: nuevoStock });
      console.log("Stock actualizado en Firestore");
    } catch (error) {
      modificarStockLocal(id, -delta); // revertir local si falla Firestore
      console.error("Error actualizando stock:", error);
    }
  };

  return {
    productos,
    loading,
    agregarProducto,
    borrarProducto,
    editarProducto,
    modificarStock,
  };
};

export default useProductos;
