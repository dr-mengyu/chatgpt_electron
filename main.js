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
            win.webContents.executeJavaScript(focusInput()).then(() => {
            });
        }
    })

    // hotkey to open/close sidebar
    localShortcut.register(win, 'CmdOrCtrl+Tab', () => {
        if (win) {
            win.webContents.executeJavaScript(toggleSidebar()).then(() => {
            })
        }
    })

    win.on('close', () => {
        localShortcut.unregisterAll(win);
        console.info("All local shortcuts unregistered.")
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

function toggleSidebar() {
    return `
        (() => {
            const allSpansWithSrOnly = Array.from(document.querySelectorAll('span.sr-only'));
        
            const closeButton = allSpansWithSrOnly.find(s => {
                return s.outerText === 'Close sidebar';
            })
            if (closeButton) {
                console.debug("Close sidebar.");
                closeButton.click();
            } else {
                const openButton = allSpansWithSrOnly.find(s => {
                    return s.outerText === 'Open sidebar';
                })
                if (openButton) {
                    console.debug("Open sidebar.");
                    openButton.click();
                } else {
                    console.debug('No sidebar button found. All sr-only spans: ', allSpansWithSrOnly);
                }
            }
        }) ();
    `
}

// focusing on the prompt input box
function focusInput() {
    return `
        (() => {
            const input = document.getElementById("prompt-textarea");
            if (input) {
                console.debug("Focus on prompt input.");
                input.focus();
            }
        }) ();
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
    console.info("All global shortcuts unregistered.")
});