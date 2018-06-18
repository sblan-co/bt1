// Angular
import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

// Project
import { LoginPage } from '../login/login';
import { PasswordPage } from '../password/password';

@Component({
  selector: 'page-more-options',
    template: `
      <ion-list>
        <button ion-item (click)="signOut()">Cerrar Sesión</button>
        <button ion-item (click)="changePassword()">Cambiar Contraseña</button>
      </ion-list>
    `
  })
  export class MoreOptionsPage {
    constructor(public viewCtrl: ViewController, public navCtrl: NavController, private afAuth: AngularFireAuth) {}
  
    signOut(){
      this.afAuth.auth.signOut();
      localStorage.clear();
      this.navCtrl.setRoot(LoginPage);
    }

    changePassword(){
      this.viewCtrl.dismiss();
      this.navCtrl.setRoot(PasswordPage);
    }
  }