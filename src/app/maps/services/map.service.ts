import { Injectable } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { Feature } from '../interfaces/places';
import { DirectionsApiClient } from '../api';
import { DirectionsResponces, Route } from '../interfaces/directions';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private map?: Map;
  private markers: Marker[] = [];

  get isMapReady() {
    return !!this.map;
  }

  constructor(private directionApi: DirectionsApiClient) {}

  //ESTABLECER EL MAPA
  setMap(map: Map) {
    this.map = map;
  }

  //MOVER EL MAPA A CUALQUIER LUGAR, DESDE NUESTRO SERVICIO
  flyTo(coords: LngLatLike) {
    if (!this.isMapReady) throw Error('El map no esta inicializado');

    this.map?.flyTo({
      zoom: 16,
      center: coords,
    });
  }

  ///CREA EL MARCADOR DE UN LUGAR
  createMarkerFromPlaces(places: Feature[], userLocation: [number, number]) {
    if (!this.map) throw Error('Mapa no inicializado');

    this.markers.forEach((marker) => marker.remove());
    const newMarkers = [];

    for (const place of places) {
      const [lng, lat] = place.center;
      const popup = new Popup().setHTML(
        `
        <h6>${place.text}</h6>
        <span>${place.place_name}</span>
        `
      );

      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);

      newMarkers.push(newMarker);
    }

    this.markers = newMarkers;

    if (places.length == 0) return;
    //LIMITES DEL MAPAS
    const bounds = new LngLatBounds();
    newMarkers.forEach((marker) => bounds.extend(marker.getLngLat()));
    bounds.extend(userLocation);
    this.map.fitBounds(bounds, {
      padding: 200,
    });
  }

  getRouteBetweenPoints(start: [number, number], end: [number, number]) {
    this.directionApi
      .get<DirectionsResponces>(`/${start.join(',')};${end.join(',')}`)
      .subscribe((resp) => this.drawPolyline(resp.routes[0]));
  }

  private drawPolyline(route: Route) {
    console.log({ kms: route.distance /1000, duration: route.duration / 60 });

    if (!this.map) throw Error('Mapa no encontrado');

    const corrds = route.geometry.coordinates;

    const bounds = new LngLatBounds();
    corrds.forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });

    this.map?.fitBounds(bounds, {
      padding: 200,
    });

    //marca la rutas
    const sourceData: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: corrds
            }
          }
        ]
      }
    }

    //REMOVER RUTA PREVIA-MARCADA
    if (this.map.getLayer('RouteString')) {
      this.map.removeLayer('RouteString');
      this.map.removeSource('RouteString');
    }
    this.map.addSource('RouteString', sourceData);

    this.map.addLayer({
      id: 'RouteString',
      type:'line',
      source: 'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': 'black',
        'line-width': 3
      }
    })
  }
}
