import { Component } from '@angular/core';
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
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//TabBar
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
          }
        ]
      });
      alert.present();
    }
    catch (e) {
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
    }
  }


  async changePassword() {
    if (this.user['password_new'] === this.user['password_new2']) {
      let password_current: string = this.user['password_current'];
      let password_new: string = this.user['password_new'];

      var user = firebase.auth().currentUser;
      this.afAuth.auth.signInWithEmailAndPassword(user.email, password_current).then(
        res => {
          user.updatePassword(password_new).then(
            async () => {
              this.infoAlert("Se ha cambiado la contraseña.");
            }).catch((error) => {
              this.errorAlert("Error, La contraseña actual no coincide.")
            });
        }
      ).catch(
        error => {
          this.errorAlert('Error, la contraseña actual no coincide.')
        });

    } else {
      this.errorAlert("La nueva contraseña no coincide con la repetida.")
    }
  }

  ionViewWillEnter() {//tab invisible
    this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {//tab visible
    this.tabBarElement.style.display = 'flex';
  }

  takeMeBack() {//BackButton
    this.navCtrl.pop();
  }

}