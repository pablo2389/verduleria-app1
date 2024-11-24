import React, { useState } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField, Grid, Container } from '@mui/material';

const AddProductForm = () => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
      });
      alert('Producto agregado');
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              fullWidth
              required
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Existencias"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              fullWidth
              required
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Agregar Producto
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddProductForm;
