const { parallel } = require('gulp')
const config = require('../configs/config')

let srcPath = '' // '../pages/**/*.'+process.argv[6]
let outputPath = '' // '../dist/'
if(process.argv[2] === '--env') {
    const paths = process.argv[3].split('=')
    srcPath = paths[0]
    outputPath = paths[1]
}

let parallelArgs = []

config.plugins.forEach((item) => {
    parallelArgs.push(require('./gulpPlugins/'+item.plugin)(srcPath, outputPath))
    exports[item.test] = require('./gulpPlugins/'+item.plugin)(srcPath, outputPath)
})

exports.default = parallel(parallelArgs)