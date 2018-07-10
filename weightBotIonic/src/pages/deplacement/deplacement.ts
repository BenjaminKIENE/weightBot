import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LocationProvider } from '../../providers/location/location';
import { Observable } from 'rxjs/Rx';
import { Location } from '../../models/location';
import { Bot } from '../../models/bot';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { DeplacementDisplayPage } from '../deplacement-display/deplacement-display';

/**
 * Generated class for the DeplacementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deplacement',
  templateUrl: 'deplacement.html',
})
export class DeplacementPage {

  locations : Location[];
  locationFrom:number;
  locationTo:number;

  bot:any;

  url:string = "http://10.4.0.49:1337/";

  constructor(public navCtrl: NavController, public navParams: NavParams, public provider : LocationProvider,private storage: Storage,public http: HttpClient) {

    provider.loadList().subscribe(data => {
      this.storage.set('locations', data);
      });
  }

  callBot(event) {
      this.provider.getBot()
      .then(data => {
        this.bot = data;

        if(this.bot != null)
        {
          this.provider.moveBot(this.locationFrom, this.bot.bot.Id)
          .then(data => 
            {
              if(data == "OK")
              {
                this.navCtrl.push(DeplacementDisplayPage,{bot:this.bot, locationTo:this.locationTo});
              }
          }).catch(err => {
            console.log(err);
        });
        }
      });
    }
  
  ionViewDidLoad() {
    this.storage.get('locations').then((val) => {
      this.locations = val;
    });
  }

}
