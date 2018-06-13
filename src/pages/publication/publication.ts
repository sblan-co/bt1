import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

// Firebase
import * as firebase from 'firebase/app';

// Project
import { ContactPage } from '../contact/contact';

@Component({
  selector: 'page-publication',
  templateUrl: 'publication.html'
})
export class PublicationPage {
  tabBarElement: any;
  examplerId: any;
  owner: boolean;

  constructor(
    platform: Platform,
    public navCtrl: NavController) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.examplerId = localStorage.getItem('selectedPublication');

    platform.ready().then(
      async () => {
        this.owner = this.isOwner();
        this.getBookData();
      }
    );
  }

  takeMeBack() {//volver a atras boton
    this.navCtrl.setRoot(ContactPage);
  }

  isOwner(): boolean {
    // Comprobar si la id del ejemplar esta dentro de los libros del usuario logeado
    return false;
  }

  async getBookData() {
    // await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
    //   async snapshot => {
    //     this.user['firstname'] = snapshot.val().firstname;
    //     this.user['lat'] = snapshot.val().lat;
    //     this.user['lon'] = snapshot.val().lon;
    //     this.user['city'] = snapshot.val().city;

    //     if (snapshot.hasChild('exchanges')) {
    //       await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/exchanges').once('value').then(
    //         snapExchanges => {
    //           this.user['nExchanges'] = Object.keys(snapExchanges.val()).length;
    //         }
    //       );
    //     }
    //     else {
    //       this.user['nExchanges'] = 0;
    //     }

    //     this.user['publications'] = [];

    //     if (snapshot.hasChild('books')) {
    //       await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books').once('value').then(
    //         async snapBooks => {

    //           // Sacamos las keys de los ejemplares publicados por el usuario
    //           let bookKeys = Object.keys(snapBooks.val());

    //           // Sacamos los datos de dichos ejemplares              
    //           for (let k of bookKeys) {
    //             await firebase.database().ref('examplers/' + k).once('value').then(
    //               async snapExampler => {
    //                 let book = {};

    //                 // Buscamos el nombre del libro
    //                 await firebase.database().ref('books/' + snapExampler.val().book_id).once('value').then(
    //                   snapBook => {
    //                     // console.log('BOOK ' + JSON.stringify(snapBook));
    //                     book['title'] = snapBook.val().title;
    //                     // console.log('TITLE ' + book['title']);
    //                   }
    //                 );

    //                 //
    //                 // DESCOMENTAR CUANDO CONSIGAMOS INSERTAR IMAGENES
    //                 //

    //                 var imgKeys = snapExampler.val().downloadURL.split(',');

    //                 book['img'] = imgKeys[0];
    //                 book['id'] = k;

    //                 this.user['publications'].push(book);
    //               }
    //             );
    //           }
    //         }
    //       );
    //     }
    //   }
    // );
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/whiteperson.png?alt=media&token=42d21c7e-6f14-473e-b361-81a901bb172f';
  }

  ionViewWillLeave() {//tab visible al abandonar
    this.tabBarElement.style.display = 'flex';
  }

  ionViewDidLoad() {
    this.tabBarElement.style.display = 'none';
  }

}