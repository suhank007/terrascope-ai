import type { AirQualityResponse } from "../types";

interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    us_aqi: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    carbon_monoxide: number;
  };
}

export function normalizeAirQuality(raw: OpenMeteoAirQualityResponse): AirQualityResponse {
  const { current } = raw;
  return {
    current: {
      latitude: raw.latitude,
      longitude: raw.longitude,
      observedAt: current.time,
      usAqi: current.us_aqi,
      pm2_5: current.pm2_5,
      pm10: current.pm10,
      ozone: current.ozone,
      nitrogenDioxide: current.nitrogen_dioxide,
      sulphurDioxide: current.sulphur_dioxide,
      carbonMonoxide: current.carbon_monoxide,
    },
  };
}
