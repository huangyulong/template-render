const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const process = require('process')
const { execSync } = require('child_process')
const {transformHtml, transformServerHtml} = require('./compilerHtml')
const config = require('../configs/config')
const dealPath = require('../server/utils/dealPath')

const rootPath = process.cwd()

let gulpPlugin = {}

// 将配置文件中的plugins转换为对象
function dealConfig() {
    if(Array.isArray(config.plugins)) {
        config.plugins.forEach((item) => {
            gulpPlugin[item.test] = item.plugin
        })
    }
}

dealConfig()

// 将pages文件夹内容复制到dist目录
function copySrcToDist() {
    execSync('cp -r '+path.join(__dirname, '../pages/')+' ' +path.join(__dirname, '../dist/'))
}

// 解析文件扩展名
function findFileExtension(filePath) {
    const lastPoint = filePath.lastIndexOf('.')
    let extension = ''
    if(lastPoint !== -1) {
        extension = filePath.substring(lastPoint+1, )
    }
    return extension
}


// 编译文件
function compilerOne(filePath, type) {
    if(!(fs.existsSync(filePath) && fs.statSync(filePath).isFile())) { return }
    if(/\.DS_Store/.test(filePath)) { return }

    const filePathname = filePath.replace(rootPath, '')
    const pageName = dealPath.findCurPage(filePath)

    // 记录编译时间
    if(!type) {
        console.time('compiler time')  
    }
    console.log(chalk.blue('compiler: ' + filePathname +' ...'))
   
    // console.log('filePath===',filePath)
    const targetFilePath = filePath // 编译目标文件路径
    const outputFilePath = filePath.replace('pages', 'dist') // 编译后输出文件路径
    const outputPath =  dealPath.findDir(outputFilePath)  // 输出文件目录
    // console.log('outputPath===',outputPath)

    // 判读文件夹是否存在
    if(!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
    }

    const extension =  findFileExtension(filePath)
    // console.log(filePath)
    // console.log(extension)

    if(extension === 'html') {
        // 对于html单独进行编译
        const html = fs.readFileSync(targetFilePath, 'utf8')
        const newHtml = transformHtml(html, pageName)
        const serverHtml = transformServerHtml(html, pageName)
        fs.writeFileSync(outputFilePath, newHtml)
        fs.writeFileSync(outputPath+'/server.js', serverHtml)
    }else if(gulpPlugin.hasOwnProperty(extension)) {
        // 配置了插件的执行插件
        execSync(`./node_modules/.bin/gulp --env ${targetFilePath}=${outputPath} -f ./compiler/gulpCompiler.js ${extension}`)
    }else {
        // 没配置的直接拷贝到输出目录
        fs.copyFileSync(targetFilePath, outputFilePath);
    }

    console.log(chalk.blue('compiler: ' + filePathname + '  success '))
    if(!type) {
        console.timeEnd('compiler time')
    }
   
}

// 初次启动服务时遍历所有文件进行编译
function initCompiler() {
    if(!fs.existsSync(path.join(__dirname, '../dist'))) {
        fs.mkdirSync(path.join(__dirname, '../dist'))
    }

    console.time('time')
    console.log(chalk.cyan('compiler start ...'))

    const readDir = (dir) => {
        if(!(fs.statSync(dir).isDirectory())) {
            return 
        }

        const files = fs.readdirSync(dir)
        files.forEach((item) => {
            if(fs.statSync(path.join(dir, item)).isDirectory()) {
                readDir(path.join(dir, item))
            }else {
                compilerOne(path.join(dir, item), 'init')
            }
        })
        
    }

    readDir(path.join(__dirname, '../pages'))

    console.log(chalk.green('compiler success'))
    console.timeEnd('time')

}

// initCompiler()

// execSync(`./node_modules/.bin/gulp --env /Users/huangyulong/work/workProject/project/nextjs/mynext/pages/home/index.js=/Users/huangyulong/work/workProject/project/nextjs/mynext/dist/home/ -f ./compiler/gulpCompiler.js js`)


function compiler(path) {
    if(!path) {
        initCompiler()
    }else {
        compilerOne(path)
    }
}

module.exports = compiler
