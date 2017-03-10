var os = require('os');
const electron = require('electron')
const {app, Menu, MenuItem, Tray} = require('electron')
const spawn = require('child_process').spawn;

const {BrowserWindow} = require('electron')
const {ipcMain} = require('electron')

let tray = null
let contextMenu = new Menu();
let notifWin = null;

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
}) // end app.on('ready')


function showMenu(orgs){
  orgs.forEach(org => {
    contextMenu.append(new MenuItem({label: org,  click(){ openOrg(org); }}));
  });
  contextMenu.append(new MenuItem({type: 'separator'}));
  contextMenu.append(new MenuItem({label: 'Refresh', click() { refreshMenu() }}));
  contextMenu.append(new MenuItem({type: 'separator'}));
  contextMenu.append(new MenuItem({label: 'Quit', click() { app.quit() }}));
  tray.setContextMenu(contextMenu)
  // Show our notification via the hidden window
  notifWin.webContents.send('notification', 'Aliases refreshed')
}


function refreshMenu() {
  contextMenu = new Menu();
  getOrgAliases().then(orgs => {
    showMenu(orgs)
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
    var ret = spawn('sfdx', ['force:alias:list', '--json']);
    ret.stdout.on('data', (data) => {
      resolve(JSON.parse(data).results.map(org => {
        return org.alias + " : " + org.value;
      }));
    });
  });
}


function openOrg(org){
  notifWin.webContents.send('notification', 'Your org will open in a new tab shortly')
  let orgAlias = org.split(" : ")[0];
  var ret = spawn('sfdx', ['force:org:open', '-u', orgAlias]);
    ret.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
    });

    ret.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      notifWin.webContents.send('notification', 'Oh dear, something went wrong :(\n' + data)
    });
}
