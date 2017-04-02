var os = require('os');
const electron = require('electron')
const {app, Menu, MenuItem, Tray} = require('electron')
const spawn = require('child_process').spawn;
const storage = require('electron-json-storage');

const {BrowserWindow} = require('electron')
const {ipcMain} = require('electron')

let tray        = null
let contextMenu = new Menu();
let notifWin    = null;
let managerWin  = null;
let orgs        = null

app.on('ready', () => {

  // Our hidden notification window.
  notifWin = new BrowserWindow({
    show: false,
    height:0,
    width:0,
    useContentSize: true,
    frame: false,
    skipTaskbar: true
  })
  notifWin.loadURL(`file://${__dirname}/notificationWindow.html`)


  //MacOS tray icons, slightly different size (22x22 > 176x176)
  if(os.platform() == 'darwin') {
    tray = new Tray(app.getAppPath() + '/img/tray-icon-mac-Template.png')
  }
  //other icons, available in 32x32 > 256X256
  else {
    tray = new Tray(app.getAppPath() + '/img/tray-icon.png')
  }
  tray.setToolTip('Clicks not passwords.')

  refreshMenu()

  ipcMain.on("aliases",function(err,cmd, args){
    console.log("Received message: ", cmd, args);
    switch (cmd){
      case 'fetch':
        ipc_aliases_fetch();
        break;
      case 'update':
        ipc_aliases_update(args);
        break;
      default:
        managerWin.webContents.send("aliases","unknown command: " + cmd);
    }
  })

}) // end app.on('ready')


function showMenu(orgs){
  orgs.forEach(org => {
    console.log(org);
    if (org.visible) contextMenu.append(new MenuItem({label: org.alias + " : " + org.value,  click(){ openOrg(org.alias); }}));
  });
  contextMenu.append(new MenuItem({type: 'separator'}));
  contextMenu.append(new MenuItem({label: 'Refresh', click() { refreshMenu() }}));
  contextMenu.append(new MenuItem({type: 'separator'}));
  contextMenu.append(new MenuItem({label: 'Manage', click() { launchManager() }}));
  contextMenu.append(new MenuItem({type: 'separator'}));
  contextMenu.append(new MenuItem({label: 'Quit', click() { app.quit() }}));
  tray.setContextMenu(contextMenu)
}


function launchManager() {
  console.log("launchManager");
  if (managerWin && !managerWin.isDestroyed()) {
    managerWin.show();
  } else {
    managerWin = new BrowserWindow({
      width: 600,
      height: 500
    })
    // Note: ionicMode=wp is to make it look not like Material design - maybe
    //  we want this, maybe we don't.
    // managerWin.loadURL(`file://${__dirname}/www/index.html?ionicMode=wp`)
    managerWin.loadURL(`file://${__dirname}/www/index.html`, {show:false});
    // managerWin.webContents.openDevTools();
    managerWin.once('ready-to-show', () => {
      managerWin.show()
    })
  }
}


function refreshMenu() {
  contextMenu = new Menu();
  getOrgAliases().then(orgs => {
    showMenu(orgs);
    // Show our notification via the hidden window
    notifWin.webContents.send('notification', 'Aliases refreshed')
  }).catch(e => {
    console.log("e", e);
    contextMenu.append(new MenuItem({label: 'Quit', click() { app.quit() }}));
    tray.setContextMenu(contextMenu)
    // Show our notification via the hidden window
    notifWin.webContents.send('notification', 'Oh dear, something went wrong :(\n' + e)
  });
}


function getOrgAliases(){
  return new Promise((resolve, reject) => {
    // get Aliases from SFDX
    var ret = spawn('sfdx', ['force:alias:list', '--json']);
    ret.stdout.on('data', (data) => {
      console.log("SFDX ouput", JSON.parse(data));
      // Update our version of config and enrich the result from SFDX
      updateAndEnrichOrgs(JSON.parse(data).results).then(res => {
        console.log("updateAndEnrichOrgs res", res);
        orgs = res;
        resolve(res);
      }).catch(e => {
        console.log("e", e);
      });
    });
  });
}


function updateAndEnrichOrgs(orgs){
  return new Promise((resolve, reject) => {
    storage.get('aliases', function(error, data) {
      if (error) throw error;
      // console.log("data", data);
      let tmpAliases = (data.aliases) ? data.aliases : {};

      let newAliases = []
      let newAliasesForFile = {}
      orgs.forEach(org => {
        org.visible = (tmpAliases[org.alias]) ? tmpAliases[org.alias].visible : true;
        org.order = (tmpAliases[org.alias]) ? tmpAliases[org.alias].order : 9999;
        newAliasesForFile[org.alias] = org;
        newAliases.push(org);
      });
      newAliases.sort(function (a, b) {
        return a.order - b.order;
      });
      storage.set('aliases',  {aliases: newAliasesForFile}, function(error) {
        if (error) throw error;
      });
      resolve(newAliases);
    });
  });
}


function openOrg(orgAlias){
  notifWin.webContents.send('notification', 'Your org will open in a new tab shortly')
  var ret = spawn('sfdx', ['force:org:open', '-u', orgAlias]);
    ret.stdout.on('data', (data) => {
    });

    ret.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      notifWin.webContents.send('notification', 'Oh dear, something went wrong :(\n' + data)
    });
}


function ipc_aliases_fetch(){
  return new Promise((resolve, reject) => {
    if (orgs) {
      managerWin.webContents.send("aliases",orgs);
    } else {
      getOrgAliases().then(x => {
        managerWin.webContents.send("aliases",orgs);
      }).catch(e => {
        console.log("e", e);
        managerWin.webContents.send("aliases","Error:" +JSON.stringify(e));
      });
    }
    resolve();
  });
}


function ipc_aliases_update(orgs){
  console.log("ipc_aliases_update", orgs);
  storage.get('aliases', function(error, data) {
    if (error) throw error;
    console.log("data.aliases", data.aliases);
    let updatedOrgs = [];
    orgs.forEach(org => {
      data.aliases[org.alias].visible = org.visible;
    });
    // Update the Tray Icon menu
    contextMenu = new Menu();
    showMenu(Object.values(data.aliases));
    // Write back to our conf file
    storage.set('aliases',  data, function(error) {
      if (error) throw error;
    });
  });
}