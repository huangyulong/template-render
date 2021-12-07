const fs = require('fs')
const path = require('path')
const config = require('../configs/config')
const beautify_js = require('js-beautify').js
const beautify_html = require('js-beautify').html
const dealPath = require('../server/utils/dealPath')

function transformServerHtml(html, pageName) {

    let renderTemplate = `const encodeTemplate = '${encodeURI(html.replace(/<!--\s*#(\w+).*-->/ig, ""))}';`
    
    // 服务端生成的内容先不注入ws.js, 因为服务端内容修改后需要重启服务才能看到更新后的内容
    // if(config.mode === 'development') {
    //     renderTemplate = `const encodeTemplate = '${devRenderTemplate(html)}'`
    // }else {
    //     renderTemplate = `const encodeTemplate = '${encodeURI(html.replace(/<!--\s*#(\w+).*-->/ig, ""))}';`
    // }

    let renderHtml = 'let data = {};'

    const reg = /<!--\s*#(\w+).*-->/ig
    let allConfigs = html.match(reg)

    if(allConfigs && allConfigs.length) {

        allConfigs.forEach((item) => {
            const configs = item.replace(/<!--\s*/ig, '').replace(/\s*-->/ig, '').split(/\s+/)
            const type = configs && configs[0] ? configs[0].substring(1,) : ''
            let request = {}
            configs.forEach((item, i) => {
                if(i !== 0) {
                    const kv = item.split('=')
                    request[kv[0]] = kv[1]
                }
            })
        
            // console.log('request==',request)
    
            switch(type) {
                case 'get':
                    renderHtml += (createGetFn(request, 'server', pageName) + '')
                    break;
                case 'post':
                    renderHtml += (createPostFn(request, 'server', pageName) + '')
                    break;
                default: 
                    break;
            }
    
        })
    }

    let serverRender = `
        const axios = require('axios')

        module.exports = async () => {
    `
    serverRender = serverRender + renderTemplate + renderHtml + 
    `
        const template = decodeURI(encodeTemplate)
        ${require(path.join(__dirname, '../server/static/template-engine/'+config.templateEngine.render))().serverRender()}
        return dom
    `
    + '}'

    return beautify_js(serverRender)

}


function transformHtml(html, pageName) {

    // 需要渲染的模板
    let renderTemplate = ''

    // 判断是否是开发环境，开发环境需要加入ws.js(用来做页面更改后刷新浏览器)
    if(config.mode === 'development') {
        renderTemplate = devRenderTemplate(html)
    }else {
        renderTemplate = encodeURI(html.replace(/<!--\s*#(\w+).*-->/ig, ""))
    }

    // 做客户端渲染时服务端发送的页面内容
    let renderHtml = `<!DOCTYPE html>
    <html lang="en">
        <head></head>
        <body>
            <script src="http://localhost:${config.port}/static/template-engine/${config.templateEngine.name}"></script>
            <script>
                const renderTemplate = '${renderTemplate}'
            </script>
            <script>(async function(){let data={};`

    // 检测模板中特殊语法
    const reg = /<!--\s*#(\w+).*-->/ig
    let allConfigs = html.match(reg)

    if(allConfigs && allConfigs.length) {

        allConfigs.forEach((item) => {
            const configs = item.replace(/<!--\s*/ig, '').replace(/\s*-->/ig, '').split(/\s+/)
            const type = configs && configs[0] ? configs[0].substring(1,) : ''
            let request = {}
            configs.forEach((item, i) => {
                if(i !== 0) {
                    const kv = item.split('=')
                    request[kv[0]] = kv[1]
                }
            })
        
            // console.log('request==',request)
    
            switch(type) {
                case 'get':
                    renderHtml += (createGetFn(request, 'client', pageName) + '')
                    break;
                case 'post':
                    renderHtml += (createPostFn(request, 'client', pageName) + '')
                    break;
                default: 
                    break;
            }
    
        })
    }


    renderHtml += `
        const template = decodeURI(renderTemplate)
        ${require(path.join(__dirname, '../server/static/template-engine/'+config.templateEngine.render))().clientRender()}
        document.write(dom)
        })()
    </script>
    </body>
    </html>
    `

    return beautify_html(renderHtml)

}

// dev环境时模板中要注入内容，生成新的模板
function devRenderTemplate(html) {
    // 注入ws.js
    const injectWsJs = `<script src="http://localhost:${config.port}/static/ws.js"></script>`

    // 将模板中的特殊语法去掉
    let newHtml = html.replace(/<!--\s*#(\w+).*-->/ig, '')
    const bodyDomEnd = newHtml.indexOf('</body>')
    newHtml = newHtml.substring(0, bodyDomEnd) + injectWsJs + newHtml.substring(bodyDomEnd, )

    return encodeURI(newHtml)

}


function createGetFn(request, renderType, pageName) {

    // console.log(request)
    let url = request.url
    if(request.url && config.mock) {
        let pathName = dealPath.findUrlPathname(request.url)
        url = `http://localhost:${config.port}/mock/${pageName}${pathName}`
    }

    if(renderType === 'client') {
        return `
            function get_${request.id}() {
                return new Promise((resolve, reject) => {
                    fetch('${url}').then((res) => res.json())
                    .then((response) => {
                        resolve(${request.data})
                    }).catch((err) => {
                        console.log(err)
                        reject(err)
                    })
                })
            }

            data['${request.id}'] = await get_${request.id}()
        `
    }else if(renderType === 'server') {
        return `
            function get_${request.id}() {
                return new Promise((resolve, reject) => {
                    axios({method: 'GET', url: '${url}'})
                        .then((res) => {
                            let response = res.data
                            resolve(${request.data})
                        }).catch((err) => {
                            console.log(err)
                            reject(err)
                        })
                })
            }

            data['${request.id}'] = await get_${request.id}()
        
        `

    }else {
        return ''
    }

  
}

function createPostFn(request, renderType, pageName) {

    // console.log(request)
    let url = request.url

    if(request.url && config.mock) {
        let pathName = dealPath.findUrlPathname(request.url)
        url = `http://localhost:${config.port}/mock/${pageName}${pathName}`
    }

    if(renderType === 'client') {
        return `
            function post_${request.id}() {
                return new Promise((resolve, reject) => {
                    fetch('${url}',{
                        method: 'POST',
                        header:${request.header},
                        body: ${request.body}
                    }).then((res) => res.json())
                    .then((response) => {
                        resolve(${request.data})
                    }).catch((err) => {
                        console.log(err)
                        reject(err)
                    })
                })
            }

            data['${request.id}'] = await post_${request.id}()
        `
    }else if(renderType === 'server') {
        return `
            function post_${request.id}() {
                return new Promise((resolve, reject) => {
                    axios({
                        method: 'POST',
                        url: '${url}',
                        header:${request.header},
                        data: ${request.body}
                    })
                    .then((res) => {
                        let response = res.data
                        resolve(${request.data})
                    }).catch((err) => {
                        console.log(err)
                        reject(err)
                    })
                })
            }

            data['${request.id}'] = await post_${request.id}()
        `
    }else {
        return ''
    }

    
}

exports.transformHtml = transformHtml
exports.transformServerHtml = transformServerHtml
