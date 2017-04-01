import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NavController } from 'ionic-angular';
import { reorderArray } from 'ionic-angular';



@Component({
  selector: 'page-aliases',
  templateUrl: 'aliases.html'
})
export class Aliases {

	aliases: Array<{alias: string, value: string}>;

  constructor(public navCtrl: NavController, private _electronService: ElectronService, private _ngZone: NgZone) {
		console.log("Fectchin aliases");

    this._electronService.ipcRenderer.send('aliases', 'fetch');

    this._electronService.ipcRenderer.on('aliases', (event, arg) => {
      this._ngZone.run(() => {
        this.aliases = arg;
        console.log("this.aliases", this.aliases);
      });
    });
  }

  reorderItems(indexes) {
    console.log("indexes", indexes);
    this.aliases = reorderArray(this.aliases, indexes);
  }

}
