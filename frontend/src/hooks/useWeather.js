import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function parseWeather(data) {
  return {
    city: data.name,
    country: data.sys?.country ?? '',
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    windSpeed: data.wind.speed,
    clouds: data.clouds.all,
    rain: data.rain?.['1h'] ?? 0,
  };
}

async function fetchByCoords(lat, lon) {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return parseWeather(data);
}

async function fetchByCity(city = 'London') {
  const res = await fetch(
    `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return parseWeather(data);
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    // 8 second timeout so we don't hang forever
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
  });
}

export function useWeather(fallbackCity = 'London') {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!API_KEY) {
      setError('OpenWeatherMap API key not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try geolocation first, fall back to city name
      let data;
      try {
        const pos = await getLocation();
        data = await fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      } catch {
        // Geolocation denied or timed out — use fallback city
        data = await fetchByCity(fallbackCity);
      }
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10 * 60 * 1000); // refresh every 10 min
    return () => clearInterval(interval);
  }, []);

  return { weather, loading, error, refresh: load };
}
