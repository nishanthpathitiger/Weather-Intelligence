import React from "react";
import { CurrentWeather as CurrentType } from "../types";
import { lookupWeatherCode } from "../types";
import { getWindDirection, getComfortScore } from "../utils";
import WeatherIcon from "./WeatherIcon";

interface CurrentWeatherProps {
  city: string;
  country: string;
  current: CurrentType;
  tempMax?: number;
  tempMin?: number;
  uvIndex?: number;
}

export default function CurrentWeather({
  city,
  country,
  current,
  tempMax,
  tempMin,
  uvIndex,
}: CurrentWeatherProps) {
  const details = lookupWeatherCode(current.weatherCode);
  const { score, label: comfortLabel } = getComfortScore(current.temp, current.humidity);

  // Defaults if today's high/low aren't available yet
  const displayHigh = tempMax !== undefined ? Math.round(tempMax) : Math.round(current.temp + 3);
  const displayLow = tempMin !== undefined ? Math.round(tempMin) : Math.round(current.temp - 4);
  const displayUv = uvIndex !== undefined ? Math.round(uvIndex) : 4;

  const getUvLevel = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hero Weather Card: Left 2 columns */}
      <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[32px] p-8 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl shadow-blue-200/50 relative overflow-hidden group">
        {/* Sky Ambient Glow Details */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-700">
          <WeatherIcon name={details.icon} className="w-72 h-72 text-white" />
        </div>

        <div className="flex flex-col h-full justify-between z-10">
          <div>
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase select-none inline-flex items-center gap-1.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Report
            </span>
            <div className="flex items-baseline mt-4">
              <h2 className="text-8xl font-display font-black tracking-tighter leading-none">
                {Math.round(current.temp)}°
              </h2>
            </div>
            <div className="text-2xl font-semibold opacity-90 mt-2 font-display">
              {details.label}
            </div>
          </div>

          <div className="flex gap-5 mt-6 opacity-90 text-sm font-semibold font-mono">
            <span className="bg-white/10 px-3 py-1 rounded-xl">H: {displayHigh}°</span>
            <span className="bg-white/10 px-3 py-1 rounded-xl">L: {displayLow}°</span>
          </div>
        </div>

        {/* Condition Large Illustration */}
        <div className="w-36 h-36 md:w-44 md:h-44 flex items-center justify-center z-10 self-center md:self-auto mt-6 md:mt-0 drop-shadow-2xl">
          <WeatherIcon name={details.icon} className="w-full h-full text-white animate-bounce-subtle" />
        </div>
      </div>

      {/* Stats Bento Grid: Right 1 column */}
      <div className="grid grid-cols-2 gap-4">
        {/* UV Index */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">UV Index</p>
            <WeatherIcon name="Sun" className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-800 font-display">{displayUv}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{getUvLevel(displayUv)}</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">Humidity</p>
            <WeatherIcon name="Droplets" className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-800 font-display">{current.humidity}%</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Water vapor</p>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">Wind</p>
            <WeatherIcon name="Wind" className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-800 font-display">
              {current.windSpeed} <span className="text-sm text-slate-400 font-bold font-sans">km/h</span>
            </p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{getWindDirection(current.windDirection)}</p>
          </div>
        </div>

        {/* Feel & Comfort */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-widest">Comfort</p>
            <WeatherIcon name="Gauge" className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-800 font-display">{comfortLabel}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Score: {score}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
