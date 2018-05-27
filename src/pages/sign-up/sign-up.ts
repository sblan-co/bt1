import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage {
  user = {};
  constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public alertCtrl : AlertController, private geolocation: Geolocation) {
  }

  async logForm() {
    let location = await this.get_location();
    console.log('Create Account..' + JSON.stringify(this.user));

    if (this.user['pass1'] === this.user['pass2']) {
      let firstName: string = this.user['firstname'];
      let surname: string = this.user['surname'];
      let email: string = this.user['email'];
      let password: string = this.user['pass1'];
      let lat = location['lat'];
      let lon = location['lon'];
      let city = location['city'];

      localStorage.setItem('email', email);
      localStorage.setItem('password', password);

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
                'surname': surname,
                'city':city,
                'lat':lat,
                'lon':lon
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

  get_location(){
    return new Promise<any>(resolve => {
      
      let location = {};
      let lat;
      let lon;
      let city = null;
    //Code Location, Lat, Lon, City, Country
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
          lat= position.coords.latitude;
          lon= position.coords.longitude;

         let latlng = new google.maps.LatLng(lat, lon);

               new google.maps.Geocoder().geocode({'latLng' : latlng}, function(results, status) {
                   if (status == google.maps.GeocoderStatus.OK) {
                       if (results[1]) {
                           var country = null, countryCode = null, cityAlt = null;
                           var c, lc, component;
                           for (var r = 0, rl = results.length; r < rl; r += 1) {
                               var result = results[r];

                               if (!city && result.types[0] === 'locality') {
                                   for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
                                       component = result.address_components[c];

                                       if (component.types[0] === 'locality') {
                                           city = component.long_name;
                                           break;
                                       }
                                   }
                               }
                               else if (!city && !cityAlt && result.types[0] === 'administrative_area_level_1') {
                                   for (c = 0, lc = result.address_components.length; c < lc; c += 1) {
                                       component = result.address_components[c];

                                       if (component.types[0] === 'administrative_area_level_1') {
                                           cityAlt = component.long_name;
                                           break;
                                       }
                                   }
                               } else if (!country && result.types[0] === 'country') {
                                   country = result.address_components[0].long_name;
                                   countryCode = result.address_components[0].short_name;
                               }

                               if (city && country) {
                                   break;
                               }
                           }        
                           
                          location['lat'] = lat;
                          location['lon'] = lon;
                          location['city'] = city;
                          resolve(location);
                         }
                   }
               });
     });
   }
  });
  }
}
