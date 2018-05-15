import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ContactPage } from '../contact/contact';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  tabBarElement: any;

  constructor(public navCtrl: NavController) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//cojo el tab del html
  }

  ionViewWillEnter() {//tab invisible
    this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {//tab visible al abandonar
    this.tabBarElement.style.display = 'flex';
  }
  
  takeMeBack() {//volver a atras boton
    this.navCtrl.push(ContactPage);
  }

}