const { src, dest } = require('gulp')
const gulpBabel = require('gulp-babel')

function dealJs(srcPath, destPath) {
    return () => src(srcPath)
        .pipe(gulpBabel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest(destPath))
}

module.exports = dealJs