import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  lat: any;
  lon: any;
  constructor(public navCtrl: NavController,
  public alertCtrl: AlertController,
  private geolocation: Geolocation) {
    
  }
  
}
