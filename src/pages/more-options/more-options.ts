// Angular
import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController } from 'ionic-angular';

// Project
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-more-options',
    template: `
      <ion-list>
        <button ion-item (click)="signOut()">Cerrar Sesión</button>
      </ion-list>
    `
  })
  export class MoreOptionsPage {
    constructor(public navCtrl: NavController, private afAuth: AngularFireAuth) {}
  
    signOut()
    {
      console.log("Cierra sesión");
      this.afAuth.auth.signOut();
      this.navCtrl.push(LoginPage);
    }
  }