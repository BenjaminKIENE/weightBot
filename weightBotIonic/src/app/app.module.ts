import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { DeplacementPage } from '../pages/deplacement/deplacement';
import { ParcoursPage } from '../pages/parcours/parcours';
import { RobotPage } from '../pages/robot/robot';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocationProvider } from '../providers/location/location';
import { DeplacementDisplayPage } from '../pages/deplacement-display/deplacement-display';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    DeplacementPage,
    RobotPage,
    ParcoursPage,
    DeplacementDisplayPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    DeplacementPage,
    RobotPage,
    ParcoursPage,
    DeplacementDisplayPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocationProvider
  ]
})
export class AppModule {}
