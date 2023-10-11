const {app, BrowserWindow, screen, globalShortcut, Tray, Menu} = require('electron');
const localShortcut = require('electron-localshortcut');

let win;

function createWindow() {
    const {height} = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width: 640,
        height: height,
        icon: 'res/icon.ico',
        webPreferences: {
            nodeIntegration: false
        },
        autoHideMenuBar: true
    })

    // Load the web
    win.loadURL('https://chat.openai.com/').then(() => {
    });

    // hotkey to focus on the prompt input box
    localShortcut.register(win, 'CmdOrCtrl+I', () => {
        if (win) {
            win.webContents.executeJavaScript(focusInput('prompt-textarea')).then(() => {
            });
        }
    })

    win.on('close', () => {
        localShortcut.unregisterAll(win);
        console.log("All local shortcuts unregistered.")
    });
}

// If the window is focused, minimize it, otherwise show it
function toggleWindow() {
    if (win) {
        if (win.isFocused()) {
            win.minimize();
        } else {
            win.show();
        }
    } else {
        createWindow();
    }
}

// Simulate clicking a button with a certain ID
function clickButton(buttonId) {
    return `
        const button = document.getElementById("${buttonId}");
        if (button) button.click();
    `;
}

// Simulate focusing on an input box with a certain ID
function focusInput(inputId) {
    return `
        const input = document.getElementById("${inputId}");
        if (input) input.focus();
    `;
}

app.whenReady().then(() => {
    tray = new Tray("res/icon.ico")
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                win.show();
            }
        },
        {
            label: 'Quit', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);

    createWindow();

    // Hotkey to show/hide the windows
    globalShortcut.register('CmdOrCtrl+Alt+Shift+C', toggleWindow);
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    console.log("All global shortcuts unregistered.")
});