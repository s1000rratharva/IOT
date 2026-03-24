const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  moisture: { type: Number, required: true },       // 0-100 %
  temperature: { type: Number, default: null },
  plantType: { type: String, default: 'General' },
  pumpStatus: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
