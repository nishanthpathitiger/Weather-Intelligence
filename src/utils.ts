export function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
  return directions[index];
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function formatDatePretty(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
}

export function getUVLevel(uv: number): { level: string; color: string; bg: string } {
  if (uv <= 2) return { level: "Low", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" };
  if (uv <= 5) return { level: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" };
  if (uv <= 7) return { level: "High", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30" };
  if (uv <= 10) return { level: "Very High", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" };
  return { level: "Extreme", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" };
}

export function getComfortScore(temp: number, humidity: number): { score: number; label: string; color: string } {
  // Simple comfort index based on temperature and relative humidity
  // Optimal temperature is around 20-24C, humidity 40-60%
  let penalty = 0;
  
  // Temp penalties
  if (temp < 15) {
    penalty += Math.min(40, (15 - temp) * 3);
  } else if (temp > 25) {
    penalty += Math.min(40, (temp - 25) * 4);
  }
  
  // Humidity penalties
  if (humidity < 30) {
    penalty += Math.min(20, (30 - humidity) * 0.8);
  } else if (humidity > 70) {
    penalty += Math.min(30, (humidity - 70) * 1.2);
  }
  
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  
  let label = "Pleasant";
  let color = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30";
  if (score > 85) {
    label = "Perfect";
    color = "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/30";
  } else if (score < 40) {
    label = "Uncomfortable";
    color = "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30";
  } else if (score < 70) {
    label = "Moderate";
    color = "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30";
  }
  
  return { score, label, color };
}
