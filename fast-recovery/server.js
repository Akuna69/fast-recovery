const express = require('express');
const { exec } = require('child_process');
const mongoose = require('mongoose');

const app = express();

const dbUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

app.use(express.json());

// 1. Conexión a la base de datos
if (dbUrl) {
  mongoose.connect(dbUrl)
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error de conexión a la BD:', err));
}

// 2. Modelo de usuario (Define qué campos se van a guardar)
const UserSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  fecha: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 3. Rutas principales
app.get('/', (req, res) => {
  res.send('Servidor de Fast Recovery activo');
});

app.get('/run-recovery', (req, res) => {
  exec('./fast-recovery', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout || stderr });
  });
});

// 4. Rutas para registro y consulta de usuarios
app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
