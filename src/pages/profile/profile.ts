// Angular
import { Component, OnInit } from '@angular/core';

// Firebase
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

// Project
import { EditProfilePage } from '../edit-profile/edit-profile';
import { PublicationPage } from '../publication/publication';
import { MoreOptionsPage } from '../more-options/more-options';
import { ExchangesPopPage } from '../exchanges-pop/exchanges-pop';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage{
  external: boolean;
  books: string;
  user: any;
  tabBarElement: any;
  pub: any;
  publications: string[] = ["https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg"];
  
  constructor(
    platform: Platform,
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public afAuth: AngularFireAuth) {
      this.user = {};
      this.external = false;
      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');

      platform.ready().then(
        async () => {
          
          if (!this.checkValue(localStorage.getItem('selectedPublication'))) {
            this.external = false;
            this.user['uid'] = await this.afAuth.auth.currentUser.uid;
          }
          else {
            this.external = true;
            this.pub = JSON.parse(localStorage.getItem('selectedPublication'));
            this.user['uid'] = await this.pub.owner_id;
          }

          await this.getUserData();
          this.books = "Publications";
        }
      );
  }

  isOwner() {
    //Check if exemplars's id are inside of books from the user logged
    return firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books').once('value').then(
      snap => {
        return snap.hasChild(this.pub.id);
      }
    );
  }
  
  async getUserData(){
    await firebase.database().ref('users/' + this.user['uid']).once('value').then(
      async snapshot => {
        this.user['firstname'] = snapshot.val().firstname;
        this.user['lat'] = snapshot.val().lat;
        this.user['lon'] = snapshot.val().lon;
        this.user['city'] = snapshot.val().city;
        this.user['profilePic'] = snapshot.val().profilePic;
        this.user['phone'] = snapshot.val().phone;
        
        if (snapshot.hasChild('exchanges')){
          await firebase.database().ref('users/' + this.user['uid'] + '/exchanges').once('value').then(
            snapExchanges => {
              this.user['nExchanges'] = Object.keys(snapExchanges.val()).length;
            }
          );
        }
        else{          
          this.user['nExchanges'] = 0;
        }

        this.user['publications'] = [];
        
        if (snapshot.hasChild('books')){
          await firebase.database().ref('users/' + this.user['uid'] + '/books').once('value').then(
            async snapBooks => {

              //Keys from the exemplars of the user
              let bookKeys = Object.keys(snapBooks.val());

              //Dates exemplars     
              for (let k of bookKeys){
                await firebase.database().ref('examplers/' + k).once('value').then(
                  async snapExampler => {
                    let book = {};

                    // Finding name of a book
                    await firebase.database().ref('books/' + snapExampler.val().book_id).once('value').then(
                      snapBook => {
                        book['title'] = snapBook.val().title;
                        book['author'] = snapBook.val().author;
                      }
                    );
                    

                    var imgKeys = snapExampler.val().downloadURL.split(',');

                    book['img'] = imgKeys[0];
                    book['id'] = k;
                    
                    this.user['publications'].push(book);
                  }
                );  
              }
            }
          );
        }
      }
    );
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/whiteperson.png?alt=media&token=42d21c7e-6f14-473e-b361-81a901bb172f';
  }
  
  doRefresh(refresher) {
    setTimeout(() => {
      if (refresher != 0)
        refresher.complete();
      this.navCtrl.setRoot(ProfilePage);
    }, 500);
  };
  
  checkValue(str: any): boolean {
    return ((str !== '') && (str != null) && (str !== 'null') && (str !== 'undefined'));
  }
  
  EditProfile() {
    this.navCtrl.push(EditProfilePage);
  }

  showMoreOptions($event)
  {
    let popover = this.popoverCtrl.create(MoreOptionsPage);
    popover.present({
      ev: $event
    });
  }

  showExchanges($event){    
    let popover = this.popoverCtrl.create(ExchangesPopPage);
    popover.present({
      ev: $event
    });
  }

  selectPhotos(pub) {
    pub['owner_id'] = this.user['uid'];
    localStorage.setItem('selectedPublication', JSON.stringify(pub));
    this.navCtrl.push(PublicationPage);
  }

  takeMeBack(){
    this.navCtrl.pop();
  }
}
