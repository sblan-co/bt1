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
  owner: boolean;
  exampler: any;

  constructor(
    platform: Platform,
    public navCtrl: NavController) {
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
      this.exampler = [];

      platform.ready().then(
        async () => {
          this.owner = this.isOwner();
          var pubAux = JSON.parse(localStorage.getItem('selectedPublication'));
          console.log(JSON.stringify(pubAux));
          this.exampler['title'] = pubAux.title;
          this.exampler['author'] = pubAux.author;
          this.exampler['id'] = pubAux.id;
          await this.getBookData();
        }
      );
  }

  takeMeBack() {//volver a atras boton
    this.navCtrl.push(ContactPage);
  }

  isOwner(): boolean {
    // Comprobar si la id del ejemplar esta dentro de los libros del usuario logeado
    return false;
  }

  async getBookData() {
    // console.log(this.exampler.id);
    await firebase.database().ref('examplers/' + this.exampler.id).once('value').then(
      async snapshot => {
        // console.log(JSON.stringify(snapshot));
        this.exampler['editorial'] = snapshot.val().editorial;
        this.exampler['comment'] = snapshot.val().comment;
        this.exampler['pics'] = snapshot.val().downloadURL.split(',');

        await firebase.database().ref('users/' + snapshot.val().owner_id).once('value').then(
          async snapOwner => {
            this.exampler['owner_name'] = snapOwner.val().firstname;
            this.exampler['owner_city'] = snapOwner.val().city;
            this.exampler['owner_pic'] = (snapOwner.hasChild('profilePic')) ? snapOwner.val().profilePic : '';
          }
        );
      }
    );
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/person.png?alt=media&token=05c4c25e-1187-4a01-b39a-e40dcfddfa40';
  }

  ionViewWillLeave() {//tab visible al abandonar
    this.tabBarElement.style.display = 'flex';
  }

  ionViewDidLoad() {
    this.tabBarElement.style.display = 'none';
  }

}