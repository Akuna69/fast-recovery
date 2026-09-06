const express = require('express');
const { exec } = require('child_process');
const mongoose = require('mongoose');

const app = express();
const dbUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

app.use(express.json());

// Función auxiliar para conectar a la BD
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!dbUrl) throw new Error("DATABASE_URL no está definida");
  await mongoose.connect(dbUrl);
};

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  fecha: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

app.post('/register', async (req, res) => {
  try {
    await connectDB();
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    await connectDB();
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
