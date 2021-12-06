const fs = require('fs')
const path = require('path')
const config = require('../configs/config')

const renderType = 'client'

function parseHtml_bak(html) {
    // 拿到基础页面除body以外的部分，模板渲染只是body部分
    const findBodyStart = html.indexOf('<body>')
    const findBodyEnd = html.indexOf('</body>')
    const findHeadEnd = html.indexOf('</head>')
    let htmlStart = html.substring(0, findHeadEnd)
    const htmlMiddle = html.substring(findHeadEnd, findBodyStart+6)
    const htmlEnd = html.substring(findBodyEnd, )
    const template =`
    <script>
        const template =\`${html.substring(findBodyStart+6, findBodyEnd)}\` 
    </script>`

    let scriptContent = `<script>
    (async function() { 
        let data = {};
    `
    const reg = /<!--\s*#(\w+).*-->/ig
    let allConfigs = html.match(reg)
    console.log(allConfigs)

    allConfigs.forEach((item) => {
        const configs = item.replace(/<!--\s*/ig, '').replace(/\s*-->/ig, '').split(/\s+/)
        console.log('--configs--', configs)
        const type = configs && configs[0] ? configs[0].substring(1,) : ''
        let request = {}
        configs.forEach((item, i) => {
            if(i !== 0) {
                const idx = item.indexOf('=')
                request[item.substring(0, idx)] = item.substring(idx+1,)
            }
        })
    
        console.log(request)

        // console.log('--type--', type)
        switch(type) {
            case 'get':
                scriptContent += (createGetFn(request) + '')
                break;
            case 'post':
                scriptContent += (createPostFn(request) + '')
                break;
            default: 
                break;
        }

    })

    scriptContent += 
    `   const handleTemplate = Handlebars.compile(template)
        const dom = handleTemplate(data)
        document.querySelector('body').innerHTML = dom
    }())
    </script>`

    return htmlStart + `<script src="http://localhost:${config.port}/static/ws.js"></script><script src="http://localhost:${config.port}/static/handlebars.js"></script>` +
        htmlMiddle + template + scriptContent + htmlEnd
    
}


function parseHtml(html) {
    // 拿到基础页面除body以外的部分，模板渲染只是body部分
    const findBodyStart = html.indexOf('<body>')
    const findBodyEnd = html.indexOf('</body>')
    const findHeadEnd = html.indexOf('</head>')
    let htmlStart = html.substring(0, findHeadEnd)
    const htmlMiddle = html.substring(findHeadEnd, findBodyStart+6)
    const htmlEnd = html.substring(findBodyEnd, )

    ////////

    const baseHtml = '<!DOCTYPE html><html><head></head><body>'

    const template =`<script>const template ='${encodeURI(html.replace(/<!--\s*#(\w+).*-->/ig, ''))}'</script>`

    const bodyFirstScriptIdx = html.indexOf('<script', findBodyStart)
    html = html.substring(0, bodyFirstScriptIdx) + `<script src="http://localhost:${config.port}/static/ws.js" ></script>` +
        html.substring(bodyFirstScriptIdx, )
  


    let scriptContent = `<script>
    (async function() { 
        let data = {};
    `
    const reg = /<!--\s*#(\w+).*-->/ig
    let allConfigs = html.match(reg)
    console.log(allConfigs)

    allConfigs.forEach((item) => {
        const configs = item.replace(/<!--\s*/ig, '').replace(/\s*-->/ig, '').split(/\s+/)
        console.log('--configs--', configs)
        const type = configs && configs[0] ? configs[0].substring(1,) : ''
        let request = {}
        configs.forEach((item, i) => {
            if(i !== 0) {
                const kv = item.split('=')
                request[kv[0]] = kv[1]
            }
        })
    
        console.log(request)

        // console.log('--type--', type)
        switch(type) {
            case 'get':
                scriptContent += (createGetFn(request) + '')
                break;
            case 'post':
                scriptContent += (createPostFn(request) + '')
                break;
            default: 
                break;
        }

    })

    scriptContent += 
    `   
        const renderDOM = decodeURI(template)
        const handleTemplate = Handlebars.compile(renderDOM)
        data = {
            pageInfo: {
                title: '日媒：岸田文雄与欧洲理事会主席米歇尔通话，还扯起了所谓“中国动向”',
                subTitle: '【环球网报道】共同社消息',
                content: '【环球网报道】共同社消息，日本首相岸田文雄29日与欧洲理事会主席米歇尔进行了约20分钟的电话会谈，双方一致同意为实现所谓“自由开放的印度太平洋”切实推进合作。米歇尔原计划访问日本并于当天在东京与岸田举行会谈，但鉴于欧洲等地新冠疫情扩大而推迟访日。'        
            },
            list: [
                {label: 'aaaaaaa', value: 'lsfdsfjdklsfds'},
                {label: 'aaaaaaa', value: 'lsfdsfjdklsfds'},
                {label: 'aaaaaaa', value: 'lsfdsfjdklsfds'},
                {label: 'aaaaaaa', value: 'lsfdsfjdklsfds'},
                {label: 'aaaaaaa', value: 'lsfdsfjdklsfds'},
            ]
        }
        const dom = handleTemplate(data)
        document.write(dom)
    }())
    </script>`

    return baseHtml + `<script src="http://localhost:${config.port}/static/handlebars.js" ></script>` +
        template + scriptContent + '</body></html>'
    
}




function createGetFn(request) {

    console.log(request)
    let url = request.url
    if(request.url && config.mock) {
        let pathnameIdx = request.url.indexOf('/', 9)
        let pathName = request.url.substring(pathnameIdx, )
        url = 'http://localhost:'+config.port+'/mock/home'+ pathName
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

    }else {
        return ''
    }

  
}

function createPostFn(request) {

    console.log(request)
    let url = request.url
    if(request.url && config.mock) {
        let pathnameIdx = request.url.indexOf('/', 9)
        let pathName = request.url.substring(pathnameIdx, )
        url = 'http://localhost:'+config.port+'/mock/home'+ pathName
    }

    if(renderType === 'client') {
    return `
    function get_${request.id}() {
        return new Promise((resolve, reject) => {
            fetch({
                method: 'POST',
                url: '${url}',
                header:'${request.header}',
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

    data[${request.id}] = await get_${request.id}()
    `
    }else if(renderType === 'server') {

    }else {
        return ''
    }

    
}





function transform(str, outputPath) {
    console.log('=======',outputPath)
   
    if(!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, {recursive: true})
    }
    const content = parseHtml(str)
    return content

    // 测试用
    // str = fs.readFileSync(path.join(__dirname, '../pages/home/index.html'), 'utf8')
    // const content = parseHtml(str)
    // fs.writeFileSync(path.join(__dirname, '../dist/home/index.html'), content)
    
}

// transform()

module.exports = transform