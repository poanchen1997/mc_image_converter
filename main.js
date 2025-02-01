const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { processImage, CountImage, sortAlternatives } = require('./src/imageProcessor');
const { generateNBT } = require('./src/nbtGenerator');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
});

ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }] });
    return result.filePaths[0] || null;
});

ipcMain.handle('process-image', async (_, filePath, scale) => {
    return await processImage(filePath, scale);
});

ipcMain.handle('generate-nbt', async (_, blockData) => {
    return await generateNBT(blockData);
});

ipcMain.handle('estimate', async (_, blockData) => {
    return await CountImage(blockData);
});

ipcMain.handle('sort-alternatives', async (_, alternatives) => {
    return await sortAlternatives(alternatives);
});