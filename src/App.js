import React, { useState, useEffect } from 'react';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase-config';
import { Card, CardContent, Typography, Grid, Container, Button, CircularProgress, Box } from '@mui/material';
import AddProductForm from './components/AddProductForm';
// No necesitas importar el logo si está en la carpeta `public`

const App = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga de los productos
  const [deletingId, setDeletingId] = useState(null); // Estado para identificar cuál producto está siendo eliminado
  const [error, setError] = useState(false); // Estado para manejar los errores de carga

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
        setError(false); // Resetea el error si la carga fue exitosa
        break;
      } catch (error) {
        console.error("Error al obtener los productos: ", error);
        setError(true); // Marca el error
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
    setDeletingId(id); // Indica que este producto se está eliminando
    try {
      await deleteDoc(doc(db, 'productos', id)); // Elimina el producto de Firestore
      setProductos((prevProductos) => prevProductos.filter((producto) => producto.id !== id)); // Se asegura de que el estado se actualice correctamente
      alert('Producto eliminado');
    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
    } finally {
      setDeletingId(null); // Reestablecer el estado de eliminación cuando termine
    }
  };

  useEffect(() => {
    fetchProductos(); // Llama a la función fetchProductos cuando el componente se monta
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h4">Cargando... Por favor espere</Typography>
      </Box>
    ); // Muestra el cartel de espera mientras se cargan los productos
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
        <Typography variant="h4" color="error" gutterBottom>
          ¡Oops! Hubo un problema al cargar los productos.
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Por favor, intente nuevamente más tarde.
        </Typography>
      </Box>
    ); // Muestra un mensaje de error amigable si no se pudieron cargar los productos
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="center" my={4}>
        <img src={`${process.env.PUBLIC_URL}/logo-verduleria.png`} alt="Logo de la Verdulería" style={{ height: '100px' }} /> {/* Logo de la verdulería */}
      </Box>
      <Typography variant="h3" gutterBottom textAlign="center">
        TU VERDULERIA 
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
                    disabled={deletingId === producto.id} // Desactiva el botón solo para el producto que se está eliminando
                  >
                    {deletingId === producto.id ? <CircularProgress size={24} color="inherit" /> : 'Eliminar'}
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
