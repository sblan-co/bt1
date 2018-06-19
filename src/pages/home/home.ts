import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import * as math from 'mathjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { PublicationPage } from '../publication/publication';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  reload: boolean;
  lat_user: any;
  lon_user: any;
  images: any;
  constructor(public navCtrl: NavController,
  public alertCtrl: AlertController,
  public afAuth: AngularFireAuth) {
    this.reload = true;
    this.images = [];
    this.listExamplers();
    let pub = localStorage.getItem('selectedPublication');
  }

   async listExamplers(){
       await this.getUserData();
       await firebase.database().ref('examplers').on('child_added', async snapshot => {
         try{
          var imgURL = snapshot.val().downloadURL.split(',');
          var distance = this.distance(this.lat_user, this.lon_user, snapshot.val().lat, snapshot.val().lon);
          var title; 
          var author;
          var id = snapshot.key;
          var owner_id = snapshot.val().owner_id;
          if(!distance){
            distance = 99999999;
          }
          const urlExamplers = imgURL[0];
          await firebase.database().ref('books/' + snapshot.val().book_id).once('value').then(
            snapBook => {
              title = snapBook.val().title;
              author = snapBook.val().author;
            }
          );
          let orderDistances = { "img": urlExamplers, "distance": distance, "title": title,
             "author": author, "id": id, 'owner_id': owner_id};
          await this.images.push(orderDistances);
          this.images.sort((a,b) => {
            return a.distance - b.distance;
          });
         }catch{}
      });
  }

  async loading(){
    if(this.images.length == 0){
      this.reload = false;
    }
  }

  async getUserData(){
    await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      async snapshot => {
        this.lat_user = snapshot.val().lat;
        this.lon_user = snapshot.val().lon;
      });
  }

  async Add(key){
    this.images = [];
    if(key == ""){
        this.listExamplers();
    }else{
      await firebase.database().ref('examplers').on('child_added', async snapshot => {
        try{
         var imgURL = snapshot.val().downloadURL.split(',');
         const urlExamplers = imgURL[0];
         var title; 
         var author;
         var id = snapshot.key;
         var owner_id = snapshot.val().owner_id;
         var distance = this.distance(this.lat_user, this.lon_user, snapshot.val().lat, snapshot.val().lon);
         if(!distance){
          distance = 99999999;
        }
        await firebase.database().ref('books/' + snapshot.val().book_id).once('value').then(
          async snapBook => {
            const title = await snapBook.val().title;
            const author = await snapBook.val().author;
            let orderDistances = { "img": urlExamplers, "distance": distance, "title": title,
            "author": author, "id": id, 'owner_id': owner_id};
            if(title.toLowerCase().indexOf(key.toLowerCase()) >= 0){
              await this.images.push(orderDistances);
            }
            else if(author.toLowerCase().indexOf(key.toLowerCase()) >= 0){
              await this.images.push(orderDistances);
            }
          this.images.sort((a,b) => {
            return a.distance - b.distance
          });
          }
        );
        await this.loading();
        
      }catch{}
    });
    }
  }

  distance(lat1, lon1, lat2, lon2){ // generally used geo measurement function
      var R = 6378.137; // Radius of earth in KM
      var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
      var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;
      return d * 1000; // meters
  }

  selectPhotos(pub) {
    localStorage.setItem('selectedPublication', JSON.stringify(pub));
    this.navCtrl.push(PublicationPage);
  }
  

  doRefresh(refresher) {
    setTimeout(() => {
      if (refresher != 0)
        refresher.complete();
      this.navCtrl.setRoot(TabsPage);
    }, 500);
  };
}
