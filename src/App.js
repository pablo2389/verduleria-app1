import React, { useState, useEffect } from 'react';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase-config';
import { Card, CardContent, Typography, Grid, Container, Button, CircularProgress, Box } from '@mui/material';
import AddProductForm from './components/AddProductForm';

const App = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga de los productos
  const [deleting, setDeleting] = useState(false); // Estado de carga para eliminación

  const fetchProductos = async () => {
    setLoading(true);
    let retryAttempts = 3;
    while (retryAttempts > 0) {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'));
        const productosArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosArray);
        break;
      } catch (error) {
        console.error("Error al obtener los productos: ", error);
        retryAttempts--;
        if (retryAttempts === 0) {
          alert("Error al cargar los productos. Intenta de nuevo más tarde.");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos antes de reintentar
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'productos', id)); // Elimina el producto de Firestore
      // Actualiza el estado para reflejar la eliminación del producto en la UI
      setProductos((prevProductos) => prevProductos.filter((producto) => producto.id !== id));
      alert('Producto eliminado');
    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProductos(); // Llama a la función fetchProductos cuando el componente se monta
  }, []);

  if (loading) {
    return <CircularProgress />; // Muestra el indicador de carga mientras se obtienen los productos
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" gutterBottom textAlign="center">
        Productos
      </Typography>

      {/* Formulario de agregar producto */}
      <Box my={4}>
        <AddProductForm />
      </Box>

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
                  Existencias: {producto.stock}
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                    // Puedes añadir la lógica de agregar producto aquí si lo deseas
                  >
                    Agregar
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(producto.id)}
                    disabled={deleting} // Desactiva el botón mientras se elimina un producto
                  >
                    {deleting ? <CircularProgress size={24} color="inherit" /> : 'Eliminar'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
