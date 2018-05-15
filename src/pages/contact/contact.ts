// Angular
import { Component } from '@angular/core';

// Ionic-Angular
import { NavController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

// Project
import { ProfilePage } from '../profile/profile';
import { MoreOptionsPage } from '../more-options/more-options';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  PageEditProfile = ProfilePage;
  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {

  }

  EditProfile() {
    this.navCtrl.setRoot(this.PageEditProfile);
  }

  showMoreOptions($event)
  {
    let popover = this.popoverCtrl.create(MoreOptionsPage);
    popover.present({
      ev: $event
    });
  }

}