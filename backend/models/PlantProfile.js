const mongoose = require('mongoose');

const plantProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  minMoisture: { type: Number, required: true },
  maxMoisture: { type: Number, required: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlantProfile', plantProfileSchema);
