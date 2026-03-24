import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import StatCard from '../components/StatCard';
import MoistureGauge from '../components/MoistureGauge';
import AlertBanner from '../components/AlertBanner';
import WeatherCard from '../components/WeatherCard';

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:5000`;

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [pump, setPump] = useState({ status: false, manual: false });
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pumpLoading, setPumpLoading] = useState(false);
  const wsRef = useRef(null);

  const fetchInitial = useCallback(async () => {
    try {
      const [sRes, hRes] = await Promise.all([
        axios.get('/api/sensor-data'),
        axios.get('/api/history?limit=30')
      ]);
      if (sRes.data.data) setSensorData(sRes.data.data);
      if (sRes.data.pump) setPump(sRes.data.pump);
      setHistory(
        hRes.data.data.reverse().map((d) => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          moisture: d.moisture,
          temp: d.temperature
        }))
      );
    } catch {
      toast.error('Failed to fetch sensor data');
    }
  }, []);

  useEffect(() => {
    fetchInitial();

    // WebSocket connection
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'sensor') {
          setSensorData(msg.data);
          setPump(msg.pump);
          setHistory((prev) => {
            const entry = {
              time: new Date(msg.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              moisture: msg.data.moisture,
              temp: msg.data.temperature
            };
            return [...prev.slice(-29), entry];
          });
        }
        if (msg.type === 'pump') setPump(msg.pump);
        if (msg.type === 'alert') {
          setAlerts((prev) => [msg.message, ...prev].slice(0, 3));
          toast.error(msg.message, { icon: '⚠️' });
          setTimeout(() => setAlerts((prev) => prev.slice(0, -1)), 8000);
        }
      };

      ws.onclose = () => setTimeout(connect, 3000);
    };

    connect();
    return () => wsRef.current?.close();
  }, [fetchInitial]);

  const togglePump = async () => {
    setPumpLoading(true);
    try {
      const { data } = await axios.post('/api/pump-control', {
        status: !pump.status,
        manual: true
      });
      setPump(data.pump);
      toast.success(`Pump turned ${data.pump.status ? 'ON' : 'OFF'}`);
    } catch {
      toast.error('Failed to control pump');
    } finally {
      setPumpLoading(false);
    }
  };

  const setAutoMode = async () => {
    try {
      const { data } = await axios.post('/api/pump-control', { status: pump.status, manual: false });
      setPump(data.pump);
      toast.success('Switched to auto mode');
    } catch {
      toast.error('Failed to set auto mode');
    }
  };

  const moisture = sensorData?.moisture ?? null;
  const temp = sensorData?.temperature ?? null;
  const lastSeen = sensorData ? new Date(sensorData.timestamp).toLocaleString() : 'No data yet';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Last update: {lastSeen}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${sensorData ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-400">{sensorData ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💧" label="Moisture" value={moisture} unit="%" color="blue"
          sub={moisture < 20 ? '⚠️ Critically dry' : moisture < 40 ? 'Low' : 'Good'} />
        <StatCard icon="🌡️" label="Temperature" value={temp} unit="°C" color="yellow" />
        <StatCard icon="🌿" label="Plant Type" value={sensorData?.plantType ?? '—'} color="green" />
        <StatCard
          icon={pump.status ? '🟢' : '🔴'}
          label="Pump"
          value={pump.status ? 'ON' : 'OFF'}
          color={pump.status ? 'green' : 'red'}
          sub={pump.manual ? 'Manual mode' : 'Auto mode'}
        />
      </div>

      {/* Weather + Gauge + Pump — full width 3-column row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Weather */}
        <WeatherCard city="Mumbai" />

        {/* Moisture Gauge */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <MoistureGauge value={moisture ?? 0} />
          <div className="mt-3 text-sm text-gray-400 text-center">
            {moisture < 20 ? '🔴 Critically Dry' :
             moisture < 40 ? '🟠 Dry — Irrigation needed' :
             moisture < 70 ? '🟢 Optimal' : '🔵 Well watered'}
          </div>
        </div>

        {/* Pump Control */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Pump Control</h2>
            <p className="text-sm text-gray-400">
              Mode: <span className={pump.manual ? 'text-yellow-400' : 'text-green-400'}>
                {pump.manual ? 'Manual' : 'Automatic'}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={togglePump}
              disabled={pumpLoading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 ${
                pump.status
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {pumpLoading ? 'Updating...' : pump.status ? '⏹ Turn Pump OFF' : '▶ Turn Pump ON'}
            </button>
            {pump.manual && (
              <button
                onClick={setAutoMode}
                className="w-full py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition"
              >
                Switch to Auto Mode
              </button>
            )}
          </div>

          <div className="text-xs text-gray-600">
            Auto mode triggers irrigation when moisture drops below 30%
          </div>
        </div>

      </div>

      {/* History chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Moisture History</h2>
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No history data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={30} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Min', fill: '#f97316', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="moisture"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Moisture %"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
