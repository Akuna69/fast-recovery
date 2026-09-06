
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Ruta principal para verificar el servidor
app.get('/', (req, res) => {
  res.send('Servidor de Fast-Recovery activo');
});

// Ruta para ejecutar la herramienta fast-recovery
app.get('/run-recovery', (req, res) => {
  exec('./fast-recovery', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout || stderr });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
