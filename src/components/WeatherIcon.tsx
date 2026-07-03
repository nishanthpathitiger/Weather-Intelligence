import * as Lucide from "lucide-react";

interface WeatherIconProps {
  name: string;
  className?: string;
}

export default function WeatherIcon({ name, className = "w-6 h-6" }: WeatherIconProps) {
  const IconComponent = (Lucide as any)[name] || Lucide.HelpCircle;
  return <IconComponent className={className} />;
}
