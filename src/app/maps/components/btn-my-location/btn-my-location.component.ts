import { Component } from '@angular/core';
import { MapService,PlacesService } from '../../services';

@Component({
  selector: 'app-btn-my-location',
  templateUrl: './btn-my-location.component.html',
  styleUrls: ['./btn-my-location.component.css']
})
export class BtnMyLocationComponent {

  constructor(
    private placesService: PlacesService,
    private mapService: MapService){}

  //REDIRECIONA ASU UBICACION CON EL BUTTON
  goToMyLocation(){
    if(!this.placesService.isUserLocationReady) throw Error('No hay hay ubicacion de usuario');
    if(!this.mapService.isMapReady) throw Error('No hay mapa disponible');
    
    this.mapService.flyTo(this.placesService.useLocation!);
    //console.log('Ir a mi ubicacion')
  }
}
