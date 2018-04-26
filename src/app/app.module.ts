
// Angular
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

// Ionic
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
// import { Platform } from 'ionic-angular';

// Firebase
import * as firebase from 'firebase/app';
import * as FirebaseAuthModule from 'firebase/auth';
import * as FirebaseDatabaseModule from 'firebase/database';

// Project
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SignUpPage } from '../pages/sign-up/sign-up';

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
    HomePage,
    SignUpPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    firebase.initializeApp(firebaseConfig),
    FirebaseAuthModule
    // FirebaseDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SignUpPage
  ],
  providers: [
    // Platform,
    FirebaseAuthModule,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
