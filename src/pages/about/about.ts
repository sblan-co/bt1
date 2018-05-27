import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  book = {};
  photos: any;
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
    public afStrg: AngularFireStorage) {
    // this.tabBarElement = document.querySelector('.tabbar.show-tabbar'); //cojo el tab del html
      this.photos = [];
  }

  // ionViewWillEnter() {//tab invisible
  //   this.tabBarElement.style.display = 'none';
  // }

  uploadBook() {
    this.title = this.book['title'];
    this.author = this.book['author'];
    this.editorial = this.book['editorial'];
    this.comment = this.book['comment'];


    if (this.photos.length > 0 && this.checkValue(this.title) && this.checkValue(this.author)) {

      // CHECK IF BOOK IS ALREADY IN THE DATABASE
      firebase.database().ref('books').once('value').then(
        booksSnap => {
          // this.presentAlert('', JSON.stringify(booksSnap));
          let bookExist = false;

          let i = 0;
          let bookKeys = Object.keys(booksSnap.val());

          while (!bookExist && i < bookKeys.length) {
            let bookAux = booksSnap.val()[bookKeys[i]];
            bookExist = (bookAux.title.toUpperCase() == this.title.toUpperCase());
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

            let bookId = ref.push({
              'author': this.author,
              'title': this.title
            }).key;

            // Adds book to examplers

            this.addExampler(bookId);
          }
        }
      );

    }
  }

  AddImages_Storage(bookId){
    for(var i=0;i<this.photos.length;i++){
      const pictures = firebase.storage().ref('pictures/'+bookId+'/'+this.afAuth.auth.currentUser.uid+'/'+i);
      pictures.putString(this.photos[i], 'data_url');
    }
  }

  async addExampler(bookId) {

    // Adds exampler to database

    let ref = firebase.database().ref('examplers');
    
    // Adds Images to storage
    await this.AddImages_Storage(bookId);

    let examplerKey = ref.push({
      'book_id': bookId,
      'comment': this.comment,
      'editorial': this.editorial,
      'owner_id': this.afAuth.auth.currentUser.uid,
      'URLPhotos': this.photos
    }).key;



    /// ALERTAS
    this.presentAlert('LENGTH    ', this.photos.length);

    for (let j = 0; j < this.photos.length; j++) {

      let strgRef = firebase.storage().ref('/examplers').child(examplerKey + '/' + j + '.jpg');
      this.presentAlert('ref', strgRef);

      //const task = this.storage.upload(filePath, file);
      // console.log('Uploaded to '+JSON.stringify(task.downloadURL()) );

      let task = JSON.stringify(strgRef.put(this.photos[j].base64).then(
        uploadSnap => {
          this.presentAlert('', 'STRG ' + JSON.stringify(uploadSnap.ref.getDownloadURL()));
          let refPic = uploadSnap.ref.getDownloadURL();
          this.presentAlert('', 'GETS DOWNLOAD URL' + refPic);
          firebase.database().ref('examplers/' + examplerKey).child('pics').child('' + refPic).set(refPic);
        }
      ).catch(
        error => {
          this.presentAlert('ERROR', error);
        }
      ));

      // this.presentAlert('', JSON.stringify((firebase.storage().ref('examplers').child(examplerKey + '/' + j + '.jpg').put(this.photos[j]).then(
      //   uploadSnap => {
      //     this.presentAlert('', 'STRG ' + JSON.stringify(uploadSnap));
      //     let refPic = uploadSnap.downloadURL;
      //     this.presentAlert('','GETS DOWNLOAD URL' + refPic);
      //     firebase.database().ref('examplers/' + examplerKey).child('pics').child(refPic).set(refPic);          
      //   }
      // ) ).catch(
      //   error => {
      //     this.presentAlert('', error);
      //   }
      // )));
    }

    this.presentAlert('', 'no buclesito');

    // Adds exampler id to user books

    firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      snap => {
        if (snap.hasChild('books')) {
          // If it already has one or more books saved, it directly saves the new exampler id

          firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + 'books')
            .child(examplerKey).set(examplerKey);
        }
        else {
          // If it is user's first uploaded book it creates the books collection

          firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).child('books')
            .child(examplerKey).set(examplerKey);
        }
      }
    );
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
            this.photos.push(this.path);
            this.photos.reverse();
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

  takeMeBack() {//volver a atras boton
    this.navCtrl.parent.select(0);
  }

  // PICTURES MANAGEMENT

  async takePhoto() {
    if (this.photos.length == 3) {
      this.MaxPhotosAlert();
    } else {
      try{
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
      }catch (e){
        console.log(e);
      }
  }
}

  choosePicture() {
    if (this.photos.length == 3) {
      this.MaxPhotosAlert();
    } else {
      let option = {
        title: 'Select Picture',
        message: 'Select Least I Picture',
        maximumImagesCount: 1,
        outType: 0
      };

      // Por qué un for si solo deja coger una foto?
      this.picker.getPictures(option).then(results => {
        this.presentAlert('dffs', JSON.stringify(results));
        for (var i = 0; i < results.length; i++) {
          this.path = results[i];
          this.EditAlert()
          //alert("Gallery Path: " + results[i]);
        }
      }, err => {
        //alert("Error " + err);
      })
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
      this.photos.push(this.path);
      this.photos.reverse();
      this.icons.splice(0, 1);
    }, err => {
      this.photos.push(this.path);
      this.photos.reverse();
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
            this.icons.push("" + index);
          }
        }
      ]
    });
    alert.present();
  }

}

