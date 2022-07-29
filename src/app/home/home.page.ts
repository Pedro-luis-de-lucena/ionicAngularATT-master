import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: google.maps.Map;
  minhaPosicao: google.maps.LatLng;
  listaEnderecos: any = [];
  searchValue = "";
  private autoComplete = new google.maps.places.AutocompleteService();
  private direction = new google.maps.DirectionsService();
  private directionsRender = new google.maps.DirectionsRenderer();

  @ViewChild("map", { read: ElementRef, static: false}) mapRef: ElementRef;

  constructor(private geolocation: Geolocation, private ngZone: NgZone, private menu:MenuController, private parent:AppComponent) { }

  ionViewWillEnter() {
    this.exibirmapa();
  }

  exibirmapa(){
    const posicao = new google.maps.LatLng(-8.055154044530049, -34.95205892337579);
    const opcoes = {
      center: posicao,
      zoom: 14,
      desableDefalutUI: true
      };
      this.map = new google.maps.Map(this.mapRef.nativeElement, opcoes);

      this.buscarposicao();
    }

   buscarposicao() {
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude

      this.minhaPosicao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

      this.irparaMinhaposicao();

    }).catch((error) => {
       console.log('Error getting location', error);
     });
   }

   irparaMinhaposicao() {
     this.map.setCenter(this.minhaPosicao);
     this.map.setZoom(15);

     const marker = new google.maps.Marker({
      position: this.minhaPosicao,
      title: 'minha posicao',
      animation: google.maps.Animation.BOUNCE,
      map: this.map
    });
  }
  buscarEndereco(eventoCampoBusca: any){
    const busca = eventoCampoBusca.target.value as string;

    if(!busca.trim().length) { this.listaEnderecos = []; return false; }

    this.autoComplete.getPlacePredictions({ input: busca }, (arrayLocais, status)=>{

      if(status == "OK") {
      this.ngZone.run(() => {
        this.listaEnderecos = arrayLocais;
      });
      } else {
        this.listaEnderecos = [];
      }
    });
  }
  public tracarRota(local: google.maps.places.AutocompletePrediction) {
    this.listaEnderecos = [];
    this.searchValue = local.description;
    console.log(this.searchValue)
    new google.maps.Geocoder().geocode({address: local.description}, resultado =>{
      //this.map.setCenter(resultado[0].geometry.location);
      //this.map.setZoom(19)

      const marker = new google.maps.Marker({
        position: resultado[0].geometry.location,
        title: resultado[0].formatted_address,
        animation: google.maps.Animation.DROP,
        map: this.map
    });
    const rota: google.maps.DirectionsRequest= {
      origin: this.minhaPosicao,
      destination: resultado[0].geometry.location,
      unitSystem: google.maps.UnitSystem.METRIC,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.direction.route(rota, (result, status) => {
      if(status == "OK"){
        this.directionsRender.setMap(this.map);
        this.directionsRender.setDirections(result);
        this.directionsRender.setOptions({suppressMarkers: true});
      }
    });
  });
  }
  toggleMenu(){
    this.menu.toggle();
  }
  favLocation(){
    if( this.parent.favList.some(item => item === this.searchValue)){
      alert("enderaco ja salvo!")
    }
    else{
      this.parent.favList.push(this.searchValue)
    }
  }
}
