// Angular
import { Component } from '@angular/core';

// Firebase
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

// Ionic-Angular
import { NavController, Platform, AlertController } from 'ionic-angular';
import { ContactPage } from '../contact/contact';

// Project

@Component({
    selector: 'page-exchanges',
    templateUrl: 'exchanges.html'
})
export class ExchangesPage {
    requester: any;
    exchange_id: any;
    exampler: any;

    constructor(
        platform: Platform,
        public navCtrl: NavController,
        public afAuth: AngularFireAuth,
        public alertCtrl: AlertController) {

        this.requester = [];
        this.exampler = [];
        this.exchange_id = localStorage.getItem('exchangeId');

        platform.ready().then(
            async () => {
                await this.getUserData();
                firebase.database().ref('exchanges/' + this.exchange_id).child('state').set('seen');
            }
        );
    }

    async getUserData() {
        console.log('ID INTERCAMBIO' + this.exchange_id);
        await firebase.database().ref('exchanges/' + this.exchange_id).once('value').then(
            async snap => {
                console.log(JSON.stringify(snap));
                this.requester['id'] = await snap.val().requester.id;

                firebase.database().ref('users/' + this.requester['id']).once('value').then(
                    user => {
                        this.requester['profilePic'] = user.val().profilePic;
                        this.requester['firstname'] = user.val().firstname;
                        this.requester['city'] = user.val().city;
                        this.requester['phone'] = user.val().phone;
                    }
                );

                await this.getBookData(snap.val().owner.exampler);
            }
        );
    }

    async getBookData(id) {
        await firebase.database().ref('examplers/' + id).once('value').then(
            async snap => {
                console.log(snap.val().bookId);
                this.exampler['bookId'] = await snap.val().book_id;

                firebase.database().ref('books/' + this.exampler['bookId']).once('value').then(
                    book => {
                        this.exampler['title'] = book.val().title;
                        this.exampler['author'] = book.val().author;
                    }
                );

                this.exampler['pic'] = snap.val().downloadURL.split(',')[0];
            }
        );
    }

    imgError($event) {
        $event.target['src'] = 'https://firebasestorage.googleapis.com/v0/b/booktrap-d814e.appspot.com/o/whiteperson.png?alt=media&token=42d21c7e-6f14-473e-b361-81a901bb172f';
    }

    takeMeBack() {//volver a atras boton
        this.navCtrl.pop();
    }

    showDeleteAlert() {
        this.presentAlert('Eliminar', '¿Está seguro de que desea eliminar el intercambio?');
    }

    presentAlert(t, m) {
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
                            this.deleteExchange();
                        }

                    }
                ]
            });
            alert.present();
        }
        catch (e) {
            console.log(e);
        }
    }


    deleteExchange() {
        firebase.database().ref('exchanges/' + this.exchange_id).remove();
        firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid + '/exchanges/' + this.exchange_id).remove();
        this.navCtrl.push(ContactPage);
        this.infoAlert('Intercambio eliminado con éxito.');
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
        console.log(e);
      }
    }

}