export interface WildfireHotspot {
  id: string;
  latitude: number;
  longitude: number;
  brightnessK: number;
  frp: number;
  confidence: "low" | "nominal" | "high";
  acquiredAt: string;
  satellite: string;
}

export interface WildfiresResponse {
  generatedAt: string;
  count: number;
  configured: boolean;
  hotspots: WildfireHotspot[];
}
