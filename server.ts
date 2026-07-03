import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Geocoding Proxy Route
app.get("/api/geocode", async (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "City name parameter is required" });
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch geocoding data" });
  }
});

// 2. Forecast Proxy Route
app.get("/api/forecast", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    res.status(400).json({ error: "latitude and longitude parameters are required" });
    return;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo Forecast API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Forecast error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch forecast data" });
  }
});

// 3. AI Recommendations Endpoint
app.post("/api/recommendations", async (req, res) => {
  const { city, current, daily, customActivity } = req.body;

  if (!city || !current || !daily) {
    res.status(400).json({ error: "Missing required weather data in request body" });
    return;
  }

  // Create rules-based backup recommendations if GEMINI_API_KEY is not defined
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found. Serving high-quality rule-based fallback recommendations.");
    const fallback = generateFallbackRecommendations(current, daily, customActivity);
    res.json(fallback);
    return;
  }

  try {
    const ai = getGeminiClient();
    
    // Construct weather context for Gemini prompt
    const prompt = `
Generate intelligent, highly contextual weather planning recommendations for a trip or stay in the city of "${city}".

Here is the current weather:
- Temp: ${current.temp}°C (Apparent: ${current.apparent}°C)
- Weather Code: ${current.weatherCode}
- Humidity: ${current.humidity}%
- Wind Speed: ${current.windSpeed} km/h
- Precipitation: ${current.precipitation} mm

Here is the 7-day forecast outline (from today):
${daily.map((day: any, idx: number) => {
  return `- Day ${idx + 1} (${day.date}): Min Temp ${day.tempMin}°C, Max Temp ${day.tempMax}°C, Weather Code ${day.weatherCode}, Rain Probability Max ${day.precipitationProbMax}%, Precipitation Sum ${day.precipitationSum}mm, Max UV Index ${day.uvIndexMax}`;
}).join("\n")}

User custom activity request: ${customActivity || "None specified. Give general weekend planning advice."}

Provide recommendations adhering strictly to the JSON schema layout. Ensure the safety tips reflect UV, wind, or extreme temperatures if any are detected in the data. Make the summary engaging and conversational.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A friendly, conversational 3-4 sentence overview of what to expect from the weather this week and key takeaways."
            },
            clothingAdvice: {
              type: Type.STRING,
              description: "Specific recommendations for clothing and outerwear to wear based on current and upcoming conditions (e.g., layered clothing, raincoats, thermal gear)."
            },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of activity (e.g. Sightseeing, Jogging, Outdoor Dining)" },
                  suitability: { type: Type.STRING, description: "Suitability index (High, Moderate, Poor)" },
                  reason: { type: Type.STRING, description: "Why it is suitable or not based on the weather conditions." }
                },
                required: ["name", "suitability", "reason"]
              },
              description: "List of common activities and how appropriate they are during this period."
            },
            packingList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A customized list of items, gear, or accessories the user should pack for a trip in this weather."
            },
            precautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable precautions (e.g. 'Apply sunscreen due to high UV', 'Carry an umbrella', 'Watch out for strong wind gusts')."
            },
            activityPlanner: {
              type: Type.STRING,
              description: "A personalized, context-aware analysis of the user's custom activity plan. If they didn't specify one, suggest a great indoor/outdoor schedule for the weekend."
            }
          },
          required: ["summary", "clothingAdvice", "activities", "packingList", "precautions", "activityPlanner"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini model");
    }

    const recommendations = JSON.parse(resultText.trim());
    res.json(recommendations);
  } catch (error: any) {
    console.error("Gemini Recommendations Error:", error);
    // If Gemini fails, we gracefully degrade to high-quality fallback rules
    const fallback = generateFallbackRecommendations(current, daily, customActivity);
    res.json({
      ...fallback,
      summary: `Note: AI-powered service is temporarily unavailable, so we generated these high-quality planning suggestions rules-based. Details: ${error.message || "Unknown error"}.`
    });
  }
});

// High Quality Rule-Based Fallback Recommendations generator
function generateFallbackRecommendations(current: any, daily: any[], customActivity?: string) {
  const isRainy = daily.some(day => day.precipitationSum > 3 || day.precipitationProbMax > 50);
  const isCold = daily.some(day => day.tempMin < 10);
  const isHot = daily.some(day => day.tempMax > 28);
  const isSunny = daily.some(day => day.uvIndexMax > 6);
  const isWindy = current.windSpeed > 25;

  const summary = `The upcoming week shows mixed conditions. Temperatures range from a low of ${Math.min(...daily.map(d => d.tempMin))}°C to a high of ${Math.max(...daily.map(d => d.tempMax))}°C.${isRainy ? " Keep an eye out for rain throughout the week." : " Expect dry and favorable skies."}`;

  let clothingAdvice = "Opt for comfortable smart-casual wear. ";
  if (isCold) clothingAdvice += "Bring warm layers, a cozy sweater, and a windbreaker. ";
  if (isHot) clothingAdvice += "Wear lightweight, breathable linen or cotton apparel. ";
  if (isRainy) clothingAdvice += "Be sure to carry waterproof outerwear or a rain jacket. ";

  const activities = [
    {
      name: "Sightseeing & Walking",
      suitability: isRainy ? "Moderate" : "High",
      reason: isRainy ? "Damp pavement and occasional showers might make walking slippery." : "Pleasant skies and clear conditions are ideal for exploring."
    },
    {
      name: "Outdoor Jogging/Cycling",
      suitability: (isRainy || isHot) ? "Moderate" : "High",
      reason: isHot ? "Avoid mid-day heat; jog during early morning or sunset." : isRainy ? "Wet surfaces require extra caution." : "Excellent fresh breezes and moderate temperatures."
    },
    {
      name: "Indoor Museums & Exhibits",
      suitability: "High",
      reason: "Always a solid option, particularly cozy during rainy or very hot afternoons."
    }
  ];

  const packingList = ["Water bottle", "Phone charger", "Comfy walking shoes"];
  if (isRainy) packingList.push("Compact umbrella", "Waterproof footwear");
  if (isSunny || isHot) packingList.push("Polarized sunglasses", "Broad-spectrum sunscreen", "Lightweight hat");
  if (isCold) packingList.push("Thermal layer", "Scarf / gloves");

  const precautions = [];
  if (isRainy) precautions.push("Carry an umbrella and watch out for slick sidewalks.");
  if (isSunny) precautions.push("UV levels are elevated; apply SPF 30+ sunscreen.");
  if (isHot) precautions.push("Stay hydrated and avoid prolonged direct sun exposure during peak hours.");
  if (isWindy) precautions.push("Strong winds expected; secure outdoor belongings.");
  if (precautions.length === 0) precautions.push("No severe weather concerns. Enjoy your days!");

  let activityPlanner = "";
  if (customActivity) {
    activityPlanner = `Regarding your plan: "${customActivity}". Based on the forecast, temperatures are generally moderate. ${isRainy ? "However, since precipitation is expected, we advise preparing an indoor alternative just in case." : "The skies look dry, making it fully suitable to execute your plan. Have fun!"}`;
  } else {
    activityPlanner = `For the weekend, Saturday looks like a great day to head outdoors for sightseeing or a park visit. If Sunday brings any clouds or drizzle, it's the perfect occasion to enjoy a warm cafe or visit a local museum.`;
  }

  return {
    summary,
    clothingAdvice,
    activities,
    packingList,
    precautions,
    activityPlanner
  };
}

// 4. Vite Dev Server & Static Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
