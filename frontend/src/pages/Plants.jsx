import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DEFAULT_PLANTS = [
  { name: 'Tomato', minMoisture: 40, maxMoisture: 70, description: 'Needs consistent moisture' },
  { name: 'Cactus', minMoisture: 10, maxMoisture: 30, description: 'Drought tolerant' },
  { name: 'Lettuce', minMoisture: 50, maxMoisture: 80, description: 'Prefers moist soil' },
  { name: 'Rose', minMoisture: 35, maxMoisture: 65, description: 'Moderate watering' }
];

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({ name: '', minMoisture: 30, maxMoisture: 70, description: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPlants = async () => {
    try {
      const { data } = await axios.get('/api/plants');
      setPlants(data);
    } catch {
      toast.error('Failed to load plants');
    }
  };

  useEffect(() => { fetchPlants(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/plants', form);
      toast.success('Plant profile added');
      setForm({ name: '', minMoisture: 30, maxMoisture: 70, description: '' });
      setShowForm(false);
      fetchPlants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add plant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plant profile?')) return;
    try {
      await axios.delete(`/api/plants/${id}`);
      toast.success('Deleted');
      fetchPlants();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const allPlants = [...DEFAULT_PLANTS.map((p) => ({ ...p, _default: true })), ...plants];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plant Profiles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Moisture thresholds per plant type</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ Add Plant'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold">New Plant Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Plant Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="e.g. Basil"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Moisture (%)</label>
              <input
                type="number" min="0" max="100" required
                value={form.minMoisture}
                onChange={(e) => setForm({ ...form, minMoisture: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Moisture (%)</label>
              <input
                type="number" min="0" max="100" required
                value={form.maxMoisture}
                onChange={(e) => setForm({ ...form, maxMoisture: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg transition"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPlants.map((plant, i) => (
          <div key={plant._id || i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{plant.name}</h3>
                {plant._default && (
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">Default</span>
                )}
              </div>
              {!plant._default && (
                <button
                  onClick={() => handleDelete(plant._id)}
                  className="text-red-400 hover:text-red-300 text-xs transition"
                >
                  Delete
                </button>
              )}
            </div>

            {plant.description && (
              <p className="text-gray-400 text-sm mb-3">{plant.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Moisture Range</span>
                <span className="text-white">{plant.minMoisture}% – {plant.maxMoisture}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  style={{ marginLeft: `${plant.minMoisture}%`, width: `${plant.maxMoisture - plant.minMoisture}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
