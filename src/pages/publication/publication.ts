import { Component } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';

// Firebase
import * as firebase from 'firebase/app';

// Project
import { ProfilePage } from '../profile/profile';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'page-publication',
  templateUrl: 'publication.html'
})
export class PublicationPage {
  tabBarElement: any;
  owner: any;
  exampler: any;

  constructor(
    platform: Platform,
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    public alertCtrl: AlertController) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.exampler = [];

    platform.ready().then(
      async () => {
        var pubAux = JSON.parse(localStorage.getItem('selectedPublication'));
        this.exampler['title'] = pubAux.title;
        this.exampler['author'] = pubAux.author;
        this.exampler['id'] = pubAux.id;
        this.exampler['owner_id'] = pubAux.owner_id;
        await this.getBookData();
        this.owner = await this.isOwner();
      }
    );
  }

  takeMeBack() {//volver a atras boton
    localStorage.removeItem('selectedPublication');    
    this.navCtrl.popToRoot();
    this.tabBarElement.style.display = 'flex';
  }

  isOwner() {
    return firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books').once('value').then(
      snap => {
        return snap.hasChild(this.exampler['id']);
      }
    );
  }

  async getBookData() {
    await firebase.database().ref('examplers/' + this.exampler.id).once('value').then(
      async snapshot => {
        this.exampler['editorial'] = snapshot.val().editorial ? snapshot.val().editorial : 'Desconocida';
        this.exampler['comment'] = snapshot.val().comment;
        this.exampler['pics'] = snapshot.val().downloadURL.split(',');

        await firebase.database().ref('users/' + snapshot.val().owner_id).once('value').then(
          async snapOwner => {
            this.exampler['owner_name'] = snapOwner.val().firstname;
            this.exampler['owner_city'] = snapOwner.val().city;
            this.exampler['owner_pic'] = (snapOwner.hasChild('profilePic')) ? snapOwner.val().profilePic : '';
          }
        );
      }
    );
  }

  imgError($event) {
    $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/person.png?alt=media&token=05c4c25e-1187-4a01-b39a-e40dcfddfa40';
  }

  ionViewDidLoad() {
    this.tabBarElement.style.display = 'none';
  }

  goToProfile(){
    this.navCtrl.push(ProfilePage);
  }

  deletePublication() {

    var photosRef = firebase.storage().ref('users/' + this.afAuth.auth.currentUser.uid + '/examplers/' + this.exampler['id']);

    for (var i = 0; i < 3; i++) {
      // Delete the file
      photosRef.child(i + '.jpg').delete().then(
        () => {
          // File deleted successfully
          console.log('Fotos borradas satisfactoriamente');
        }).catch(function (error) {
          // Uh-oh, an error occurred!
          console.log('Error al borrar del storage');
        });
    }

    firebase.database().ref('examplers/' + this.exampler['id']).remove();
    firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/books/' + this.exampler['id']).remove();
    this.infoAlert('Publicación eliminada con éxito, Espere unos segundos...');
    localStorage.removeItem('selectedPublication');    
    //this.navCtrl.popToRoot();
    //this.tabBarElement.style.display = 'flex';
    location.reload();
  }

  addExchange() {
    let ref = firebase.database().ref('exchanges');

    ref.push({
      'state': 'unseen'
    }).then(async result => {
      var exchangeId = await result.key;
      firebase.database().ref('exchanges/' + exchangeId).child('requester').child('id').set(this.afAuth.auth.currentUser.uid);
      
      firebase.database().ref('exchanges/' + exchangeId).child('owner').child('id').set(this.exampler['owner_id']);
      firebase.database().ref('exchanges/' + exchangeId + '/owner').child('exampler').set(this.exampler['id']);
      
      firebase.database().ref('users/' + this.exampler['owner_id']).once('value').then(
        snap => {
          if (snap.hasChild('exchanges')) {
            firebase.database().ref('users/' + this.exampler['owner_id'] + '/exchanges')
              .child(exchangeId).set(exchangeId);
          }
          else {
            firebase.database().ref('users/' + this.exampler['owner_id']).child('/exchanges')
              .child(exchangeId).set(exchangeId);
          }
        }
      );

      this.infoAlert('Solicitud de intercambio enviada con éxito.');
    });
  }

  // ALERT //

  showDeleteAlert() {
    this.presentAlert('Eliminar', '¿Está seguro de que desea eliminar la publicación?', 'delete');
  }

  showExchangeAlert() {
    this.presentAlert('Intercambio', '¿Desea solicitar un intercambio a ' +
      this.exampler['owner_name'] + ' por el libro "' + this.exampler['title'] + '"?', 'exchange');
  }

  presentAlert(t, m, task) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: t,
        message: m,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            role: 'confirm',
            handler: () => {
              if (task == 'delete') {
                this.deletePublication();
              }
              else if (task == 'exchange') {
                this.addExchange();
              }
            }
          }
        ]
      });
      alert.present();
    }
    catch (e) {
    }
  }

  infoAlert(m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: '',
        message: m,
        buttons: [
          {
            text: 'Aceptar',
            role: 'alert'
          }
        ]
      });
      alert.present();
    }
    catch (e) {
    }
  }

}