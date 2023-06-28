import { Injectable } from '@angular/core';
import { Feature, PlacesResponse } from '../interfaces/places';
import { PlacesApiClient } from '../api';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  public useLocation?: [number, number];
  public isLoadingPlaces: boolean = false;
  public places: Feature[] = [];

  get isUserLocationReady(): boolean {
    return !!this.useLocation;
  }
  constructor(
    private placesApi: PlacesApiClient,
    private mapService: MapService
  ) {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.useLocation = [coords.latitude, coords.longitude];
          resolve(this.useLocation);
        },
        (error) => {
          alert('No se puede obtener la geolocalizacion');
          console.log(error);
          reject();
        }
      );
    });
  }

  getPlaceByQuery(query: string = '') {
    //EVALUAMOS SI EL QUERY ES NULO
    if (query.length == 0) {
      this.isLoadingPlaces = false;
      this.places = [];
      return;
    }
    //EVALUAMOS EL QUERY
    if (!this.useLocation) throw Error('No hay userLocation');
    this.isLoadingPlaces = true;
    this.placesApi
      .get<PlacesResponse>(`/${query}.json`, {
        params: {
          proximity: this.useLocation.join(',')
        },
      })
      .subscribe((resp) => {
        this.isLoadingPlaces = false;
        this.places = resp.features;

        this.mapService.createMarkerFromPlaces(this.places, this.useLocation!);
      });
  }

  deletePalce(){
    this.places= [];
  }
}
