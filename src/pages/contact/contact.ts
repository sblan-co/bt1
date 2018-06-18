// Angular
import { Component } from '@angular/core';

// Firebase
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController, Platform } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

// Project
import { ProfilePage } from '../profile/profile';
import { PublicationPage } from '../publication/publication';
import { MoreOptionsPage } from '../more-options/more-options';
import { ExchangesPopPage } from '../exchanges-pop/exchanges-pop';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  external: boolean;
  books: string;
  user: any;
  publications: string[] = ["https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg"];
  
  constructor(
    platform: Platform,
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public afAuth: AngularFireAuth) {
      
      this.user = {};
      this.external = false;

      platform.ready().then(
        async () => {
          
          if (this.checkValue(localStorage.getItem('selectedPublication'))) {
            this.external = false;
            this.user['uid'] = await this.afAuth.auth.currentUser.uid;
          }
          else {
            this.external = true;
            let pub = localStorage.getItem('selectedPublication');
            this.user['uid'] = await pub['uid'];
          }

          this.getUserData();
          this.books = "Publications";
        }
      );
  }

  async getUserData(){
    await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      async snapshot => {
        this.user['firstname'] = snapshot.val().firstname;
        this.user['lat'] = snapshot.val().lat;
        this.user['lon'] = snapshot.val().lon;
        this.user['city'] = snapshot.val().city;
        this.user['profilePic'] = snapshot.val().profilePic;
        this.user['phone'] = snapshot.val().phone;
        
        if (snapshot.hasChild('exchanges')){
          await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/exchanges').once('value').then(
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
          await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books').once('value').then(
            async snapBooks => {

              // Sacamos las keys de los ejemplares publicados por el usuario
              let bookKeys = Object.keys(snapBooks.val());

              // Sacamos los datos de dichos ejemplares              
              for (let k of bookKeys){
                await firebase.database().ref('examplers/' + k).once('value').then(
                  async snapExampler => {
                    let book = {};

                    // Buscamos el nombre del libro
                    await firebase.database().ref('books/' + snapExampler.val().book_id).once('value').then(
                      snapBook => {
                        // console.log('BOOK ' + JSON.stringify(snapBook));
                        book['title'] = snapBook.val().title;
                        book['author'] = snapBook.val().author;
                        // console.log('TITLE ' + book['title']);
                      }
                    );

                    //
                    // DESCOMENTAR CUANDO CONSIGAMOS INSERTAR IMAGENES
                    //

                    var imgKeys = snapExampler.val().downloadURL.split(',');

                    book['img'] = imgKeys[0];
                    book['id'] = k;
                    console.log(book);
                    
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
  
  checkValue(str: any): boolean {
    return ((str !== '') && (str != null) && (str !== 'null') && (str !== 'undefined'));
  }
  
  EditProfile() {
    this.navCtrl.setRoot(ProfilePage);
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
    console.log(JSON.stringify(pub));
    localStorage.setItem('selectedPublication', JSON.stringify(pub));
    this.navCtrl.push(PublicationPage);
  }

}
