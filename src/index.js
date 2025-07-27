import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Opcional: puedes eliminar esto si no lo usás
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Puedes comentar o eliminar esta línea si no vas a medir rendimiento
reportWebVitals();
