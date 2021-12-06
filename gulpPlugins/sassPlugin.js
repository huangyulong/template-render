const { src, dest } = require('gulp')
const sass = require('gulp-sass')(require('sass'))

function sassPlugin (srcPath, destPath) {
    return () => src(srcPath)
        .pipe(sass().on('error', sass.logError))
        .pipe(dest(destPath))
}

module.exports = sassPlugin