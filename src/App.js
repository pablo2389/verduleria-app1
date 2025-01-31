import { Button, Card, CardContent, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase-config'; // Firebase config

const App = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(0); // Cantidad en kg para la balanza
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });
  const [usuario, setUsuario] = useState(null);
  const [carrito, setCarrito] = useState([]); // Carrito para los productos
  const [totalCompra, setTotalCompra] = useState(0); // Total acumulado de la compra
  const [cantidadStock, setCantidadStock] = useState(''); // Para ingresar la cantidad de stock a agregar
  const [compraFinalizada, setCompraFinalizada] = useState(false); // Estado para saber si la compra se ha finalizado

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        obtenerProductos(user.uid);
      } else {
        signInAnonymously(auth).then((userCredential) => {
          setUsuario(userCredential.user);
          obtenerProductos(userCredential.user.uid);
        });
      }
    });
  }, []);

  const obtenerProductos = async (uid) => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, `usuarios/${uid}/productos`));
    const productosArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProductos(productosArray);
    setLoading(false);
  };

  const agregarNuevoProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      alert('Por favor, ingrese todos los datos');
      return;
    }

    // Asegúrate de que el stock sea un número decimal
    const stockDecimal = parseFloat(nuevoProducto.stock);

    if (isNaN(stockDecimal)) {
      alert('El stock debe ser un número válido');
      return;
    }

    await addDoc(collection(db, `usuarios/${usuario.uid}/productos`), {
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
      stock: stockDecimal, // Guardamos el stock como un número decimal
    });

    setNuevoProducto({ nombre: '', precio: '', stock: '' });
    obtenerProductos(usuario.uid);
  };

  const actualizarStock = async (productoId, cantidadVendida) => {
    const productoRef = doc(db, `usuarios/${usuario.uid}/productos`, productoId);
    const producto = productos.find((p) => p.id === productoId);

    const nuevoStock = producto.stock - cantidadVendida;

    if (nuevoStock < 0) {
      alert('No hay suficiente stock para esta venta.');
      return;
    }

    await updateDoc(productoRef, { stock: nuevoStock });
    obtenerProductos(usuario.uid); // Actualizamos el stock en la interfaz
  };

  const agregarAlCarrito = (producto, cantidad) => {
    if (cantidad <= 0 || cantidad > producto.stock) {
      alert('La cantidad debe ser válida y no mayor al stock disponible');
      return;
    }

    const productoConCantidad = {
      ...producto,
      cantidad,
      precioTotal: producto.precio * cantidad, // Calculamos el precio total de este producto
    };

    setCarrito((prevCarrito) => {
      const carritoActualizado = [...prevCarrito, productoConCantidad];
      actualizarTotalCompra(carritoActualizado); // Actualizamos el total de la compra
      return carritoActualizado;
    });

    // Actualizar stock en la base de datos
    actualizarStock(producto.id, cantidad);
  };

  const eliminarDelCarrito = (id) => {
    const productoEliminado = carrito.find((producto) => producto.id === id);
    setCarrito(carrito.filter((producto) => producto.id !== id));
    setTotalCompra(totalCompra - productoEliminado.precioTotal); // Restamos el precio del producto eliminado

    // Recuperar el stock eliminado
    const productoRef = doc(db, `usuarios/${usuario.uid}/productos`, id);
    const producto = productos.find((p) => p.id === id);
    updateDoc(productoRef, { stock: producto.stock + productoEliminado.cantidad });
  };

  const actualizarTotalCompra = (nuevoCarrito) => {
    // Sumamos el precio total de todos los productos en el carrito
    const nuevoTotal = nuevoCarrito.reduce((acc, producto) => acc + producto.precioTotal, 0);
    setTotalCompra(nuevoTotal); // Actualizamos el total de la compra
  };

  const manejarBalanza = () => {
    if (productoSeleccionado && cantidad > 0) {
      agregarAlCarrito(productoSeleccionado, cantidad);
    } else {
      alert('Por favor, seleccione un producto y una cantidad');
    }
  };

  const handleInputChange = (e, campo) => {
    const { value } = e.target;
    if (campo === 'precio' || campo === 'stock') {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setNuevoProducto({ ...nuevoProducto, [campo]: parsedValue });
      } else {
        setNuevoProducto({ ...nuevoProducto, [campo]: '' });
      }
    } else {
      setNuevoProducto({ ...nuevoProducto, [campo]: value });
    }
  };

  const agregarMasStock = async (productoId) => {
    const cantidadExtra = parseFloat(cantidadStock);
    if (isNaN(cantidadExtra) || cantidadExtra <= 0) {
      alert('Ingrese una cantidad válida para agregar stock');
      return;
    }

    const productoRef = doc(db, `usuarios/${usuario.uid}/productos`, productoId);
    const producto = productos.find((p) => p.id === productoId);
    const nuevoStock = producto.stock + cantidadExtra;

    await updateDoc(productoRef, { stock: nuevoStock });
    obtenerProductos(usuario.uid); // Actualizamos el stock en la interfaz
    setCantidadStock('');
  };

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setCompraFinalizada(true);
    setTotalCompra(totalCompra); // Aseguramos que el total final se mantenga intacto
    setCarrito([]); // Vaciar el carrito después de finalizar la compra
  };

  // Función para reiniciar la compra y empezar una nueva transacción
  const reiniciarTransaccion = () => {
    setCarrito([]);
    setTotalCompra(0);
    setCompraFinalizada(false);
    setCantidad(0);
    setProductoSeleccionado(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" align="center">Tienda de Verduras</Typography>

      {loading ? (
        <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
      ) : (
        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{producto.nombre}</Typography>
                  <Typography>Precio: ${producto.precio} / kg</Typography>
                  <Typography>Stock: {producto.stock} kg</Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setProductoSeleccionado(producto)}
                  >
                    Seleccionar
                  </Button>
                  <TextField
                    type="number"
                    label="Agregar Stock"
                    value={cantidadStock || ''}
                    onChange={(e) => setCantidadStock(e.target.value)}
                    fullWidth
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => agregarMasStock(producto.id)} // Agregar stock personalizado
                  >
                    Agregar Stock
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6" align="center">Simulación de Balanza</Typography>
        <TextField
          type="number"
          label="Cantidad (kg)"
          value={cantidad || ''}
          onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)} // Aseguramos que la cantidad sea un número
          fullWidth
        />
        <Button fullWidth variant="contained" onClick={manejarBalanza}>
          Agregar al Carrito
        </Button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6" align="center">Productos en el Carrito</Typography>
        {carrito.length === 0 ? (
          <Typography align="center">No hay productos en el carrito</Typography>
        ) : (
          carrito.map((producto) => (
            <div key={producto.id}>
              <Typography>
                {producto.nombre} - {producto.cantidad} kg - ${producto.precioTotal}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => eliminarDelCarrito(producto.id)}
              >
                Eliminar
              </Button>
            </div>
          ))
        )}
        <Typography variant="h6" align="center">Total: ${totalCompra}</Typography>
      </div>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={finalizarCompra}
        style={{ marginTop: '20px' }}
      >
        Finalizar Compra
      </Button>

      {compraFinalizada && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h4" align="center">¡Gracias por su compra!</Typography>
          <Typography align="center">Productos adquiridos:</Typography>
          {carrito.map((producto) => (
            <Typography key={producto.id}>
              {producto.nombre} - {producto.cantidad} kg - ${producto.precioTotal}
            </Typography>
          ))}
          <Typography variant="h5" align="center">Total: ${totalCompra}</Typography>
        </div>
      )}

      <Button
        fullWidth
        variant="outlined"
        color="secondary"
        onClick={reiniciarTransaccion}
        style={{ marginTop: '20px' }}
      >
        Resetear Compra
      </Button>
    </div>
  );
};

export default App;
