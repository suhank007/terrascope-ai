export interface AirQualitySnapshot {
  latitude: number;
  longitude: number;
  observedAt: string;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  carbonMonoxide: number;
}

export interface AirQualityResponse {
  current: AirQualitySnapshot;
}
