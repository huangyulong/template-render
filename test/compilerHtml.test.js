const { transformServerHtml } = require('../compiler/compilerHtml')
const path = require('path')
const fs = require('fs')

const filepath = path.join(__dirname, '../pages/page1/index.html')
const output = path.join(__dirname, '../dist/page1/server.js')

const html = fs.readFileSync(filepath, 'utf8')

const dom = transformServerHtml(html)

fs.writeFileSync(output, dom)


