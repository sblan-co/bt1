// Angular
import { Component } from '@angular/core';

// Ionic-Angular
import { NavController, Platform } from 'ionic-angular';

// Ionic
import { StatusBar } from '@ionic-native/status-bar';

// Project Pages
import { SignUpPage } from '../sign-up/sign-up';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public navCtrl: NavController;
  private plt: Platform;
  private statusBar: StatusBar;
  
  constructor(nav: NavController) {
    this.navCtrl = nav;
    // this.plt.ready().then ((readySource) =>{
    //   this.statusBar.styleLightContent();
    // });
  }

  signUp()
  {
    this.navCtrl.push(SignUpPage);
  }

  emailLogin()
  {

  }
  
}
