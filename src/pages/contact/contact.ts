import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  PageEditProfile = ProfilePage;
  constructor(public navCtrl: NavController) {

  }

  EditProfile() {
    this.navCtrl.setRoot(this.PageEditProfile);
  }

}
