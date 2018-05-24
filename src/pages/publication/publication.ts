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
    this.navCtrl.setRoot(ContactPage);
  }

}