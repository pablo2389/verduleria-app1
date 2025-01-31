const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    console.log("Enviando producto:", productName, price); // Verifica los datos
    const docRef = await addDoc(collection(db, "productos"), {
      name: productName,
      price: price,
    });

    console.log("Documento escrito con ID: ", docRef.id);
    setProductName('');
    setPrice('');
  } catch (e) {
    console.error("Error al agregar documento: ", e);
  }
};
