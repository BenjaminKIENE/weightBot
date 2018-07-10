import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LocationProvider } from '../../providers/location/location';

/**
 * Generated class for the DeplacementDisplayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deplacement-display',
  templateUrl: 'deplacement-display.html',
})

export class DeplacementDisplayPage {

  url:string = "http://10.4.0.49:1337/";

  constructor(public navCtrl: NavController, public navParams: NavParams, public provider : LocationProvider,public http: HttpClient) {
    
    console.log(this.navParams.get("bot").bot.IpAddress);
    this.provider.askAction(this.navParams.get("bot").bot.IpAddress).then(data => 
    {
      console.log("action");
    });
 
  }

  sendBot(event) {

      if(this.navParams.get("bot") != null)
      {
        this.provider.moveBot(this.navParams.get("locationTo"), this.navParams.get("bot").bot.Id).then(d => 
        {
              console.log(d);
              if(d == "OK")
              {
                console.log("ça passe");
                this.provider.askAction(this.navParams.get("bot").bot.IpAddress).then(data => 
                  {
                    console.log("action");
                });
                
              }
          }).catch(err => {
            console.log(err);
        });
      }
  }

  ionViewDidLoad() {
  }

}
