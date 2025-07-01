import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const Dashboard = () => {
  const [productos, setProductos] = useState([]);

  const productosCol = collection(db, "productos");
  const ventasCol = collection(db, "ventas");

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

  const handleSumar = async (id, stockActual) => {
    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, { stock: stockActual + 1 });
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, stock: prod.stock + 1 } : prod
      )
    );
  };

  const handleRestar = async (id, stockActual, nombre, precio, unidad) => {
    if (stockActual <= 0) return;

    const productoRef = doc(db, "productos", id);
    await updateDoc(productoRef, { stock: stockActual - 1 });
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, stock: prod.stock - 1 } : prod
      )
    );

    const venta = {
      productoId: id,
      nombre,
      precioUnitario: precio,
      cantidad: 1,
      unidad,
      fecha: serverTimestamp(),
    };
    await addDoc(ventasCol, venta);
  };

  // 👉 **Función para probar agregar venta manualmente**
  const testAddVenta = async () => {
    try {
      const docRef = await addDoc(ventasCol, {
        productoId: "ISbrrrfmmu6FMAsaBDjT",
        nombre: "papa",
        precioUnitario: 2500,
        cantidad: 1,
        unidad: "kg",
        fecha: serverTimestamp(),
      });
      console.log("Venta creada con ID:", docRef.id);
      alert("Venta de prueba agregada correctamente!");
    } catch (error) {
      console.error("Error agregando venta:", error);
      alert("Error al agregar venta de prueba");
    }
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Dashboard Verdulería
      </Typography>

      {/* ✅ **Aquí está el botón que debes ver en tu app** */}
      <Button variant="outlined" onClick={testAddVenta} sx={{ mb: 2 }}>
        Probar agregar venta manualmente
      </Button>

      <Grid container spacing={2}>
        {productos.map(({ id, nombre, precio, stock, unidad }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Card sx={{ minHeight: 150 }}>
              <CardContent>
                <Typography variant="h6">{nombre}</Typography>
                <Typography color="text.secondary">Precio: ${precio}</Typography>
                <Typography color="text.secondary">
                  Stock: {stock} {unidad}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleSumar(id, stock)}
                >
                  ➕
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRestar(id, stock, nombre, precio, unidad)}
                >
                  ➖
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
