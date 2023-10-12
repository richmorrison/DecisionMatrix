const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    
    new: () => ipcRenderer.invoke('new'),
    triggerNew: (callback) => ipcRenderer.on('new', callback),
    
    open: () => ipcRenderer.invoke('open'),
    triggerOpenrequest: (callback) => ipcRenderer.on('trigger-open', callback),
    
    save: (data) => ipcRenderer.invoke('save', data),
    triggerSaverequest: (callback) => ipcRenderer.on('trigger-save', callback),
    
    saveAs: (data) => ipcRenderer.invoke('save-as', data),
    triggerSaveAsrequest: (callback) => ipcRenderer.on('trigger-save-as', callback),

    genPDF: (width, height) => ipcRenderer.invoke('gen-pdf', width, height),
    triggerGenPDFrequest: (callback) => ipcRenderer.on('trigger-gen-pdf', callback),

    genPNG: (width, height) => ipcRenderer.invoke('gen-png'),
    triggerGenPNGrequest: (callback) => ipcRenderer.on('trigger-gen-png', callback),

    showHelp: () => ipcRenderer.invoke('show-help'),
    triggerShowHelp: (callback) => ipcRenderer.on('trigger-show-help', callback),

    showAbout: () => ipcRenderer.invoke('show-about'),
    triggerShowAbout: (callback) => ipcRenderer.on('trigger-show-about', callback),

    resizeWindow: (width, height) => ipcRenderer.invoke('resize-window', width, height),

    notifyUnsaved: () => ipcRenderer.invoke('notify-unsaved'),
})
