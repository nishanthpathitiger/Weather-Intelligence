import React, { useState } from "react";
import { DailyWeatherPoint, HourlyWeatherPoint } from "../types";
import { formatDayName, formatDatePretty } from "../utils";

interface WeatherChartProps {
  hourlyData: HourlyWeatherPoint[];
  dailyData: DailyWeatherPoint[];
}

export default function WeatherChart({ hourlyData, dailyData }: WeatherChartProps) {
  const [viewType, setViewType] = useState<"hourly" | "daily">("hourly");
  const [metricType, setMetricType] = useState<"temp" | "precip">("temp");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Take the first 24 points of hourly data or the 7 points of daily data
  const dataPoints = viewType === "hourly" ? hourlyData.slice(0, 24) : dailyData;

  const getValues = () => {
    if (metricType === "temp") {
      return viewType === "hourly"
        ? (dataPoints as HourlyWeatherPoint[]).map((d) => d.temp)
        : (dataPoints as DailyWeatherPoint[]).map((d) => d.tempMax);
    } else {
      return viewType === "hourly"
        ? (dataPoints as HourlyWeatherPoint[]).map((d) => d.precipProb)
        : (dataPoints as DailyWeatherPoint[]).map((d) => d.precipitationProbMax);
    }
  };

  const values = getValues();
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue === 0 ? 1 : maxValue - minValue;

  // Chart configuration
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const coords = values.map((val, index) => {
    const x = paddingX + (index / (values.length - 1)) * chartWidth;
    // Invert Y so higher values are on top
    const y = paddingY + chartHeight - ((val - minValue) / valueRange) * chartHeight;
    return { x, y, value: val, original: dataPoints[index] };
  });

  // SVG drawing logic for Line Chart (Temperature)
  let linePath = "";
  let areaPath = "";

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map((c) => `L ${c.x} ${c.y}`).join(" ");
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;
  }

  // Formatting helpers for the axes and tooltips
  const formatXLabel = (index: number, orig: any) => {
    if (viewType === "hourly") {
      if (index % 4 !== 0) return ""; // Show every 4th hour
      const time = new Date(orig.time);
      return time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    } else {
      return formatDayName((orig as DailyWeatherPoint).date);
    }
  };

  const getMetricLabel = () => {
    if (metricType === "temp") return "Temperature (°C)";
    return "Rain Probability (%)";
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      {/* Chart Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-slate-800">
            Weather Trend Visualization
          </h3>
          <p className="text-sm text-slate-500">
            Interactive chart plotting forecast parameters
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hourly vs Daily */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <button
              onClick={() => {
                setViewType("hourly");
                setHoverIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === "hourly"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Next 24h
            </button>
            <button
              onClick={() => {
                setViewType("daily");
                setHoverIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === "daily"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              7-Day
            </button>
          </div>

          {/* Metric Selector */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <button
              onClick={() => setMetricType("temp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                metricType === "temp"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setMetricType("precip")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                metricType === "precip"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Rain %
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <div className="min-w-[600px] w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={metricType === "temp" ? "#f59e0b" : "#3b82f6"}
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={metricType === "temp" ? "#f59e0b" : "#3b82f6"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingY + ratio * chartHeight;
              const val = maxValue - ratio * valueRange;
              return (
                <g key={idx} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="font-mono text-[10px] fill-slate-400"
                  >
                    {Math.round(val)}
                    {metricType === "temp" ? "°" : "%"}
                  </text>
                </g>
              );
            })}

            {metricType === "temp" ? (
              // Line Chart style
              <>
                {/* Shaded Area */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Main Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricType === "temp" ? "#f59e0b" : "#3b82f6"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {coords.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={hoverIndex === index ? 6 : 4}
                      fill={metricType === "temp" ? "#f59e0b" : "#3b82f6"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                    />
                  </g>
                ))}
              </>
            ) : (
              // Bar Chart style
              coords.map((point, index) => {
                const barWidth = Math.max(8, chartWidth / coords.length - 8);
                const barHeight = height - paddingY - point.y;
                return (
                  <rect
                    key={index}
                    x={point.x - barWidth / 2}
                    y={point.y}
                    width={barWidth}
                    height={Math.max(2, barHeight)}
                    rx="3"
                    fill={hoverIndex === index ? "#2563eb" : "#3b82f6"}
                    className="cursor-pointer transition-all duration-150 opacity-90 hover:opacity-100"
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                );
              })
            )}

            {/* X Axis Labels */}
            {coords.map((point, index) => {
              const label = formatXLabel(index, point.original);
              if (!label) return null;
              return (
                <text
                  key={index}
                  x={point.x}
                  y={height - paddingY + 20}
                  textAnchor="middle"
                  className="font-sans text-[11px] font-medium fill-slate-500"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tooltip detail (displays active point values) */}
      <div className="h-12 flex items-center justify-center border-t border-slate-100 pt-3">
        {hoverIndex !== null && coords[hoverIndex] ? (
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 animate-fade-in">
            <span className="bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-mono">
              {viewType === "hourly"
                ? new Date((coords[hoverIndex].original as HourlyWeatherPoint).time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : formatDatePretty((coords[hoverIndex].original as DailyWeatherPoint).date)}
            </span>
            <span className="flex items-center gap-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  metricType === "temp" ? "bg-amber-500" : "bg-blue-500"
                }`}
              ></span>
              {getMetricLabel()}:{" "}
              <strong className="text-slate-900 text-sm">
                {coords[hoverIndex].value}
                {metricType === "temp" ? "°C" : "%"}
              </strong>
            </span>
            {viewType === "hourly" && (
              <span className="text-slate-400 font-normal">
                Precipitation: {(coords[hoverIndex].original as HourlyWeatherPoint).precip} mm
              </span>
            )}
            {viewType === "daily" && (
              <span className="text-slate-400 font-normal">
                Min: {(coords[hoverIndex].original as DailyWeatherPoint).tempMin}°C
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Hover over any chart point to inspect weather parameters.
          </p>
        )}
      </div>
    </div>
  );
}
