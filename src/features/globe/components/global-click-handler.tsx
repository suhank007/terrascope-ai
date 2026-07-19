"use client";

import { ScreenSpaceEvent, ScreenSpaceEventHandler, useCesium } from "resium";
import { Cartographic, Entity as CesiumEntity, Math as CesiumMath, ScreenSpaceEventType } from "cesium";
import { useGlobeUi } from "../context/globe-ui-context";

export function GlobalClickHandler() {
  const { viewer, scene } = useCesium();
  const { setSelectedEntity, earthquakesRef, flightsRef, citiesRef, airQualityCitiesRef, wildfiresRef } =
    useGlobeUi();

  return (
    <ScreenSpaceEventHandler>
      <ScreenSpaceEvent
        type={ScreenSpaceEventType.LEFT_CLICK}
        action={(event) => {
          if (!viewer || !scene || !("position" in event)) return;

          const picked = scene.pick(event.position);
          if (picked?.id instanceof CesiumEntity) {
            const entityId = picked.id.id;

            const quake = earthquakesRef.current.get(entityId);
            if (quake) {
              setSelectedEntity({ type: "earthquake", data: quake });
              return;
            }
            const flight = flightsRef.current.get(entityId);
            if (flight) {
              setSelectedEntity({ type: "flight", data: flight });
              return;
            }
            const fire = wildfiresRef.current.get(entityId);
            if (fire) {
              setSelectedEntity({ type: "wildfire", data: fire });
              return;
            }
            const city = citiesRef.current.get(entityId);
            if (city) {
              setSelectedEntity({ type: "weather-point", lat: city.lat, lon: city.lon, label: city.name });
              return;
            }
            const aqiCity = airQualityCitiesRef.current.get(entityId);
            if (aqiCity) {
              setSelectedEntity({
                type: "air-quality-point",
                lat: aqiCity.lat,
                lon: aqiCity.lon,
                label: aqiCity.name,
              });
              return;
            }
          }

          const cartesian = viewer.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
          if (cartesian) {
            const carto = Cartographic.fromCartesian(cartesian);
            setSelectedEntity({
              type: "weather-point",
              lat: CesiumMath.toDegrees(carto.latitude),
              lon: CesiumMath.toDegrees(carto.longitude),
            });
          }
        }}
      />
    </ScreenSpaceEventHandler>
  );
}
