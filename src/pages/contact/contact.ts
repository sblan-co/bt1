// Angular
import { Component } from '@angular/core';

// Firebase
import * as firebase from 'firebase/app';

// Ionic-Angular
import { NavController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

// Project
import { ProfilePage } from '../profile/profile';
import { PublicationPage } from '../publication/publication';
import { MoreOptionsPage } from '../more-options/more-options';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  books: string;
  user: any;
  publications: string[] = ["https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg"];
  
  constructor(
    public navCtrl: NavController, 
    public popoverCtrl: PopoverController,
    public afAuth: AngularFireAuth) {

      this.user = {};
      this.getUserData();
      this.books = "Publications";
  }

  async getUserData(){
    await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      async snapshot => {
        this.user['firstname'] = snapshot.val().firstname;
        
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
                        console.log('BOOK ' + JSON.stringify(snapBook));
                        book['title'] = snapBook.val().title;
                        console.log('TITLE ' + book['title']);
                      }
                    );

                    //
                    // DESCOMENTAR CUANDO CONSIGAMOS INSERTAR IMAGENES
                    //

                    // let imgKeys = Object.keys(snapExampler.val().pics);

                    // book['img'] = snapExampler.val().pics[imgKeys[0]];
                    
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

  selectPhotos(index) {
    this.navCtrl.push(PublicationPage);
  }

}
