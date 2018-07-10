import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Bot } from '../../models/bot';
import 'rxjs/add/operator/map';
import { Location } from '../../models/location';

/*
  Generated class for the LocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationProvider {



  url:string = "http://10.4.0.49:1337/";
  constructor(public http: HttpClient) {
  }

  loadList():Observable<Location[]>{
    return this.http.get(this.url+'getLocations/').map(res => <Location[]>res);
 }

  getBot()
    {
    return new Promise((resolve,reject) => {
      this.http.get(this.url + 'callBot/').subscribe(res => 
      {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }


  moveBot(to, bot)
    {
      console.log(to+" - "+bot);
    return new Promise((resolve,reject) => {
      this.http.get(this.url + 'moveBot/'+to+"/"+bot+"/",{responseType: 'text'}).subscribe(res => 
      {
        console.log(res);
        resolve(res);

      }, err => {
        console.log(err);
        reject(err);
      });
    });
  }


  askAction(botIp)
    {
    return new Promise((resolve,reject) => {
      this.http.get(this.url + 'askAction/'+botIp+"/").subscribe(res => 
      {
        resolve(res);

      }, err => {
        reject(err);
      });
    });
  }

}
