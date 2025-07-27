import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";

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
    try {
      await addDoc(collection(db, "productos"), producto);
    } catch (error) {
      console.error("Error agregando producto:", error);
      throw error;
    }
  };

  const borrarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
    } catch (error) {
      console.error("Error borrando producto:", error);
      throw error;
    }
  };

  const editarProducto = async (id, nuevo) => {
    try {
      const productoRef = doc(db, "productos", id);
      await updateDoc(productoRef, nuevo);
    } catch (error) {
      console.error("Error editando producto:", error);
      throw error;
    }
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

  // Actualiza local y en Firestore usando transacción, para evitar condiciones de carrera
  const modificarStock = async (id, delta) => {
    try {
      await runTransaction(db, async (transaction) => {
        const productoRef = doc(db, "productos", id);
        const productoSnap = await transaction.get(productoRef);

        if (!productoSnap.exists()) {
          throw new Error("Producto no existe");
        }

        const stockActual = Number(productoSnap.data().stock) || 0;
        const nuevoStock = stockActual + delta;

        if (nuevoStock < 0) {
          throw new Error("Stock insuficiente");
        }

        transaction.update(productoRef, { stock: nuevoStock });
      });
      // Solo actualizamos localmente si la transacción fue exitosa
      modificarStockLocal(id, delta);
    } catch (error) {
      console.error("Error modificando stock:", error);
      // Podés manejar alertas o feedback de error aquí si querés
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
