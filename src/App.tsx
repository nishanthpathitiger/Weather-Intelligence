import React, { useState, useEffect, useRef } from "react";
import { GeocodingResult, CurrentWeather as CurrentType, HourlyWeatherPoint, DailyWeatherPoint, AIRecommendation } from "./types";
import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import Forecast7Day from "./components/Forecast7Day";
import WeatherChart from "./components/WeatherChart";
import AIPlanner from "./components/AIPlanner";
import WeatherIcon from "./components/WeatherIcon";

const QUICK_CITIES: GeocodingResult[] = [
  { id: 1, name: "Paris", latitude: 48.8534, longitude: 2.3488, country: "France", country_code: "FR" },
  { id: 2, name: "New York", latitude: 40.7128, longitude: -74.006, country: "United States", country_code: "US" },
  { id: 3, name: "Tokyo", latitude: 35.6895, longitude: 139.6917, country: "Japan", country_code: "JP" },
  { id: 4, name: "London", latitude: 51.5074, longitude: -0.1278, country: "United Kingdom", country_code: "GB" },
  { id: 5, name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "Australia", country_code: "AU" },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentType | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWeatherPoint[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherPoint[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<GeocodingResult[]>([]);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Retrieve favorites & last searched city from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem("weather_fav_cities");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to parse favorites");
      }
    }

    const lastCity = localStorage.getItem("weather_last_city");
    if (lastCity) {
      try {
        const cityObj = JSON.parse(lastCity);
        setSelectedCity(cityObj);
        fetchWeatherData(cityObj);
      } catch (e) {
        loadDefaultCity();
      }
    } else {
      loadDefaultCity();
    }
  }, []);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const loadDefaultCity = () => {
    const defaultCity = QUICK_CITIES[0]; // Paris
    setSelectedCity(defaultCity);
    fetchWeatherData(defaultCity);
  };

  // 2. Fetch Geocoding suggestions from our API as the user types
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?name=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding suggestions error:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 3. Core function to fetch weather data for a selected location
  const fetchWeatherData = async (city: GeocodingResult) => {
    setLoadingWeather(true);
    setErrorMsg(null);
    localStorage.setItem("weather_last_city", JSON.stringify(city));

    try {
      const weatherRes = await fetch(
        `/api/forecast?latitude=${city.latitude}&longitude=${city.longitude}`
      );
      if (!weatherRes.ok) {
        throw new Error("Unable to fetch weather details for this location. Please try again.");
      }
      const data = await weatherRes.json();

      // Parse Current Weather
      const cur = data.current;
      const currentParsed: CurrentType = {
        temp: cur.temperature_2m,
        apparent: cur.apparent_temperature,
        isDay: cur.is_day === 1,
        weatherCode: cur.weather_code,
        humidity: cur.relative_humidity_2m,
        precipitation: cur.precipitation,
        windSpeed: cur.wind_speed_10m,
        windDirection: cur.wind_direction_10m,
        cloudCover: cur.cloud_cover,
        pressure: cur.pressure_msl,
      };

      // Parse Hourly Forecast
      const hourlyData: HourlyWeatherPoint[] = [];
      const times = data.hourly.time;
      for (let i = 0; i < times.length; i++) {
        hourlyData.push({
          time: times[i],
          temp: data.hourly.temperature_2m[i],
          apparentTemp: data.hourly.apparent_temperature[i],
          precipProb: data.hourly.precipitation_probability[i],
          precip: data.hourly.precipitation[i],
          weatherCode: data.hourly.weather_code[i],
          windSpeed: data.hourly.wind_speed_10m[i],
          uvIndex: data.hourly.uv_index[i],
        });
      }

      // Parse 7-Day Forecast
      const dailyData: DailyWeatherPoint[] = [];
      const days = data.daily.time;
      for (let i = 0; i < days.length; i++) {
        dailyData.push({
          date: days[i],
          weatherCode: data.daily.weather_code[i],
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          apparentMax: data.daily.apparent_temperature_max[i],
          apparentMin: data.daily.apparent_temperature_min[i],
          sunrise: data.daily.sunrise[i],
          sunset: data.daily.sunset[i],
          uvIndexMax: data.daily.uv_index_max[i],
          precipitationSum: data.daily.precipitation_sum[i],
          precipitationHours: data.daily.precipitation_hours[i],
          precipitationProbMax: data.daily.precipitation_probability_max[i],
          windSpeedMax: data.daily.wind_speed_10m_max[i],
        });
      }

      setCurrentWeather(currentParsed);
      setHourlyForecast(hourlyData);
      setDailyForecast(dailyData);

      // Trigger Gemini AI planning recommendation automatically on location select
      fetchRecommendations(city.name, currentParsed, dailyData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load weather data");
    } finally {
      setLoadingWeather(false);
    }
  };

  // 4. Fetch Gemini AI Recommendations
  const fetchRecommendations = async (
    cityName: string,
    current: CurrentType,
    daily: DailyWeatherPoint[],
    customActivity?: string
  ) => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName,
          current: {
            temp: current.temp,
            apparent: current.apparent,
            weatherCode: current.weatherCode,
            humidity: current.humidity,
            windSpeed: current.windSpeed,
            precipitation: current.precipitation,
          },
          daily: daily.map((d) => ({
            date: d.date,
            tempMax: d.tempMax,
            tempMin: d.tempMin,
            weatherCode: d.weatherCode,
            precipitationSum: d.precipitationSum,
            precipitationProbMax: d.precipitationProbMax,
            uvIndexMax: d.uvIndexMax,
          })),
          customActivity,
        }),
      });

      if (!response.ok) throw new Error("Failed to retrieve AI recommendations");
      const recommendations: AIRecommendation = await response.json();
      setAiRecommendations(recommendations);
    } catch (err) {
      console.error("AI recommendations failure:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Favorite toggler
  const toggleFavorite = () => {
    if (!selectedCity) return;
    let updated: GeocodingResult[] = [];
    const isFav = favorites.some((f) => f.latitude === selectedCity.latitude && f.longitude === selectedCity.longitude);

    if (isFav) {
      updated = favorites.filter(
        (f) => !(f.latitude === selectedCity.latitude && f.longitude === selectedCity.longitude)
      );
    } else {
      updated = [...favorites, selectedCity];
    }

    setFavorites(updated);
    localStorage.setItem("weather_fav_cities", JSON.stringify(updated));
  };

  const handleSelectCity = (city: GeocodingResult) => {
    setSelectedCity(city);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeatherData(city);
  };

  const handleCustomPlanSubmit = (activity: string) => {
    if (!selectedCity || !currentWeather || dailyForecast.length === 0) return;
    fetchRecommendations(selectedCity.name, currentWeather, dailyForecast, activity);
  };

  const isCurrentFavorite = selectedCity
    ? favorites.some((f) => f.latitude === selectedCity.latitude && f.longitude === selectedCity.longitude)
    : false;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* SIDEBAR: Search & Insights */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200/80 flex flex-col p-6 shadow-sm md:h-screen md:sticky md:top-0 overflow-y-auto shrink-0 z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <WeatherIcon name="ThermometerSun" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 font-display">Skyline IQ</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AeroIntel Core</p>
          </div>
        </div>

        {/* Autocomplete Search Input Bar */}
        <div className="relative mb-6" ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Search city..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-5 pr-11 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-medium"
          />
          <div className="absolute right-4 top-3.5 text-slate-400">
            <WeatherIcon name="Search" className="w-4.5 h-4.5" />
          </div>

          {/* geocoding suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-13 left-0 right-0 bg-white border border-slate-100/80 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 max-h-64 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectCity(s)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col cursor-pointer transition-all"
                >
                  <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {s.admin1 ? `${s.admin1}, ` : ""}
                    {s.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Locations */}
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <WeatherIcon name="Star" className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            Pinned Locations
          </h2>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {favorites.map((fav) => (
              <button
                key={`${fav.latitude}-${fav.longitude}`}
                onClick={() => handleSelectCity(fav)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                  selectedCity?.latitude === fav.latitude && selectedCity?.longitude === fav.longitude
                    ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm"
                    : "bg-white hover:bg-slate-50 border-slate-100/80 text-slate-600"
                }`}
              >
                <span className="truncate">{fav.name}</span>
                <span className="text-[9px] font-mono text-slate-400 font-extrabold">{fav.country_code || "INT"}</span>
              </button>
            ))}
            {favorites.length === 0 && (
              <p className="text-[11px] text-slate-400 italic px-1 font-medium">
                No pinned locations yet. Search and bookmark a city!
              </p>
            )}
          </div>
        </div>

        {/* Featured Quick Cities */}
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Featured Cities
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_CITIES.map((q) => {
              const existsInFavs = favorites.some((f) => f.latitude === q.latitude && f.longitude === q.longitude);
              if (existsInFavs) return null;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectCity(q)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedCity?.latitude === q.latitude && selectedCity?.longitude === q.longitude
                      ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm"
                      : "bg-slate-50/50 hover:bg-slate-50 border-slate-100/30 text-slate-600"
                  }`}
                >
                  {q.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Insights Panel */}
        {aiRecommendations && (
          <div className="mt-2 flex-1 hidden md:flex flex-col">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <WeatherIcon name="Sparkles" className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              Smart Insights
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-100/60">
                <p className="text-[9px] font-extrabold text-blue-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <WeatherIcon name="Shirt" className="w-3 h-3" />
                  Apparel Briefing
                </p>
                <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                  "{aiRecommendations.clothingAdvice.length > 105 ? aiRecommendations.clothingAdvice.substring(0, 102) + '...' : aiRecommendations.clothingAdvice}"
                </p>
              </div>
              {aiRecommendations.precautions.length > 0 && (
                <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-100/60">
                  <p className="text-[9px] font-extrabold text-amber-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                    <WeatherIcon name="ShieldAlert" className="w-3 h-3" />
                    Travel Alert
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {aiRecommendations.precautions[0]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User profile guest card */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 shrink-0">
              <WeatherIcon name="User" className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-slate-800 truncate">Guest Explorer</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">
                {selectedCity ? `${selectedCity.name}, ${selectedCity.country_code || selectedCity.country}` : "Ready"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <WeatherIcon name="AlertTriangle" className="w-5 h-5 shrink-0" />
            <p className="text-xs font-semibold">{errorMsg}</p>
          </div>
        )}

        {selectedCity && (
          <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <WeatherIcon name="MapPin" className="w-3.5 h-3.5 text-slate-400" />
                {selectedCity.country}
              </p>
              <div className="flex items-center gap-3.5">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                  {selectedCity.name}
                </h2>
                <button
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrentFavorite
                      ? "bg-amber-50 border-amber-200 text-amber-500 shadow-sm shadow-amber-500/10"
                      : "bg-white border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                  title={isCurrentFavorite ? "Remove from Favorites" : "Bookmark City"}
                >
                  <WeatherIcon name="Star" className={`w-4 h-4 ${isCurrentFavorite ? "fill-amber-400" : ""}`} />
                </button>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-slate-950 font-extrabold text-lg font-display">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                Last updated 2 mins ago
              </p>
            </div>
          </header>
        )}

        {/* Loading Spinner Area */}
        {loadingWeather ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center my-12">
            <div className="relative flex items-center justify-center w-12 h-12">
              <div className="absolute w-10 h-10 border-4 border-blue-500/10 rounded-full"></div>
              <div className="absolute w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Syncing live meteorological maps...</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Retrieving high-fidelity weather readings for your selected destination</p>
            </div>
          </div>
        ) : (
          selectedCity &&
          currentWeather && (
            <div className="flex flex-col gap-8">
              {/* Hero current conditions & stat cards bento layout */}
              <section>
                <CurrentWeather
                  city={selectedCity.name}
                  country={selectedCity.country}
                  current={currentWeather}
                  tempMax={dailyForecast[0]?.tempMax}
                  tempMin={dailyForecast[0]?.tempMin}
                  uvIndex={dailyForecast[0]?.uvIndexMax}
                />
              </section>

              {/* 7-Day Forecast Section */}
              <section>
                <Forecast7Day daily={dailyForecast} />
              </section>

              {/* Timeline, Analytics, & AI Planner row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hourly Sequencer Card */}
                <div className="flex flex-col gap-6">
                  <HourlyForecast hourly={hourlyForecast} />
                  <WeatherChart hourlyData={hourlyForecast} dailyData={dailyForecast} />
                </div>

                {/* Gemini Planner Module */}
                <div>
                  <AIPlanner
                    city={selectedCity.name}
                    recommendations={aiRecommendations}
                    loading={loadingAI}
                    onRefreshCustomActivity={handleCustomPlanSubmit}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
