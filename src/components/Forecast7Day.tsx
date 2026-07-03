import React from "react";
import { DailyWeatherPoint } from "../types";
import { lookupWeatherCode } from "../types";
import { formatDayName } from "../utils";
import WeatherIcon from "./WeatherIcon";

interface Forecast7DayProps {
  daily: DailyWeatherPoint[];
}

export default function Forecast7Day({ daily }: Forecast7DayProps) {
  return (
    <div className="bg-white border border-slate-100/80 rounded-[32px] p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            7-Day Forecast Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Weekly meteorological sequences and conditions
          </p>
        </div>
        <span className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
          Detailed Matrix
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {daily.map((day, index) => {
          const details = lookupWeatherCode(day.weatherCode);
          const isToday = index === 0;

          return (
            <div
              key={index}
              className={`border rounded-3xl p-4.5 flex flex-col items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 shadow-sm ${
                isToday
                  ? "bg-gradient-to-b from-blue-600 to-indigo-700 border-transparent text-white shadow-md shadow-blue-200"
                  : "bg-white border-slate-100/80 text-slate-800"
              }`}
            >
              {/* Day Header */}
              <div className="text-center">
                <span
                  className={`text-xs font-extrabold uppercase tracking-widest ${
                    isToday ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {isToday ? "Today" : formatDayName(day.date)}
                </span>
                <p className={`text-[10px] mt-0.5 ${isToday ? "text-blue-200" : "text-slate-400"}`}>
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC"
                  })}
                </p>
              </div>

              {/* Weather Condition Icon */}
              <div
                className={`p-2.5 rounded-2xl ${
                  isToday
                    ? "bg-white/10 text-white"
                    : "bg-slate-50 text-slate-600"
                } transition-colors`}
              >
                <WeatherIcon name={details.icon} className="w-7 h-7" />
              </div>

              {/* Forecast Conditions & Temps */}
              <div className="text-center flex flex-col gap-1">
                <span className={`text-[11px] font-semibold tracking-tight truncate max-w-[80px] ${isToday ? "text-blue-100" : "text-slate-500"}`}>
                  {details.label}
                </span>

                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <p className="font-display font-extrabold text-base">
                    {Math.round(day.tempMax)}°
                  </p>
                  <p
                    className={`font-display text-xs font-semibold ${
                      isToday ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {Math.round(day.tempMin)}°
                  </p>
                </div>
              </div>

              {/* Rain indicator footer bar */}
              {day.precipitationProbMax > 0 && (
                <div
                  className={`w-full py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-mono font-bold ${
                    isToday ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <WeatherIcon name="Droplets" className="w-2.5 h-2.5" />
                  <span>{day.precipitationProbMax}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
