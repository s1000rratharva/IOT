const router = require('express').Router();
const PlantProfile = require('../models/PlantProfile');
const auth = require('../middleware/auth');

// GET /plants
router.get('/', async (req, res) => {
  try {
    const plants = await PlantProfile.find().sort({ name: 1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /plants — protected
router.post('/', auth, async (req, res) => {
  try {
    const { name, minMoisture, maxMoisture, description } = req.body;
    const plant = await PlantProfile.create({
      name, minMoisture, maxMoisture, description,
      createdBy: req.user.id
    });
    res.status(201).json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /plants/:id — protected
router.put('/:id', auth, async (req, res) => {
  try {
    const plant = await PlantProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /plants/:id — protected
router.delete('/:id', auth, async (req, res) => {
  try {
    await PlantProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
