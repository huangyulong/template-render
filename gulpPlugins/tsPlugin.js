const { src, dest } = require('gulp')
const ts = require('gulp-typescript')

function tsPlugin (srcPath, outputPath) {
    return () => src(srcPath)
        .pipe(ts())
        .pipe(dest(outputPath))
}

module.exports = tsPlugin