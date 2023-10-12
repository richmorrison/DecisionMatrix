// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const customMenu = require('./MAINWINDOW/menu.js');
const path = require('path')
const fs = require('fs');
const details = require("./applicationDetails.js");
const domain = require('./DOMAIN/domain.js');
let crypto = require('crypto');

let filename = undefined;

if (require('electron-squirrel-startup')) app.quit();

let unsaved = false;
const notifiedUnsaved = function() {
  unsaved = true;
}

const getDetail = async function (event, str) {
  return new Promise( (resolve, reject) => {
    resolve(details[str]);
    return;
  } );
}

const openExternal = async function(event, url) {
  shell.openExternal(url, {activate: true} );
}

const showAboutDialog = function(event) {
  
  const options = {
    type: 'info',
    defaultId: 1,
    message: details.name,
    detail: 'Version '+details.version+' '+details.releaseTag+
            '\n\u00A9 '+details.author+' '+details.copyrightDate+
            '\n\nPlatform/Arch: '+details.platform+'/'+details.arch+
            '\nCommit: '+details.commit,
  };
  
  const response = dialog.showMessageBoxSync(options);
}

const showContinueWithUnsavedDialog = function(win, verb='continue') {
  
  if( !unsaved ) return true;
  
  const options = {
    type: 'warning',
    buttons: [verb.charAt(0).toUpperCase()+verb.slice(1)+' without saving', 'Cancel'],
    defaultId: 1,
    message: 'You have unsaved changes!',
    detail: 'Do you wish to '+verb.charAt(0).toLowerCase()+verb.slice(1)+' without saving?',
  };
  
  const response = dialog.showMessageBoxSync(win, options);
  
  return response==0;
}

const newFile = async function(event) {

  return new Promise( (resolve, reject) => {
    
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    
    if( !showContinueWithUnsavedDialog(win) ) {
      reject("Cancelled");
      return;
    }
    
    const thisFilename = undefined;
    
    resolve(
      domain.emptyTable()
    );
    
    unsaved = false;
    return;
  });
}

const open = async function(event, data) {

  return new Promise( (resolve, reject) => {
    
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if( !showContinueWithUnsavedDialog(win) ) {
      reject("Cancelled");
      return;
    }
    
    const options = {
      properties: ["openFile"],
      filters: [{
        name: details.name,
        extensions: [details.fileExtension]
      }],
    }
    
    const dialogResponse = dialog.showOpenDialogSync(win, options);
    const thisFilename = dialogResponse ? dialogResponse[0] : undefined;
    
    if(!thisFilename){
      reject("File open error");
      return;
    } else {
      fileRead(resolve, reject, thisFilename);
      return;
    }
  });
}

const save = async function(event, data) {
  
  if(!filename){
    return saveAs(event, data);
  } else {
    return new Promise( (resolve, reject) => {
      fileWrite(resolve, reject, filename, data);
      return;
    });
  }
}

const saveAs = async function (event, data) {

  return new Promise( (resolve, reject) => {
  
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    
    const options = {
      filters: [{
        name: details.name,
        extensions: [details.fileExtension]
      }],
    }
    
    let thisFilename = dialog.showSaveDialogSync(win, options);    
    if(!thisFilename){
      reject("File select error");
      return;
    } else {
      
      if( path.extname(thisFilename)!='.'+details.fileExtension ) {
        thisFilename+='.'+details.fileExtension;
      }
      
      fileWrite(resolve, reject, thisFilename, data);
      return;
    }
  });
}

const fileWrite = function (resolve, reject, fname, data, encode=encodeData) {
  try {
    const contents = encode(data);
    fs.writeFileSync(fname, contents);
    resolve();
    filename = fname;
    unsaved = false;
    return;
  } catch(err) {
    reject(err);
    dialog.showErrorBox("Error writing file", err.message);
    throw err;
    return;
  }
}

const fileRead = function (resolve, reject, fname, decode=decodeData) {
  try {
    const contents = fs.readFileSync(fname, 'utf8');
    const data = decode(contents);
    resolve(data);
    filename = fname;
    unsaved = false;
    return;
  } catch(err) {
    reject(err);
    dialog.showErrorBox("Error reading file", err.message);
    throw err;
    return;
  }
}

const hash = function(s) {
  const salt = 'ff44a5b4c455dae22beaeb2de68b631cffec3770222757abd813375c1d5b5981';
  return crypto.createHash('sha256').update(s+salt).digest('hex');
}

const packaged = function (data) {
  try {
    const serialised = JSON.stringify(data, null, 2);
    const packaged = {
      data: serialised,
      checksum: hash(serialised),
    }
    return packaged;
  } catch(err) {
    throw new Error(err.message);
  }
}

