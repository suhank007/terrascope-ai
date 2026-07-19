import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from "lucide-react";

interface WeatherCodeInfo {
  label: string;
  icon: LucideIcon;
}

const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: "Clear sky", icon: Sun },
  1: { label: "Mainly clear", icon: Sun },
  2: { label: "Partly cloudy", icon: CloudSun },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Fog", icon: CloudFog },
  48: { label: "Depositing rime fog", icon: CloudFog },
  51: { label: "Light drizzle", icon: CloudDrizzle },
  53: { label: "Moderate drizzle", icon: CloudDrizzle },
  55: { label: "Dense drizzle", icon: CloudDrizzle },
  56: { label: "Freezing drizzle", icon: CloudDrizzle },
  57: { label: "Freezing drizzle", icon: CloudDrizzle },
  61: { label: "Slight rain", icon: CloudRain },
  63: { label: "Moderate rain", icon: CloudRain },
  65: { label: "Heavy rain", icon: CloudRain },
  66: { label: "Freezing rain", icon: CloudRain },
  67: { label: "Freezing rain", icon: CloudRain },
  71: { label: "Slight snow", icon: CloudSnow },
  73: { label: "Moderate snow", icon: CloudSnow },
  75: { label: "Heavy snow", icon: CloudSnow },
  77: { label: "Snow grains", icon: CloudSnow },
  80: { label: "Slight rain showers", icon: CloudRain },
  81: { label: "Moderate rain showers", icon: CloudRain },
  82: { label: "Violent rain showers", icon: CloudRain },
  85: { label: "Slight snow showers", icon: CloudSnow },
  86: { label: "Heavy snow showers", icon: CloudSnow },
  95: { label: "Thunderstorm", icon: CloudLightning },
  96: { label: "Thunderstorm with hail", icon: CloudLightning },
  99: { label: "Thunderstorm with hail", icon: CloudLightning },
};

export function weatherCodeInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? { label: "Unknown", icon: Cloud };
}
