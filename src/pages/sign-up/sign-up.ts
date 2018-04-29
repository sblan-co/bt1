import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  user = {};

  constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public alertCtrl : AlertController) {
  }

  logForm() {
    console.log('Create Account..' + JSON.stringify(this.user));

    if (this.user['pass1'] === this.user['pass2']) {
      let firstName: string = this.user['firstname'];
      let surname: string = this.user['surname'];
      let email: string = this.user['email'];
      let password: string = this.user['pass1'];

      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
      console.log(password);

      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
        user => {
          firebase.auth().onAuthStateChanged(user => {
            if (user) {

              let userRef = firebase.database().ref('/users/' + user.uid);

              localStorage.setItem('uid', user.uid);

              userRef.update({
                'email': email,
                'created': firebase.database.ServerValue.TIMESTAMP,
                'firstname': firstName,
                'surname': surname
              });
      
              //this.navCtrl.push(TabsPage);
            } else {
              // No user is signed in.
            }
          })
        }
      ).catch(error => {

        console.log('ERROR: ' + JSON.stringify(error));
        var sub;
        if (error.errorCode === "auth/invalid-email") {
          sub = "Incorrect email address! Please try again!";
          sub = "Email incorrecto, intenta de nuevo.";
        }
        else if (error.errorCode == "auth/email-already-in-use") {
          sub = "Ese email ya está registrado. ¡Prueba a iniciar sesión!";
        }
        else if (error.errorCode == "auth/weak-password") {
          sub = "La contraseña debe contener al menos 6 caracteres.";
        }
        else {

        }

        let alert = this.alertCtrl.create({
          title: 'Oops! ',
          subTitle: '' + sub,
          buttons: ['Cerrar']
        });

        alert.present();
      });

    }
    else {
      let alert = this.alertCtrl.create({
      title: 'Oops! ',
      subTitle: "La contraseña no coincide.",
      buttons: ['Cerrar']
    });

    alert.present();
    }
  }
}
