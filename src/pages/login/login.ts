// Angular
import { Component } from '@angular/core';

// Ionic-Angular
import { NavController, Platform, AlertController } from 'ionic-angular';

// Ionic
import { StatusBar } from '@ionic-native/status-bar';
import { Facebook } from '@ionic-native/facebook';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

// Project Pages
import { SignUpPage } from '../sign-up/sign-up';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private plt: Platform;
  private statusBar: StatusBar;

  constructor(
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    public alertCtrl: AlertController,
    public fb: Facebook) {
  }

  signUp() {
    this.navCtrl.push(SignUpPage);
  }

  emailLogin(email, password) {

    try{
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
        res => {
          this.navCtrl.push(TabsPage);
        }
      ).catch(
        error => {
          this.infoAlert("Error", "Email o Contraseña incorrectos");
        });
    }catch(error){
      this.infoAlert("Error","Introduzca un Email y Contraseña.")
    }
  }

  infoAlert(t,m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: t,
        message: m,
        buttons: [
          {
            text: 'Ok',
            role: 'alert',
          }
        ]
      });
      alert.present();
    }
    catch (e) {
    }
  }

  //FutureCode
  fbLogin(): Promise<any> {
    return this.fb.login(['public_profile', 'user_birthday', 'email']).then(
      async (res) => {
        const firecreds = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        const FBProfile = await this.fb.api('me?fields=email,first_name,last_name,user_birthday', []);

        let firstName: string = FBProfile['first_name'];
        let surname: string = FBProfile['last_name'];
        let email: string = FBProfile['email'];
        let userBirthday: string = FBProfile['user_birthday'];

        try {
          const success = await firebase.auth().signInWithCredential(firecreds).then(
            user => {
              let userRef = firebase.database().ref('/users/' + user.uid);

              userRef.update({
                'email': email,
                'created': firebase.database.ServerValue.TIMESTAMP,
                'firstname': firstName,
                'surname': surname,
                'user_birthday': userBirthday
              });
            }
          )
          //this.navCtrl.push(TabsPage);
        } catch (error) {
        }
      }
    ).catch(
      error => {
      }
    );
  }
}
