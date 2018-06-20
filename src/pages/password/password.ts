import { Component } from '@angular/core';
import { ContactPage } from '../contact/contact';
import { AngularFireAuth } from 'angularfire2/auth';
import { NavController, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { ViewController } from 'ionic-angular';
import { EmailAuthProvider } from '@firebase/auth-types';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-password',
  templateUrl: 'password.html'
})
export class PasswordPage {
  tabBarElement: any;
  user: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    public platform: Platform) {
      this.user = {};
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//cojo el tab del html
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

  infoAlert(m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: '',
        message: m,
        buttons: [
          {
            text: 'Ok',
            role: 'confirm',
            // handler: () => {
            //   this.navCtrl.pop();
            // }
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
  }

  errorAlert(m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: 'Error',
        message: m,
        buttons: [
          {
            text: 'Ok',
            role: 'alert'
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
  }


  async changePassword() {
    if (this.user['password_new'] === this.user['password_new2']) {
      let password_current: string = this.user['password_current'];
      let password_new: string = this.user['password_new'];
      // let password_new2: string = this.user['password_new2'];

      var user = firebase.auth().currentUser;
      this.afAuth.auth.signInWithEmailAndPassword(user.email, password_current).then(
        res => {
          user.updatePassword(password_new).then(
            async () => {
              this.infoAlert("Se ha cambiado la contraseña.");
            }).catch((error) => {
              console.log(error);
              this.errorAlert("Error, La contraseña actual no coincide.")
            });
        }
      ).catch(
        error => {
          if (error.errorCode === "auth/invalid-email") {
            this.errorAlert("Email incorrecto, intenta de nuevo.");
          }
          else if (error.errorCode == "auth/user-disabled") {
            this.errorAlert("Usuario deshabilitado.");
          }
          else if (error.errorCode == "auth/user-not-found") {
            this.errorAlert("Usuario no encontrado.");
          }
          else if (error.errorCode == "auth/wrong-password") {
            this.errorAlert("Contraseña errónea.");
          }
          else {
            this.errorAlert("¡Ups! Lo sentimos, ha ocurrido algún error, prueba de nuevo.");
          }
          this.errorAlert('Error, la contraseña actual no coincide.')
        });

    } else {
      this.errorAlert("La nueva contraseña no coincide.")
    }
  }

  ionViewWillEnter() {//tab invisible
    this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {//tab visible al abandonar
    console.log('hola');
    this.tabBarElement.style.display = 'flex';
  }

  takeMeBack() {//volver a atras boton
    // this.viewCtrl.dismiss();
    this.navCtrl.pop();
  }

}