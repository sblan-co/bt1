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

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private plt: Platform;
  private statusBar: StatusBar;

  constructor(
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    public alertCtrl: AlertController,
    public fb: Facebook) {
    // this.plt.ready().then ((readySource) =>{
    //   this.statusBar.styleLightContent();
    // });
  }

  signUp() {
    this.navCtrl.push(SignUpPage);
  }

  emailLogin(email, password) {
    console.log(email);
    console.log(password);

    this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
      res => {
        console.log('ÉXITO.');
        // this.navCtrl.push(TabsPage);
      }
    ).catch(
      error => {
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: 'Email o contraseña no válidos.',
          buttons: [
            {
              text: 'Cerrar',
              role: 'cancel'
            }
          ]
        });
        alert.present();
      });
  }

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
          console.error(error);
        }
      }
    ).catch(
      error => {
        console.log(error);
      }
    );
  }
}
