import React from "react";
import { HourlyWeatherPoint } from "../types";
import { lookupWeatherCode } from "../types";
import WeatherIcon from "./WeatherIcon";

interface HourlyForecastProps {
  hourly: HourlyWeatherPoint[];
}

export default function HourlyForecast({ hourly }: HourlyForecastProps) {
  // Take first 24 hours of data
  const next24h = hourly.slice(0, 24);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-display font-semibold text-lg text-slate-800">
          Hourly Weather Sequence
        </h3>
        <p className="text-sm text-slate-500">
          Upcoming 24-hour temperature and conditions timeline
        </p>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {next24h.map((hour, index) => {
          const details = lookupWeatherCode(hour.weatherCode);
          const time = new Date(hour.time);
          const hourLabel = time.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          });

          const isCurrentHour = index === 0;

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-between min-w-[84px] py-4 px-3 rounded-2xl border transition-all duration-200 select-none ${
                isCurrentHour
                  ? "bg-gradient-to-b from-blue-500 to-indigo-600 text-white border-transparent shadow-md scale-102"
                  : "bg-slate-50/50 hover:bg-slate-50 border-slate-100/70 text-slate-700"
              }`}
            >
              <span className={`text-[11px] font-semibold ${isCurrentHour ? "text-white/90" : "text-slate-400"}`}>
                {isCurrentHour ? "Now" : hourLabel}
              </span>

              {/* Weather Icon */}
              <div className="my-3">
                <WeatherIcon
                  name={details.icon}
                  className={`w-6 h-6 ${isCurrentHour ? "text-white" : "text-slate-600"}`}
                />
              </div>

              {/* Temperature */}
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-sm">
                  {Math.round(hour.temp)}°
                </span>

                {/* Rain probability drops */}
                {hour.precipProb > 0 ? (
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-mono mt-1 ${
                      isCurrentHour ? "text-blue-100 font-bold" : "text-blue-500"
                    }`}
                  >
                    <WeatherIcon name="Droplets" className="w-2.5 h-2.5" />
                    {hour.precipProb}%
                  </span>
                ) : (
                  <span className={`text-[10px] mt-1 font-mono ${isCurrentHour ? "text-white/60" : "text-slate-300"}`}>
                    -
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
