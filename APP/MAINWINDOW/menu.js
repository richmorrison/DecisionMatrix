const { Menu, BrowserWindow } = require('electron');

const MenuDefinition = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        click: () => BrowserWindow.getFocusedWindow().send('new'),
      },
      {
        label: 'Open',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-open'),
      },
      {
        label: 'Save',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-save'),
      },
      {
        label: 'Save As',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-save-as'),
      },
      {
        label: 'Exit',
        role: 'close',
      },
    ],
  },
  {
    label: 'Export',
    submenu: [
      {
        label: 'Export PDF',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-gen-pdf'),
      },
      {
        label: 'Export PNG',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-gen-png'),
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Help',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-show-help'),
      },
      {
        label: 'About',
        click: () => BrowserWindow.getFocusedWindow().send('trigger-show-about'),
      },
    ],
  },
];

module.exports = Menu.buildFromTemplate(MenuDefinition);
