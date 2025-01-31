

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { db } from './firebase'; // Asegúrate de que tienes la configuración de Firebase importada
import { collection, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore'; // Asegúrate de importar getDocs

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch productos desde la base de datos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosCollection = collection(db, 'productos');
        const querySnapshot = await getDocs(productosCollection);
        const productosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosList);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Función para agregar o restar stock
  const handleUpdateStock = async (id, newStock) => {
    const productoRef = doc(db, 'productos', id);
    try {
      // Encuentra el producto correspondiente
      const productoToUpdate = productos.find(producto => producto.id === id);

      // Verifica si el producto existe y si la propiedad stock está definida como un número
      if (productoToUpdate && typeof productoToUpdate.stock === 'number') {
        // Solo actualiza si stock es un número
        await updateDoc(productoRef, { stock: newStock });
        setProductos(prev => prev.map(p =>
          p.id === id ? { ...p, stock: newStock } : p
        ));
      } else {
        console.error("El producto no tiene propiedad 'stock' definida correctamente.");
        alert("Este producto no tiene la propiedad 'stock' correctamente definida.");
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      alert('Error al actualizar stock.');
    }
  };

  // Función para eliminar un producto
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const productoToDelete = productos.find((producto) => producto.id === id);
      if (productoToDelete) {
        await deleteDoc(doc(db, 'productos', id));
        setProductos((prevProductos) => prevProductos.filter((producto) => producto.id !== id));
        alert('Producto eliminado');
      }
    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
      alert('Error al eliminar producto');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={4} justifyContent="center">
      {productos.map((producto) => (
        <Grid item key={producto.id} xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                {producto.nombre}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Precio: ${producto.precio}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Existencias en kg: {producto.stock !== undefined ? producto.stock : 'No definido'}
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStock(producto.id, (producto.stock || 0) + 1)}
                >
                  Aumentar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    // Validamos que el stock sea mayor que 0 antes de disminuir
                    if ((producto.stock || 0) > 0) {
                      handleUpdateStock(producto.id, (producto.stock || 0) - 1);
                    } else {
                      alert('El stock no puede ser menor a 0');
                    }
                  }}
                >
                  Disminuir
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDelete(producto.id)}
                  disabled={deletingId === producto.id}
                >
                  {deletingId === producto.id ? <CircularProgress size={24} color="inherit" /> : 'Eliminar'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Productos;
