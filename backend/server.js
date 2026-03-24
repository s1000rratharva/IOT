require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { WebSocketServer } = require('ws');

const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensor');
const plantRoutes = require('./routes/plants');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Attach broadcast to sensor router
sensorRoutes.broadcast = (message) => {
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', sensorRoutes);
app.use('/api/plants', plantRoutes);

app.get('/', (req, res) => res.json({ status: 'Smart Irrigation API running' }));

// Connect DB and start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
