const {Menu, BrowserWindow} = require('electron')

var template = [//模板
    {
        label: '四季',
        submenu: [
            {
                label: "春天",
                accelerator: `ctrl+s`,//快捷键是:ctrl+s
                click: () => {
                    win = new BrowserWindow({
                        width: 500,
                        height: 500,
                        webPreferences: {nodeIntegration: true}
                    })
                    win.loadFile('red.html')
                    win.on('closed', () => {
                        win = null
                    })
                }
            },
            {label: "夏天"},
            {label: "秋天"},
            {label: '冬天'}
        ]

    },
    {
        label: '两天',
        submenu: [
            {label: '白天'},
            {label: '黑天'}
        ]
    }
]

var menu = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(menu)
