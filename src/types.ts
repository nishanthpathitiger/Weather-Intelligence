export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  admin1?: string;
  country: string;
}

export interface CurrentWeather {
  temp: number;
  apparent: number;
  isDay: boolean;
  weatherCode: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  pressure: number;
}

export interface HourlyWeatherPoint {
  time: string;
  temp: number;
  apparentTemp: number;
  precipProb: number;
  precip: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyWeatherPoint {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationHours: number;
  precipitationProbMax: number;
  windSpeedMax: number;
}

export interface AIRecommendation {
  summary: string;
  clothingAdvice: string;
  activities: {
    name: string;
    suitability: "High" | "Moderate" | "Poor";
    reason: string;
  }[];
  packingList: string[];
  precautions: string[];
  activityPlanner: string;
}

export interface WeatherCodeDetails {
  label: string;
  icon: string; // Refers to a Lucide icon key name
  bgGradient: string; // Tailwind gradient classes
  colorTheme: string; // Base theme color name (amber, blue, slate, etc.)
  bannerImg: string; // Prompt used to describe the background feel
}

export const WEATHER_CODES: Record<number, WeatherCodeDetails> = {
  0: {
    label: "Clear Sky",
    icon: "Sun",
    bgGradient: "from-amber-400 to-orange-500",
    colorTheme: "amber",
    bannerImg: "sunny_sky"
  },
  1: {
    label: "Mainly Clear",
    icon: "SunDim",
    bgGradient: "from-amber-300 to-blue-400",
    colorTheme: "amber",
    bannerImg: "mostly_clear_sky"
  },
  2: {
    label: "Partly Cloudy",
    icon: "CloudSun",
    bgGradient: "from-blue-300 to-slate-400",
    colorTheme: "sky",
    bannerImg: "partly_cloudy"
  },
  3: {
    label: "Overcast",
    icon: "Cloud",
    bgGradient: "from-slate-400 to-slate-600",
    colorTheme: "slate",
    bannerImg: "overcast_clouds"
  },
  45: {
    label: "Foggy",
    icon: "CloudFog",
    bgGradient: "from-slate-300 to-zinc-400",
    colorTheme: "zinc",
    bannerImg: "misty_fog"
  },
  48: {
    label: "Depositing Rime Fog",
    icon: "CloudFog",
    bgGradient: "from-slate-300 to-blue-200",
    colorTheme: "blue",
    bannerImg: "frosty_fog"
  },
  51: {
    label: "Light Drizzle",
    icon: "CloudDrizzle",
    bgGradient: "from-sky-300 to-slate-500",
    colorTheme: "sky",
    bannerImg: "light_drizzle"
  },
  53: {
    label: "Moderate Drizzle",
    icon: "CloudDrizzle",
    bgGradient: "from-blue-300 to-slate-600",
    colorTheme: "blue",
    bannerImg: "moderate_rain"
  },
  55: {
    label: "Dense Drizzle",
    icon: "CloudDrizzle",
    bgGradient: "from-blue-400 to-slate-700",
    colorTheme: "blue",
    bannerImg: "dense_rain"
  },
  56: {
    label: "Light Freezing Drizzle",
    icon: "CloudSnow",
    bgGradient: "from-indigo-300 to-slate-500",
    colorTheme: "indigo",
    bannerImg: "freezing_drizzle"
  },
  57: {
    label: "Dense Freezing Drizzle",
    icon: "CloudSnow",
    bgGradient: "from-indigo-400 to-slate-600",
    colorTheme: "indigo",
    bannerImg: "freezing_rain"
  },
  61: {
    label: "Slight Rain",
    icon: "CloudRain",
    bgGradient: "from-blue-400 to-slate-600",
    colorTheme: "blue",
    bannerImg: "slight_rain"
  },
  63: {
    label: "Moderate Rain",
    icon: "CloudRain",
    bgGradient: "from-blue-500 to-slate-700",
    colorTheme: "blue",
    bannerImg: "moderate_rain"
  },
  65: {
    label: "Heavy Rain",
    icon: "CloudRainWind",
    bgGradient: "from-blue-600 to-slate-800",
    colorTheme: "blue",
    bannerImg: "torrential_rain"
  },
  66: {
    label: "Light Freezing Rain",
    icon: "CloudSnow",
    bgGradient: "from-indigo-400 to-slate-700",
    colorTheme: "indigo",
    bannerImg: "freezing_rain"
  },
  67: {
    label: "Heavy Freezing Rain",
    icon: "CloudSnow",
    bgGradient: "from-indigo-500 to-slate-800",
    colorTheme: "indigo",
    bannerImg: "freezing_rain_heavy"
  },
  71: {
    label: "Slight Snowfall",
    icon: "Snowflake",
    bgGradient: "from-teal-200 to-slate-400",
    colorTheme: "teal",
    bannerImg: "slight_snowfall"
  },
  73: {
    label: "Moderate Snowfall",
    icon: "Snowflake",
    bgGradient: "from-teal-300 to-slate-500",
    colorTheme: "teal",
    bannerImg: "snowy_winter"
  },
  75: {
    label: "Heavy Snowfall",
    icon: "Snowflake",
    bgGradient: "from-teal-400 to-slate-600",
    colorTheme: "teal",
    bannerImg: "blizzard_snow"
  },
  77: {
    label: "Snow Grains",
    icon: "Snowflake",
    bgGradient: "from-teal-200 to-blue-300",
    colorTheme: "teal",
    bannerImg: "hail_grains"
  },
  80: {
    label: "Slight Rain Showers",
    icon: "CloudRain",
    bgGradient: "from-sky-400 to-indigo-600",
    colorTheme: "sky",
    bannerImg: "scattered_showers"
  },
  81: {
    label: "Moderate Rain Showers",
    icon: "CloudRain",
    bgGradient: "from-sky-500 to-indigo-700",
    colorTheme: "sky",
    bannerImg: "rain_showers"
  },
  82: {
    label: "Violent Rain Showers",
    icon: "CloudRainWind",
    bgGradient: "from-indigo-600 to-slate-900",
    colorTheme: "indigo",
    bannerImg: "downpour_heavy"
  },
  85: {
    label: "Slight Snow Showers",
    icon: "Snowflake",
    bgGradient: "from-teal-200 to-indigo-400",
    colorTheme: "teal",
    bannerImg: "snow_flurries"
  },
  86: {
    label: "Heavy Snow Showers",
    icon: "Snowflake",
    bgGradient: "from-teal-300 to-indigo-600",
    colorTheme: "teal",
    bannerImg: "heavy_snow_shower"
  },
  95: {
    label: "Thunderstorm",
    icon: "CloudLightning",
    bgGradient: "from-violet-600 to-slate-900",
    colorTheme: "violet",
    bannerImg: "thunderstorm"
  },
  96: {
    label: "Thunderstorm with Hail",
    icon: "CloudLightning",
    bgGradient: "from-violet-700 to-slate-950",
    colorTheme: "violet",
    bannerImg: "thunderstorm_hail"
  },
  99: {
    label: "Heavy Thunderstorm with Hail",
    icon: "CloudLightning",
    bgGradient: "from-violet-800 to-slate-950",
    colorTheme: "violet",
    bannerImg: "severe_thunderstorm"
  }
};

export function lookupWeatherCode(code: number): WeatherCodeDetails {
  return WEATHER_CODES[code] || {
    label: "Unknown Weather",
    icon: "HelpCircle",
    bgGradient: "from-slate-400 to-slate-600",
    colorTheme: "slate",
    bannerImg: "gray_sky"
  };
}
