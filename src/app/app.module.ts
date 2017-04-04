import { NgModule, ErrorHandler } from '@angular/core';
import {NgxElectronModule} from 'ngx-electron';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Aliases } from '../pages/aliases/aliases';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    Aliases,
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    NgxElectronModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Aliases,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
