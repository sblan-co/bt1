import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import { Storage } from '@ionic/storage';
import { LoginPage} from "../login/login";
import { TabsPage} from "../tabs/tabs";
import { App } from 'ionic-angular';
/**
 * Generated class for the SignoutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signout',
  templateUrl: 'signout.html',
})

export class SignoutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private afAuth: AngularFireAuth ,private storage: Storage,  public appCtrl: App) {

    storage.set('logged_in', false);
    afAuth.auth.signOut();
    storage.set('logged_in',false);

    this.appCtrl.getRootNav().setRoot(LoginPage);



  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad SignoutPage');
  }

}


