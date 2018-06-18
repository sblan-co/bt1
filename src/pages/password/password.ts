import { Component } from '@angular/core';
import { ContactPage } from '../contact/contact';
import { AngularFireAuth } from 'angularfire2/auth';
import { NavController, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { ViewController } from 'ionic-angular';
import { EmailAuthProvider } from '@firebase/auth-types';

@Component({
  selector: 'page-password',
  templateUrl: 'password.html'
})
export class PasswordPage {
  tabBarElement: any;
  user: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth) {
    this.user = {};
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//cojo el tab del html
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
      try {
        this.afAuth.auth.signInWithEmailAndPassword(user.email, password_current).then(
          res => {
            user.updatePassword(password_new).then(
              async() => {
              this.infoAlert("Se ha cambiado la contraseña.");
            }).catch((error) => {
              console.log(error);
              this.errorAlert("Error, La contraseña actual no coincide.")
            });
          }
        ).catch(error => {
          this.errorAlert('Error, la contraseña actual no coincide.')
        });
      } catch (error) {
        this.errorAlert("Error, La contraseña actual no es correcta.")
      }
    } else {
      this.errorAlert("Las contraseñas no coinciden.")
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