import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { Crop } from '@ionic-native/crop';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';
import { convertUrlToDehydratedSegments } from 'ionic-angular/navigation/url-serializer';
import { Geolocation } from '@ionic-native/geolocation';
import { HomePage } from '../home/home';

declare var google: any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage implements OnInit{
  book = {};
  photos: any;
  photosURLS: any;
  icons: string[] = ["1", "2", "3"];
  path: string;
  title: string;
  author: string;
  editorial: string;
  comment: string;
  location: any;

  // tabBarElement: any; //tab variable que desapareceré

  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    private alertCtrl: AlertController,
    public crop: Crop,
    public afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public afStrg: AngularFireStorage,
    private geolocation: Geolocation) {
    // this.tabBarElement = document.querySelector('.tabbar.show-tabbar'); //cojo el tab del html
    this.photos = [];
    this.photosURLS = [];
  }

  async ngOnInit(){
    try{
      this.location = await this.get_location();
    }catch(error){
    }
  }

  // ionViewWillEnter() {//tab invisible
  //   this.tabBarElement.style.display = 'none';
  // }


  // Saves book data in firebase database
  async uploadBook() {
    this.title = this.book['title'];
    this.author = this.book['author'];
    this.editorial = this.book['editorial'] ? this.book['editorial'] : '';
    this.comment = this.book['comment'] ? this.book['comment'] : '';

    if (this.photos.length <= 0) {
      this.errorAlert('Debes incluir al menos una foto.');
    }
    else if (!this.checkValue(this.title)) {
      this.errorAlert('Por favor, indica un título de libro.');
    }
    else if (!this.checkValue(this.author)) {
      this.errorAlert('Por favor, indica el autor del libro.');
    }
    else {
      this.uploadingToast();
      // CHECK IF BOOK IS ALREADY IN THE DATABASE
      firebase.database().ref('books').once('value').then(
        async booksSnap => {
          let bookExist = false;

          let i = 0;
          let bookKeys = Object.keys(booksSnap.val());

          while (!bookExist && i < bookKeys.length) {
            let bookAux = booksSnap.val()[bookKeys[i]];
            bookExist = await (bookAux.title.toUpperCase() == this.title.toUpperCase());
            i++;
          }

          if (bookExist) {

            // IF IT IS, WE ADD AN EXAMPLER WITH ITS ID

            this.addExampler(bookKeys[i - 1]);
          }
          else {

            // IF IT ISN'T, WE ADD THE BOOK TO THE DATABASE AND THEN TO THE EXAMPLERS

            // Adds book to database

            let ref = firebase.database().ref('books');

            var bookId = ref.push({
              'author': this.author,
              'title': this.title
            }).then(async result => {
              var bookId = await result.key;
              this.addExampler(bookId);
            });
          }
        });
        this.navCtrl.setRoot(AboutPage);
    }

  }

  async AddImagesStorage(bookId){
    var pics: string[] = [];

    for (var i = 0; i < this.photos.length; i++) {
      const pictures = await firebase.storage().ref('users/' + this.afAuth.auth.currentUser.uid + '/examplers/' + bookId + '/' + i);
      if (typeof (this.photos[i].name) == 'string') {
        await pictures.put(this.photos[i]);
      }
      else {
        await pictures.putString(this.photos[i], 'data_url');
      }

      await pictures.getDownloadURL().then(
        async (snapshot) => {
          pics.push(await snapshot);
        });
    }

    return pics;
  }

  async addExampler(bookId) {
    let picture_url;
    var examplerKey;
    let ref = firebase.database().ref('examplers');

    try {
      console.log('EDITORIAL' + this.editorial);

      // Adds exampler to database
      try {
        examplerKey = await ref.push({
          'book_id': bookId,
          'comment': this.comment,
          'editorial': this.editorial,
          'owner_id': this.afAuth.auth.currentUser.uid
        }).key;
      }
      catch(error){
        this.errorAlert('PUSH error:' + error);
      }

      // Uploads pics
      picture_url = await this.AddImagesStorage(examplerKey);

      // Saves pics urls on exampler
      firebase.database().ref('examplers/' + examplerKey).child('downloadURL').set(picture_url.toString());

      try{
        firebase.database().ref('examplers/' + examplerKey).child('lat').set(this.location['lat']);
        firebase.database().ref('examplers/' + examplerKey).child('lon').set(this.location['lon']);
        firebase.database().ref('examplers/' + examplerKey).child('city').set(this.location['city']);
      }catch (error){
      }
    }
    catch (error) {
      this.errorAlert('AL SUBIR FOTO ' + JSON.stringify(error));
    }

    // Adds exampler id to user books

    firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      snap => {
        if (snap.hasChild('books')) {
          // If it already has one or more books saved, it directly saves the new exampler id

          firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books')
            .child(examplerKey).set(examplerKey);
        }
        else {
          // If it is user's first uploaded book it creates the books collection

          firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).child('books')
            .child(examplerKey).set(examplerKey);
        }

        this.infoAlert('¡Libro publicado con éxito!');
      }
    ).catch(error => {
      this.errorAlert(error);
    });
  }

  //alert confirm
  EditAlert() {
    let alert = this.alertCtrl.create({
      title: 'Editar la imagen',
      message: '¿Quieres recortar la imagen?',
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
            this.cropPicture();
          }
        }
      ]
    });
    alert.present();
  }

  checkValue(str: string): boolean {
    return ((str !== '') && (str != null) && (str !== 'null') && (str !== 'undefined'));
  }

  MaxPhotosAlert() {
    let alert = this.alertCtrl.create({
      title: 'Máximo de Fotos',
      subTitle: 'Tienes ya el máximo permitido de imágenes, elimine alguna.',
      buttons: ['Ok']
    });
    alert.present();
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
            text: 'Si',
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

  // ionViewWillLeave() {//tab visible al abandonar
  //   this.tabBarElement.style.display = 'flex';
  // }

  // takeMeBack() {//volver a atras boton
  //   this.navCtrl.parent.select(0);
  // }

  // PICTURES MANAGEMENT

  async takePhoto() {
    if (this.photos.length == 3) {
      this.MaxPhotosAlert();
    } else {
      try {
        let options: CameraOptions = {
          quality: 100,
          targetHeight: 600,
          targetWidth: 600,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          correctOrientation: true
        }

        const result = await this.camera.getPicture(options);
        const image = `data:image/jpeg;base64,${result}`;
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.path = image;
        this.icons.splice(0, 1);

        this.EditAlert();
        this.photos.push(this.path);
        this.photosURLS.push(this.path);
        this.photos.reverse();
      } catch (e) {
        console.log(e);
      }
    }
  }


  async changeListener($event) {
    if (this.photos.length == 3) {
      this.MaxPhotosAlert();
    } else {
      this.path = await $event.target.files[0];
      this.photos.push(this.path);

      var reader = new FileReader();
      this.icons.splice(0, 1);
      reader.onload = e => {
        this.photosURLS.push(reader.result);
      };
      reader.readAsDataURL($event.target.files[0]);
    }
  }

  cropPicture() {
    let option = {
      quality: 100,
      targetHeight: 100,
      targetWidth: 100
    };

    this.crop.crop(this.path, option).then(newImgeUrl => {
      this.path = newImgeUrl;
    }, err => {
    });
  }

  deletePhotos(index) {
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
            this.photos.splice(index, 1);
            this.photosURLS.splice(index, 1);
            this.icons.push("" + index);
          }
        }
      ]
    });
    alert.present();
  }

  /////////////
  // ALERTS //
  ////////////

  infoAlert(m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: '',
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
            role: 'alert',
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
  }

  uploadingToast() {
    let toast = this.toastCtrl.create({
      message: 'Publicando libro..',
      duration: 7000,
      position: 'middle'
    });

    toast.present();
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
}

