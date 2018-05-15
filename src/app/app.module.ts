
// Angular
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

// Ionic
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { Crop } from '@ionic-native/crop';
// import { Platform } from 'ionic-angular';

// Firebase
import * as firebase from 'firebase/app';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

// Project
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { TabsPage } from '../pages/tabs/tabs';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';

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
    ProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
    // FirebaseDatabaseModule
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
    ProfilePage
  ],
  providers: [
    // Platform,
    Facebook,
    AngularFireAuth,
    StatusBar,
    Camera,
    ImagePicker,
    Crop,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
