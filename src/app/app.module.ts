
// Angular
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { PopoverController } from 'ionic-angular';

// Ionic
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder'

// Firebase
import * as firebase from 'firebase/app';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorageModule, AngularFireStorage } from 'angularfire2/storage';

// Project
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { TabsPage } from '../pages/tabs/tabs';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { MoreOptionsPage } from '../pages/more-options/more-options';
import { PublicationPage } from '../pages/publication/publication';
import { ExchangesPopPage } from '../pages/exchanges-pop/exchanges-pop';
import { ExchangesPage } from '../pages/exchanges/exchanges';
import { PasswordPage } from '../pages/password/password';

export const firebaseConfig = {
  apiKey: "AIzaSyBb5MZHaxOYE35iIbVwYVZL2idWh5lMLdM",
  authDomain: "booktrap-d814e.firebaseapp.com",
  databaseURL: "https://booktrap-d814e.firebaseio.com",
  projectId: "booktrap-d814e",
  storageBucket: "booktrap-d814e.appspot.com",
  messagingSenderId: "681770317788"
};


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignUpPage,
    TabsPage,
    AboutPage,
    ContactPage,
    HomePage,
    ProfilePage,
    MoreOptionsPage,
    PublicationPage,
    ExchangesPopPage,
    ExchangesPage,
    PasswordPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    IonicImageViewerModule,
    AngularFireStorageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignUpPage,
    TabsPage,
    AboutPage,
    ContactPage,
    HomePage,
    ProfilePage,
    MoreOptionsPage,
    PublicationPage,
    ExchangesPopPage,
    ExchangesPage,
    PasswordPage
  ],
  providers: [
    Facebook,
    AngularFireAuth,
    AngularFireStorage,
    StatusBar,
    Camera,
    PopoverController,
    Crop,
    Geolocation,
    NativeGeocoder,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
