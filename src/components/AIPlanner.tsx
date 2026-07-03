import React, { useState } from "react";
import { AIRecommendation } from "../types";
import WeatherIcon from "./WeatherIcon";

interface AIPlannerProps {
  city: string;
  recommendations: AIRecommendation | null;
  loading: boolean;
  onRefreshCustomActivity: (activity: string) => void;
}

export default function AIPlanner({
  city,
  recommendations,
  loading,
  onRefreshCustomActivity,
}: AIPlannerProps) {
  const [customPlan, setCustomPlan] = useState("");
  const [activeTab, setActiveTab] = useState<"gear" | "activities" | "safety">("gear");

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlan.trim()) return;
    onRefreshCustomActivity(customPlan);
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "High":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Poor":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case "High":
        return "CheckCircle2";
      case "Moderate":
        return "AlertCircle";
      case "Poor":
        return "XCircle";
      default:
        return "HelpCircle";
    }
  };

  // Fun, reassuring messages shown during recommendations generation
  const loadingMessages = [
    "Consulting Gemini intelligence models...",
    "Analyzing local weekly microclimates...",
    "Curating custom daily clothing advice...",
    "Formulating outdoor suitability ratings...",
    "Structuring personalized packing checklist...",
  ];

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Cycle loading messages when loading
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden">
      {/* Dynamic Background Ambiance */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-10 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
            Gemini weather intelligence
          </span>
          <h3 className="font-display font-extrabold text-xl text-white mt-2">
            AI Planner & Travel Advisor
          </h3>
          <p className="text-sm text-slate-400">
            Context-aware weather advice tailored specifically for you in {city}
          </p>
        </div>
        <WeatherIcon name="Sparkles" className="w-8 h-8 text-indigo-400 animate-pulse shrink-0" />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 text-center p-6">
          {/* Spinner */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute w-12 h-12 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <WeatherIcon name="BrainCircuit" className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-md font-semibold text-white">Generating AI Intelligence</p>
            <p className="text-xs text-slate-400 mt-1 animate-pulse font-mono">
              {loadingMessages[loadingMsgIdx]}
            </p>
          </div>
        </div>
      )}

      {recommendations ? (
        <div className="flex flex-col gap-6 z-10">
          {/* Friendly summary */}
          <div className="bg-slate-800/40 border border-slate-800 p-4.5 rounded-2xl flex gap-3 items-start">
            <div className="bg-indigo-500/15 p-2 rounded-xl text-indigo-400">
              <WeatherIcon name="MessageSquareText" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">AI Weekly Briefing</p>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                {recommendations.summary}
              </p>
            </div>
          </div>

          {/* User Custom Activity Input Field */}
          <form
            onSubmit={handleSubmitCustom}
            className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <WeatherIcon name="Activity" className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-semibold text-slate-300">
                Are you planning a specific event or activity?
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., Hiking Saturday morning, outdoor wedding, photography..."
                value={customPlan}
                onChange={(e) => setCustomPlan(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!customPlan.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <WeatherIcon name="Sparkles" className="w-3.5 h-3.5" />
                Analyze
              </button>
            </div>
            {/* If there's an custom response already loaded */}
            {recommendations.activityPlanner && (
              <div className="border-t border-slate-800 pt-3 mt-1">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Plan Analysis</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {recommendations.activityPlanner}
                </p>
              </div>
            )}
          </form>

          {/* Sub Tab Navigation */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("gear")}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "gear"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <WeatherIcon name="Shirt" className="w-4 h-4" />
              Apparel & Packing
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "activities"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <WeatherIcon name="Compass" className="w-4 h-4" />
              Outdoor Fitness
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "safety"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <WeatherIcon name="ShieldAlert" className="w-4 h-4" />
              Precautions
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="min-h-48">
            {/* Panel 1: Apparel & Packing */}
            {activeTab === "gear" && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Clothing advice */}
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Clothing advice</h4>
                  <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">
                    {recommendations.clothingAdvice}
                  </p>
                </div>

                {/* Packing List */}
                <div className="border-t border-slate-800/80 pt-4 mt-1">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
                    Recommended packing checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendations.packingList.map((item, index) => (
                      <div
                        key={index}
                        className="bg-slate-950/20 border border-slate-800 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                      >
                        <span className="w-4 h-4 rounded-md border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-[10px]">
                          ✓
                        </span>
                        <span className="text-xs text-slate-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: Activities & Suitability */}
            {activeTab === "activities" && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Outdoor activity suitability ratings
                </h4>
                <div className="flex flex-col gap-2.5">
                  {recommendations.activities.map((act, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/20 border border-slate-800/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 text-slate-500">
                          <WeatherIcon name="Calendar" className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{act.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{act.reason}</p>
                        </div>
                      </div>

                      {/* Suitability Badge */}
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 text-center flex items-center justify-center gap-1 ${getSuitabilityColor(
                          act.suitability
                        )}`}
                      >
                        <WeatherIcon name={getSuitabilityIcon(act.suitability)} className="w-3.5 h-3.5" />
                        {act.suitability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 3: Precautions & Safety */}
            {activeTab === "safety" && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Active precautions & safety tips
                </h4>
                <div className="flex flex-col gap-2.5">
                  {recommendations.precautions.map((warn, index) => (
                    <div
                      key={index}
                      className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex gap-3 items-start"
                    >
                      <div className="text-red-400 mt-0.5">
                        <WeatherIcon name="ShieldAlert" className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-red-100 font-medium leading-relaxed">
                        {warn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-center text-slate-500">
          <WeatherIcon name="Inbox" className="w-10 h-10 text-slate-700" />
          <p className="text-sm font-semibold">No recommendations yet</p>
          <p className="text-xs text-slate-600 max-w-sm px-4">
            Search for a city and click load to fetch weather insights and AI planning recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
