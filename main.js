const electron = require('electron')
const {app, Menu, MenuItem, Tray} = require('electron')
const spawn = require('child_process').spawn;

let tray = null
app.on('ready', () => {
  tray = new Tray(app.getAppPath() + '/img/tray-icon.png')
  const contextMenu = new Menu();

  getOrgAliases().then(function(orgs){
    // console.log("orgs", orgs);
    orgs.forEach(function(org){
      // console.log("org", org);
      contextMenu.append(new MenuItem({label: org,  click(){ openOrg(org); }}));
    });
      contextMenu.append(new MenuItem({type: 'separator'}));
      contextMenu.append(new MenuItem({label: 'Quit', click() { app.quit() }}));

      tray.setToolTip('This is my application.')
      tray.setContextMenu(contextMenu)
  }).catch(function(e){
    contextMenu.append(new MenuItem({type: 'separator'}));
    contextMenu.append(new MenuItem({label: 'Quit', click() { app.quit() }}));

    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    // console.error(e);
  });


})


function getOrgAliases(){
  return new Promise(function(resolve, reject) {
    var ret = spawn('sfdx', ['force:alias:list', '--json']);
    ret.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
      resolve(JSON.parse(data).results.map(function(org){
        return org.alias + " : " + org.value;
      }));
    });
  });
}

function openOrg(org){
  // console.log(org);
  let orgAlias = org.split(" : ")[0];
  // console.log("orgAlias", orgAlias);

  var ret = spawn('sfdx', ['force:org:open', '-u', orgAlias]);
    ret.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
    });

    ret.stderr.on('data', (data) => {
      // console.error(`stderr: ${data}`);
    });
}