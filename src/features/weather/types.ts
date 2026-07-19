export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  observedAt: string;
  timezone: string;
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  windSpeedKph: number;
  windDirectionDeg: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherResponse {
  current: WeatherSnapshot;
}

export interface WeatherCity {
  id: string;
  name: string;
  countryCode: string;
  lat: number;
  lon: number;
}
