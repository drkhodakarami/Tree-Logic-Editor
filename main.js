const { app, BrowserWindow } = require('electron');
const { spawn } = require("child_process");
const waitPort = require('wait-port');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  
  win.setMenuBarVisibility(false);
  win.removeMenu();

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(async () => {
  // running Next.js server
  const nextServer = spawn("npm", ["run", "start"], {
    stdio: "inherit",
    shell: true,
  });

  //Wait until 3000 port opens
  await waitPort({ host: 'localhost', port: 3000 });

  createWindow();

  app.on('window-all-closed', () => {
    if (nextServer.pid) {
      nextServer.kill("SIGTERM");
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
