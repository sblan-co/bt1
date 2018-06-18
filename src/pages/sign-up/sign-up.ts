import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage implements OnInit{
  picSelected: boolean;
  profilePic: any;
  path: any;
  user = {};
  location: any;

  constructor(
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    public alertCtrl: AlertController,
    private geolocation: Geolocation) {
    this.picSelected = false;
  }
  
  async ngOnInit(){
    this.location = await this.get_location_mobile();
  }

  async logForm() {
    if (this.user['pass1'] === this.user['pass2']) {
      let firstName: string = this.user['firstname'];
      let surname: string = this.user['surname'];
      let email: string = this.user['email'];
      let phone: string = this.user['phone'];
      let password: string = this.user['pass1'];

      localStorage.setItem('email', email);
      localStorage.setItem('password', password);

      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
        () => {
          firebase.auth().onAuthStateChanged(async user => {
            if (user) {

              let userRef = firebase.database().ref('/users/' + user.uid);

              localStorage.setItem('uid', user.uid);

              userRef.update({
                'email': email,
                'created': firebase.database.ServerValue.TIMESTAMP,
                'firstname': firstName,
                'surname': surname,
                'phone':phone
              });

              if (this.picSelected) {
                this.presentAlert('', 'pic selected');
                var picture_url = await this.AddImagesStorage(user.uid);
                firebase.database().ref('/users/' + user.uid).child('profilePic').set(picture_url);
              }

              try{
                firebase.database().ref('/users/' + user.uid).child('city').set(this.location['city']);
                firebase.database().ref('/users/' + user.uid).child('lat').set(this.location['lat']);
                firebase.database().ref('/users/' + user.uid).child('lon').set(this.location['lon']);
              }catch(error){}

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
          sub = "Email incorrecto, intenta de nuevo.";
        }
        else if (error.errorCode == "auth/email-already-in-use") {
          sub = "Ese email ya está registrado. ¡Prueba a iniciar sesión!";
        }
        else if (error.errorCode == "auth/weak-password") {
          sub = "La contraseña debe contener al menos 6 caracteres.";
        }
        else {
          sub = "¡Ups! Lo sentimos, ha ocurrido algún error, prueba de nuevo.";
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

  async AddImagesStorage(uid) {
    try {
      const pictures = await firebase.storage().ref('users/' + uid + '/profile/' + this.profilePic.name);
      await pictures.put(this.profilePic);
      return await pictures.getDownloadURL().then(
        async (snapshot) => {
          return await snapshot;
        }
      );
    }
    catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  get_location_mobile(){
    return new Promise<any>(resolve => {
      let location = {};
      let lat;
      let lon;
      let city = null;
      this.geolocation.getCurrentPosition().then((resp)=> {
        lat = resp.coords.latitude;
        lon = resp.coords.longitude;

        let latlng = new google.maps.LatLng(lat, lon);

        new google.maps.Geocoder().geocode({ 'latLng': latlng }, function (results, status) {
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
      }).catch((error) => {
      });
    });
  }

  get_location() {
    return new Promise<any>(resolve => {
      let location = {};
      let lat;
      let lon;
      let city = null;
      //Code Location, Lat, Lon, City, Country
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          lat = position.coords.latitude;
          lon = position.coords.longitude;

          let latlng = new google.maps.LatLng(lat, lon);

          new google.maps.Geocoder().geocode({ 'latLng': latlng }, function (results, status) {
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

  presentAlert(t, m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: t,
        message: m,
        buttons: [
          {
            text: 'No',
            role: 'alert',
          },
          {
            text: 'Yes',
            role: 'confirm',
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/whiteperson.png?alt=media&token=42d21c7e-6f14-473e-b361-81a901bb172f';
  }

  changeListener($event): void {
    this.profilePic = $event.target.files[0];
    this.picSelected = true;

    var reader = new FileReader();
    reader.onload = e => {
      this.path = reader.result;
    };
    reader.readAsDataURL($event.target.files[0]);
  }

  deletePhoto() {
    let alert = this.alertCtrl.create({
      title: 'Eliminar la imagen',
      message: '¿Quieres eliminar la imagen?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelar clicado');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Aceptar clicado');
            this.path = '';
            this.profilePic = null;
            this.picSelected = false;
          }
        }
      ]
    });
    alert.present();
  }
}
