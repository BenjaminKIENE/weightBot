import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParcoursPage } from './parcours';

@NgModule({
  declarations: [
    ParcoursPage,
  ],
  imports: [
    IonicPageModule.forChild(ParcoursPage),
  ],
})
export class ParcoursPageModule {}
