import { Component } from '@angular/core';
import { ContactPage } from '../contact/contact';
import { AngularFireAuth } from 'angularfire2/auth';
import { NavController, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  tabBarElement: any;
  picSelected: boolean;
  profilePic: any;
  user: any;

  constructor(public navCtrl: NavController,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth) {
    this.picSelected = false;
    this.user = {};
    this.getUserData();
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');//cojo el tab del html
  }

  async getUserData(){
    await firebase.database().ref('users/' + this.afAuth.auth.currentUser.uid).once('value').then(
      async snapshot => {
        this.user['firstname'] = await snapshot.val().firstname;
        this.user['surname'] = await snapshot.val().surname;
        this.user['profilePic'] = await snapshot.val().profilePic;
        this.user['phone'] = await snapshot.val().phone;
      }
    );
  }

  async logForm() {
      let firstName: string = this.user['firstname'];
      let surname: string = this.user['surname'];
      let phone: string = this.user['phone'];

          firebase.auth().onAuthStateChanged(async user => {
            if (user) {

              let userRef = firebase.database().ref('/users/' + user.uid);

              userRef.update({
                'firstname': firstName,
                'surname': surname,
                'phone':phone
              });

              if (this.picSelected) {
                var picture_url = await this.AddImagesStorage(user.uid);
                firebase.database().ref('/users/' + user.uid).child('profilePic').set(picture_url);
              }

              this.infoAlert('El usuario ha sido editado.');

              //this.navCtrl.push(TabsPage);
            } else {
              // No user is signed in.
            }
        });
  }

  infoAlert(m) {
    try {
      var initalertCtrl = this.alertCtrl;
      let alert = initalertCtrl.create({
        title: '',
        message: m,
        buttons: [
          {
            text: 'Ok',
            role: 'alert',
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
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
            role: 'alert',
          },
          {
            text: 'Yes',
            role: 'confirm',
          }
        ]
      });
      alert.present();
    }
    catch (e) {
      console.log(e);
    }
  }

  async AddImagesStorage(uid) {
    try {
      const pictures = await firebase.storage().ref('users/' + uid + '/profile/' + this.profilePic.name);
      await pictures.put(this.profilePic);
      return await pictures.getDownloadURL().then(
        async (snapshot) => {
          return await snapshot;
        }
      );
    }
    catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  ionViewWillEnter() {//tab invisible
    this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {//tab visible al abandonar
    this.tabBarElement.style.display = 'flex';
  }
  
  takeMeBack() {//volver a atras boton
    this.navCtrl.setRoot(ContactPage);
  }

  changeListener($event): void {
    this.profilePic = $event.target.files[0];
    this.picSelected = true;

    var reader = new FileReader();
    reader.onload = e => {
      this.user['profilePic'] = reader.result;
    };
    reader.readAsDataURL($event.target.files[0]);
  }

}