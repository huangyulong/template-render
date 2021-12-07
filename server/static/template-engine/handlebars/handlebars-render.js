// 使用模板引擎调用的
// config/config.js 中 templateEngine字段指定的render方法，

/**
 * 渲染模板方法
 * @returns 返回用户客户端|服务端渲染的内容
 */
function handlebarsRender() {
    return {
        clientRender: () => {
            return `const handleTemplate = Handlebars.compile(template)
            const dom = handleTemplate(data)` 
        },
        serverRender: () => {
            return `const Handlebars = require('handlebars')
            const handleTemplate = Handlebars.compile(template)
            const dom = handleTemplate(data)` 
        }
    }
       
}

module.exports = handlebarsRender