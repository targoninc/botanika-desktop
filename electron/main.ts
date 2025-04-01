import path from 'path'
import { app } from 'electron'
import {createWindow} from "../src/server-utils";

console.log('Starting app...');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

if (!app.requestSingleInstanceLock()) {
  console.log('App already running');
  app.quit()
  process.exit(0)
}

app.on('window-all-closed', () => {
  console.log('Window closed');
  app.quit()
})

app.whenReady().then(() => {
  console.log('App ready');
  createWindow()
})
