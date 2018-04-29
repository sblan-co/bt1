// Angular
import { Component } from '@angular/core';

// Ionic-Angular
import { NavController, Platform, AlertController } from 'ionic-angular';

// Ionic
import { StatusBar } from '@ionic-native/status-bar';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';

// Project Pages
import { SignUpPage } from '../sign-up/sign-up';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private plt: Platform;
  private statusBar: StatusBar;
  
  constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public alertCtrl : AlertController) {
    // this.plt.ready().then ((readySource) =>{
    //   this.statusBar.styleLightContent();
    // });
  }

  signUp()
  {
    this.navCtrl.push(SignUpPage);
  }

  emailLogin(email, password)
  {
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
  
}
