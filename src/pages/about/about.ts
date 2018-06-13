import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';
import { convertUrlToDehydratedSegments } from 'ionic-angular/navigation/url-serializer';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  book = {};
  photos: any;
  photosURLS: any;
  icons: string[] = ["1", "2", "3"];
  path: string;
  title: string;
  author: string;
  editorial: string;
  comment: string;

  // tabBarElement: any; //tab variable que desapareceré

  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    private alertCtrl: AlertController,
    public picker: ImagePicker,
    public crop: Crop,
    public afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public afStrg: AngularFireStorage) {
    // this.tabBarElement = document.querySelector('.tabbar.show-tabbar'); //cojo el tab del html
    this.photos = [];
    this.photosURLS = [];
  }

  // ionViewWillEnter() {//tab invisible
  //   this.tabBarElement.style.display = 'none';
  // }


  // Saves book data in firebase database
  uploadBook() {
    this.title = this.book['title'];
    this.author = this.book['author'];
    this.editorial = this.book['editorial'];
    this.comment = this.book['comment'];

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
      // Adds exampler to database
      examplerKey = await ref.push({
        'book_id': bookId,
        'comment': this.comment,
        'editorial': this.editorial,
        'owner_id': this.afAuth.auth.currentUser.uid
      }).key;

      // Uploads pics
      picture_url = await this.AddImagesStorage(examplerKey);

      // Saves pics urls on exampler
      firebase.database().ref('examplers/' + examplerKey).child('downloadURL').set(picture_url.toString());

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
            this.icons.splice(0, 1);
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

        this.EditAlert();
        this.photos.push(this.path);
        this.photosURLS.push(this.path);
        this.photos.reverse();
      } catch (e) {
        console.log(e);
      }
    }
  }

  // choosePicture() {
  //   if (this.photos.length == 3) {
  //     this.MaxPhotosAlert();
  //   } else {
  //     let option = {
  //       title: 'Select Picture',
  //       message: 'Select Least I Picture',
  //       maximumImagesCount: 1,
  //       outType: 1
  //     };

  //     // Por qué un for si solo deja coger una foto?
  //     this.picker.getPictures(option).then(results => {
  //       for (var i = 0; i < results.length; i++) {
  //         this.path = `data:image/jpeg;base64,${results[i]}`;
  //         this.presentAlert('FOTO DE GALERIA', this.path);
  //         this.EditAlert()
  //         //alert("Gallery Path: " + results[i]);
  //       }
  //     }, err => {
  //       //alert("Error " + err);
  //     })
  //   }
  // }

  changeListener($event): void {
    if (this.photos.length == 3) {
      this.MaxPhotosAlert();
    } else {
      this.path = $event.target.files[0];
      this.photos.push(this.path);

      var reader = new FileReader();
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
      this.icons.splice(0, 1);
    }, err => {
      this.icons.splice(0, 1);
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
}

