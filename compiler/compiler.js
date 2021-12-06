// import loader from '../loaders/transfrom'
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

function transform(str) {
    const getFn = `
    <script>
        function getFn() {
            fetch('http://localhost:3000').then((response) => response.json()).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
        }
    </script>
    `
    return str.replace(/<!-- #get -->/g, getFn)

}

// 将pages文件夹内容复制到dist目录
function copySrcToDist() {
    execSync('cp -r '+path.join(__dirname, '../pages/')+' ' +path.join(__dirname, '../dist/'))
}

// 执行babel命令编译js文件
function babelJs(filePath) {
    if(filePath) {
        execSync(`./node_modules/.bin/babel ${targetFilePath} --out-dir ${writeDir}`)
    }else {
        execSync('./node_modules/.bin/babel pages --out-dir dist')
    }  
}

// less sass

function compilerAll() {
    const allPages = fs.readdirSync(path.join(__dirname, '../pages'))

    if(!fs.existsSync(path.join(__dirname, '../dist'))) {
        fs.mkdirSync(path.join(__dirname, '../dist'))
    }

    copySrcToDist()
    babelJs()

    allPages.forEach((item) => {
        const targetFilePath = path.join(__dirname, '../pages/'+item+'/index.html')
        const outputFilePath = path.join(__dirname, '../dist/'+item+'/')
        const html = fs.readFileSync(targetFilePath, 'utf8')
        // console.log('html=',html)
        const newHtml = transform(html)
        if(!fs.existsSync(outputFilePath)) {
            fs.mkdirSync(outputFilePath)
        }
        fs.writeFileSync(outputFilePath+'index.html', newHtml)
    })
}

function findFileExtension(filePath) {
    const lastPoint = filePath.lastIndexOf('.')
    let extension = ''
    if(lastPoint !== -1) {
        extension = filePath.substring(lastPoint+1, )
    }
    return extension
}

function compilerOne(filePath) {
    const targetFilePath = filePath
    const outputFilePath = filePath.replace('pages', 'dist')

    const extension =  findFileExtension(filePath)
    console.log('---compilerone---')
    console.log(filePath)
    console.log(extension)

    switch(extension) {
        case 'html':
            const html = fs.readFileSync(targetFilePath, 'utf8')
            const newHtml = transform(html)
            fs.writeFileSync(outputFilePath,newHtml)
            break;
        case 'js':
            babelJs(targetFilePath, outputFilePath)
            break;
        default:
            fs.copyFileSync(targetFilePath, outputFilePath);
    }
   
}

function compiler(path) {
    if(!path) {
        compilerAll()
    }else {
        compilerOne(path)
    }
}

module.exports = compiler






