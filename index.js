import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs';
import { spawn } from 'child_process';
import sqlite3 from'sqlite3';
import path from "path";
let win;
let sqliteVerbose = sqlite3.verbose();

// データベースファイルのパスを設定
const dbPath = path.join(app.getPath('userData'), 'data.db');
const dbExists = fs.existsSync(dbPath);
const db = new sqliteVerbose.Database(dbPath);
// テーブルの作成
if (!dbExists) {
    db.run("CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL)");
}

function createWindow() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: join(__dirname, 'preload.mjs')
        },
        show: false
    });

    const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

    win.loadFile('index.html');

    // ファイルを選択して読み込む
    ipcMain.handle('open-file-dialog', async (event) => {
        console.log("open file dialog");
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        if (result.canceled) {
            return null;
        } else {
            const filePath = result.filePaths[0];
            const content = fs.readFileSync(filePath, 'utf8');
            return content;
        }
    });

    // ファイルに書き込む
    ipcMain.handle('save-file-dialog', async (event, content) => {
        console.log("save file dialog");
        const result = await dialog.showSaveDialog({
            title: 'Save your file',
            defaultPath: path.join(app.getPath('desktop'), 'MyNewFile.txt'),
            buttonLabel: 'Save',
            filters: [
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        if (result.canceled) {
            return false;
        } else {
            fs.writeFileSync(result.filePath, content, 'utf8');
            return true;
        }
    });

    // テキストをデータベースに保存
    ipcMain.handle('save-text', async (event, text) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO Messages (text) VALUES (?)", text, function (err) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(this.lastID); // 保存したレコードのIDを返す
                }
            });
        });
    });

    // データベースからテキストを取得
    ipcMain.handle('get-text', async () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT text FROM Messages", [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(rows.map(row => row.text)); // すべてのテキストを配列で返す
                }
            });
        });
    });

    win.on('close', (event) => {
        event.preventDefault();  // ウィンドウのクローズをキャンセル
        win.hide();  // ウィンドウを隠す
    });

    win.on('minimize', (event) => {
        event.preventDefault();
        win.hide();
    });

    win.on('restore', () => {
        win.show();
    });
}



app.whenReady().then(() => {
    createWindow();

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log("all closed");
        app.quit();
    }
});

app.on('will-quit', () => {
    hotkeys.stop();
});

// アプリの再表示
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else {
        win.show();
    }
});


// Pythonバイナリのパス
const pathToBinary = './dist/test';

// 関数名とデータ
const functionName = 'func1';
const data = JSON.stringify({ message: "Hello from Electron!" });

// Pythonプロセスの起動
const pythonProcess = spawn(pathToBinary, [functionName, JSON.stringify(data)]);

// 標準出力の取得
pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// エラー処理
pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// プロセス終了時の処理
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});