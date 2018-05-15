import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  photos: any;
  icons: string[] = ["1","2","3"];
  path: string;
  tabBarElement: any; //tab variable que desapareceré
  
  constructor(public navCtrl: NavController, private camera: Camera, private alertCtrl: AlertController, public picker: ImagePicker, public crop: Crop) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//cojo el tab del html
  }
 
  ngOnInit(){
    this.photos = [];
  }

  ionViewWillEnter() {//tab invisible
    this.tabBarElement.style.display = 'none';
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

  MaxPhotosAlert(){
    let alert = this.alertCtrl.create({
      title: 'Máximo de Fotos',
      subTitle: 'Tienes ya el máximo permitido de imágenes, elimine alguna.',
      buttons: ['Ok']
    });
    alert.present();
  }

  ionViewWillLeave() {//tab visible al abandonar
    this.tabBarElement.style.display = 'flex';
  }
  
  takeMeBack() {//volver a atras boton
    this.navCtrl.parent.select(0);
  }

  takePhoto(){
    if(this.photos.length == 3){
      this.MaxPhotosAlert();
    }else{
      let options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.PNG,
        mediaType: this.camera.MediaType.PICTURE
      }
      
      this.camera.getPicture(options).then(url => {
       // imageData is either a base64 encoded string or a file URI
       // If it's base64:
       this.path = url;
       this.EditAlert();
      }, (err) => {
       // Handle error
       alert("Error " + err);
      });
    }
  }

  choosePicture(){
    if(this.photos.length == 3){
      this.MaxPhotosAlert();
    }else{
      let option = {
        title: 'Select Picture',
        message: 'Select Least I Picture',
        maximumImagesCount: 1,
        outType: 0
      };

      this.picker.getPictures(option).then(results=> {
        for(var i =0 ; i< results.length ; i++){
          this.path = results[i];
          this.EditAlert()
          //alert("Gallery Path: " + results[i]);
        }
      }, err => {
        //alert("Error " + err);
      })
  }
  }

  cropPicture(){
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

  deletePhotos(index){
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
          this.photos.splice(index,1);
          this.icons.push(""+index);
        }
      }
    ]
  });
  alert.present();
  }

  }

