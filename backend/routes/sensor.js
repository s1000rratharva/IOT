const router = require('express').Router();
const SensorData = require('../models/SensorData');

// Shared pump state (in-memory; replace with DB flag for multi-instance)
let pumpState = { status: false, manual: false };

// Broadcast helper — attached by server.js
router.broadcast = null;

// GET /sensor-data — latest reading
router.get('/sensor-data', async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json({ data: latest, pump: pumpState });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /sensor-data — ESP32 pushes data here
router.post('/sensor-data', async (req, res) => {
  try {
    const { moisture, temperature, plantType } = req.body;

    // Auto pump logic (only when not in manual mode)
    if (!pumpState.manual) {
      pumpState.status = moisture < 30; // default threshold
    }

    const entry = await SensorData.create({
      moisture,
      temperature,
      plantType: plantType || 'General',
      pumpStatus: pumpState.status
    });

    // Broadcast to WebSocket clients
    if (router.broadcast) {
      router.broadcast(JSON.stringify({ type: 'sensor', data: entry, pump: pumpState }));
    }

    // Alert if critically dry
    if (moisture < 20 && router.broadcast) {
      router.broadcast(JSON.stringify({ type: 'alert', message: 'Soil is critically dry!', moisture }));
    }

    res.status(201).json({ entry, pump: pumpState });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /pump-control — manual override
router.post('/pump-control', async (req, res) => {
  try {
    const { status, manual } = req.body;
    pumpState.status = Boolean(status);
    pumpState.manual = manual !== undefined ? Boolean(manual) : true;

    if (router.broadcast) {
      router.broadcast(JSON.stringify({ type: 'pump', pump: pumpState }));
    }

    res.json({ pump: pumpState });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /history — paginated history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const data = await SensorData.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await SensorData.countDocuments();
    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