const unpackaged = function (data) {
  if( data.checksum != hash(data.data) ) {
    throw new Error("Data corrupt");
  }
  try {
    return JSON.parse(data.data);
  } catch(err) {
    throw new Error(err.message);
  }
}

const encodeData = function (data) {
  try {
    return btoa(
      JSON.stringify(
        packaged(data),
        null,
        2
      )
    );
  } catch(err) {
    throw new Error(err.message);
  }
}

const decodeData = function (data) {
  try {
    return unpackaged(
      JSON.parse(
        atob(data)
      )
    );
  } catch(err) {
    throw new Error(err.message);
  }
}

const resizeWindow = async function (event, width, height) {
  return new Promise( (resolve, reject) => {
    try {
      const webContents = event.sender;
      const win = BrowserWindow.fromWebContents(webContents);
      win.setSize(width, height);
      resolve();
    } catch {
      reject("Window resize error");
    }
    return;
  });
}

const handleGenPNG = async function (event) {
  
  return new Promise( (resolve, reject) => {
  
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);

    const dialogOptions = {
      title: 'Export to png',
      buttonLabel: 'Export',
      extensions: ['png'],
    };

    let pngFilename = dialog.showSaveDialogSync(win, dialogOptions);
    if(!pngFilename) {
      reject("File select error");
      return;
    }
    if( path.extname(pngFilename)!='.png' ) {
      pngFilename+='.png';
    }
    
    webContents.capturePage().then( image => {

      fileWrite(resolve, reject, pngFilename, image.toPNG(), (image)=>{return image;} );
      return;

    }).catch(error => {
      reject(error);
      dialog.showErrorBox("Error generating png", error.message);
      return;
    });
  
  });
}

const handleGenPDF = async function (event, width, height) {
  
  return new Promise( (resolve, reject) => {
  
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    
    const dialogOptions = {
        title: 'Export to PDF',
        buttonLabel: 'Export',
        extensions: ['pdf'],
    };
    
    let PDFfilename = dialog.showSaveDialogSync(win, dialogOptions);
    if(!PDFfilename) {
      reject("File select error");
      return;
    }
    if( path.extname(PDFfilename)!='.pdf' ) {
      PDFfilename+='.pdf';
    }
    
    const pdfOptions = {
      marginsType: 0,
      //pageSize: 'A4',
      pageSize: {width: width, height: height},
      printBackground: true,
      printSelectionOnly: false,
      landscape: false
    };
    
    win.webContents.printToPDF(pdfOptions).then(data => {
      fileWrite(resolve, reject, PDFfilename, data, (data)=>{return data;} );
      return;
    }).catch(error => {
      reject(error);
      dialog.showErrorBox("Error generating pdf", error.message);
      return;
    });
  
  });
}

const createHelpWindow = () => {

  let options = {
    webPreferences: {
      preload: path.join(__dirname, 'HELPWINDOW/preload.js')
    }
  };

  if(details.platform==='linux') {
    options['icon'] = './icons/instruction-icon.png';
  }

  if (details.platform === 'win32') {
    options['icon'] = './icons/positive-feedback-icon.ico';
  };

  const helpWindow = new BrowserWindow(options);
  helpWindow.setMenu(null);
  helpWindow.loadFile('APP/HELPWINDOW/helpWindow.html');
  
  // Open the DevTools.
  // helpWindow.webContents.openDevTools();
}

const createMainWindow = () => {

  let options = {
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'MAINWINDOW/preload.js')
    }
  };

  if(details.platform==='linux') {
    options['icon'] = './icons/positive-feedback-icon.png';
  };

  if (details.platform === 'win32') {
    options['icon'] = './icons/positive-feedback-icon.ico';
  };

  // Create the browser window.
  const mainWindow = new BrowserWindow(options);
  
  mainWindow.setMenu(customMenu);
  
  mainWindow.on('close', (event)=>{
    if( !showContinueWithUnsavedDialog(mainWindow, 'exit') ) {
      event.preventDefault();
    }
  });
  
  // and load the index.html of the app.
  mainWindow.loadFile('APP/MAINWINDOW/mainWindow.html');
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
  ipcMain.handle('gen-pdf', handleGenPDF);
  ipcMain.handle('gen-png', handleGenPNG);
  ipcMain.handle('new', newFile);
  ipcMain.handle('open', open);
  ipcMain.handle('save', save);
  ipcMain.handle('save-as', saveAs);
  ipcMain.handle('show-help', createHelpWindow);
  ipcMain.handle('show-about', showAboutDialog);
  ipcMain.handle('resize-window', resizeWindow);
  ipcMain.handle('notify-unsaved', notifiedUnsaved);
  ipcMain.handle('open-external', openExternal);
  ipcMain.handle('get-detail', getDetail);
  
  createMainWindow();
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


