import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { reorderArray } from 'ionic-angular';



@Component({
  selector: 'page-aliases',
  templateUrl: 'aliases.html'
})
export class Aliases {

	aliases: Array<{alias: string, value: string, order: number, visible: boolean}>;

  constructor(public navCtrl: NavController,
              private _electronService: ElectronService,
              private _ngZone: NgZone,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController) {
		console.log("Fectchin aliases");

    this._electronService.ipcRenderer.send('aliases', 'fetch');

    this._electronService.ipcRenderer.on('aliases', (event, arg) => {
      this._ngZone.run(() => {
        console.log("arg", arg);
        if (Array.isArray(arg)) {
          this.aliases = arg;
          console.log("this.aliases", this.aliases);
        } else if (arg == "add_ok") {
          this._electronService.ipcRenderer.send('aliases', 'fetch');
          // TODO Add some nice UI thing
        }
        // TODO Add 'add_fail' and other cases
      });
    });
  }

  reorderItems(indexes) {
    console.log("indexes", indexes);
    console.log("this.aliases", this.aliases);
    this.aliases = reorderArray(this.aliases, indexes);
    let startIdx = indexes.from;
    let endIdx = indexes.to;
    if (indexes.from > indexes.to) {
      startIdx = indexes.to;;
      endIdx = indexes.from;
    }
    let aliasesToUpdate = [];
    for (let idx = startIdx; idx <= endIdx; idx++) {
      this.aliases[idx].order = idx;
      aliasesToUpdate.push(this.aliases[idx]);
    }
    console.log("aliasesToUpdate", aliasesToUpdate);
    this._electronService.ipcRenderer.send(
       'aliases',
       'update',
       aliasesToUpdate);
  }

  visibleToggled(alias, index, event){
    console.log(alias, index, event.checked);
    this.aliases[index].visible = event.checked;
    this._electronService.ipcRenderer.send(
       'aliases',
       'update',
       [{alias: alias, visible: event.checked}]);

    console.log("this.aliases", this.aliases);
  }

  addAlias(alias) {
    // TODO Add some UI spinner or toast, explaining what is going to happen
    this._electronService.ipcRenderer.send(
       'aliases',
       'add',
       alias);
  }


 openAddAliasPopup() {
    let prompt = this.alertCtrl.create({
      title: 'Add alias',
      inputs: [
        {
          name: 'alias',
          placeholder: 'Alias'
        },
        {
          name: 'value',
          placeholder: 'Username'
        },
        {
          name: 'endpoint',
          placeholder: 'https://login.salesforce.com'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            let toastMsg = "Your alias is being added. A browser tab should open shortly";
            if (data.endpoint === "") data.endpoint = "https://login.salesforce.com";
            if (!this.validAlias(data.alias)) {
              toastMsg = 'Invalid alias value. \nSorry, better error handling is on the roadmap ;-)';
            } else if (!this.validUsername(data.value)) {
              toastMsg = 'Invalid alias username. \nSorry, better error handling is on the roadmap ;-)';
            } else if (!this.validEndpoint(data.endpoint)) {
              toastMsg = 'Invalid alias endpoint. \nSorry, better error handling is on the roadmap ;-)';
            } else {
              this.addAlias(data);
            }
            let toast = this.toastCtrl.create({
              message: toastMsg,
              duration: 3000
            });
            toast.present();
          }
        }
      ]
    });
    prompt.present();
  }

  validAlias(alias) {
    if (alias === "" || alias.includes(" ")) return false;
    return true;
  }

  validUsername(username) {
    if (username === "" || username.includes(" ") || !username.includes("@")) return false;
    return true;
  }

  validEndpoint(endpoint) {
   return true;
  }
}
