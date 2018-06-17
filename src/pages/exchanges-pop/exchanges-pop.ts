// Angular
import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController } from 'ionic-angular';

// Firebase
import * as firebase from 'firebase/app';

// Project
import { ExchangesPage } from '../exchanges/exchanges';

@Component({
  selector: 'page-exchanges-pop',
  templateUrl: 'exchanges-pop.html'
})
export class ExchangesPopPage {
  exchanges: any;

  constructor(
    public navCtrl: NavController,
    private afAuth: AngularFireAuth) {
    this.exchanges = [];

    firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      snap => {
        if (snap.hasChild('exchanges')) {
          firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/exchanges').once('value').then(
            async snapEx => {
              console.log(JSON.stringify(snapEx));

              var keys = Object.keys(snapEx.val());

              for (var k of keys) {

                // PA LUEGO DON'T YOU WORRY
                await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/exchanges/' + k).once('value').then(
                  async snap => {
                    // unseen = await snap.val().state;
                  }
                );
                
                this.exchanges.push(k);                
              }
            }
          );
        }
      }
    );
  }

  showExchange(item) {
    localStorage.setItem('exchangeId', item);
    this.navCtrl.push(ExchangesPage);
    console.log("Exchanges");
  }
}