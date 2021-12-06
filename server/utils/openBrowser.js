const child_process = require('child_process')

function openBrowser (url) {
    switch(process.platform) {
        case 'darwin':
            child_process.exec(`open ${url}`)
            break;
        case 'win32':
            child_process.exec(`start ${url}`)
            break;
        default:
            child_process.exec(`xdg-open ${url}`)
            break;
    }
}

module.exports = openBrowser