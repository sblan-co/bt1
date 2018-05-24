// Angular
import { Component } from '@angular/core';

// Ionic-Angular
import { NavController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';

// Project
import { ProfilePage } from '../profile/profile';
import { PublicationPage } from '../publication/publication';
import { MoreOptionsPage } from '../more-options/more-options';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  libros: string;
  publicaciones: string[] = ["https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor08.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor02.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor13.jpg","https://www.chiquipedia.com/imagenes/imagenes-amor20.jpg"];
  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {
    this.libros = "Publicaciones";
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
    this.navCtrl.setRoot(PublicationPage);
  }

}
