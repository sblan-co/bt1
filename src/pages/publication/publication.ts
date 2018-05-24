import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ContactPage } from '../contact/contact';

@Component({
  selector: 'page-publication',
  templateUrl: 'publication.html'
})
export class PublicationPage {

  constructor(public navCtrl: NavController) {
  }

  takeMeBack() {//volver a atras boton
    // this.navCtrl.setRoot(ContactPage);
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/person.png?alt=media&token=05c4c25e-1187-4a01-b39a-e40dcfddfa40';
  }

}