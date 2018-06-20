import { Component, ViewChild } from '@angular/core';
import { AlertController, NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';

import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(NavController) navCtrl: NavController;
  // rootPage:any = LoginPage;
  rootPage: any;

  constructor(
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public afAuth: AngularFireAuth,
    public alertCtrl: AlertController) {
      
      platform.registerBackButtonAction(() => {
        this.ExitAlert();
      }, 2);

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      localStorage.removeItem('selectedPublication');

      this.afAuth.authState.subscribe(
        auth => {
          if (auth == null) {
            this.rootPage = LoginPage;
          }
          else {
            this.rootPage = TabsPage;
          }
        });
    });
  }

  ExitAlert() {
    let alert = this.alertCtrl.create({
      title: 'Salir de la app',
      message: '¿Quieres salir de la app?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    alert.present();
  }
}

