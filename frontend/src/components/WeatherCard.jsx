import { useWeather } from '../hooks/useWeather';

function WeatherStat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-white text-sm font-medium">{value}</span>
      <span className="text-gray-500 text-xs">{label}</span>
    </div>
  );
}

export default function WeatherCard({ city = 'Mumbai' }) {
  const { weather, loading, error, refresh } = useWeather(city);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
        <div className="h-10 bg-gray-800 rounded w-1/2 mb-3" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full flex flex-col justify-center">
        <p className="text-red-400 text-sm mb-1">⚠️ Weather fetch failed</p>
        <p className="text-gray-500 text-xs mb-3">{error}</p>
        <button
          onClick={refresh}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition w-fit"
        >
          Retry
        </button>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  // Irrigation advice based on weather
  const irrigationHint =
    weather.rain > 2
      ? { text: 'Rain detected — consider skipping irrigation', color: 'text-blue-400' }
      : weather.humidity > 80
      ? { text: 'High humidity — reduce watering', color: 'text-cyan-400' }
      : weather.temp > 35
      ? { text: 'Hot day — increase irrigation frequency', color: 'text-orange-400' }
      : { text: 'Normal conditions', color: 'text-green-400' };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Weather</p>
          <p className="text-white font-semibold">
            {weather.city}, {weather.country}
          </p>
        </div>
        <img src={iconUrl} alt={weather.description} className="w-12 h-12" />
      </div>

      {/* Main temp */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl font-bold text-white">{weather.temp}°C</span>
        <span className="text-gray-400 text-sm mb-1 capitalize">{weather.description}</span>
      </div>
      <p className="text-gray-500 text-xs mb-4">Feels like {weather.feelsLike}°C</p>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 border-t border-gray-800 pt-4 mb-4">
        <WeatherStat icon="💧" label="Humidity" value={`${weather.humidity}%`} />
        <WeatherStat icon="💨" label="Wind" value={`${weather.windSpeed} m/s`} />
        <WeatherStat icon="☁️" label="Clouds" value={`${weather.clouds}%`} />
        <WeatherStat icon="🌧️" label="Rain 1h" value={`${weather.rain} mm`} />
      </div>

      {/* Irrigation hint */}
      <div className={`text-xs ${irrigationHint.color} bg-gray-800 rounded-lg px-3 py-2`}>
        💡 {irrigationHint.text}
      </div>
    </div>
  );
}
