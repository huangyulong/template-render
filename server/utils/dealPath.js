const process = require('process')

module.exports = {

    /**
     * 找出变更的文件所在页面的名字
     * @param {*} filepath 文件目录
     * @returns 文件所在页面名字（在pages目录中的文件夹名字）
     */
    findCurPage: (filepath) => {
        const rootPath = process.cwd()
        const pathname = filepath.replace(rootPath, '')
        const regPagename = /[\w-_\+\.]+\/([\w-_\+\.]+)\//.exec(pathname)

        return regPagename[1] || ''
    },

    /**
     * 找出文件所在的文件夹
     * @param {*} filepath 文件目录
     * @returns 文件所在文件夹目录
     */
    findDir: (filepath) => {
        const lastDirIdx = filepath.lastIndexOf('/')
        return filepath.substring(0, lastDirIdx+1) // 输出文件目录
    },

    /**
     * 获取url请求中的pathname
     * @param {*} url 
     * @returns 
     */
    findUrlPathname: (url) => {
        if(url) {
            let pathnameIdx = url.indexOf('/', 9)
            if(pathnameIdx !== -1) {
                return url.substring(pathnameIdx, )
            }else {
                console.log('dealPath.findUrlPathname: not found url path')
                return ''
            }
        }else {
            console.log('dealPath.findUrlPathname error:   findUrlPathname need a url argument')
            return ''
        }
      

    }
    
}