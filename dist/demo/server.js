const axios = require('axios')

module.exports = async () => {
    const encodeTemplate = '%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22en%22%3E%0A%3Chead%3E%0A%20%20%20%20%3Cmeta%20charset=%22UTF-8%22%3E%0A%20%20%20%20%3Cmeta%20http-equiv=%22X-UA-Compatible%22%20content=%22IE=edge%22%3E%0A%20%20%20%20%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1.0%22%3E%0A%20%20%20%20%3Ctitle%3E%7B%7BpageInfo.title%7D%7D%3C/title%3E%0A%20%20%20%20%3Clink%20rel=%22stylesheet%22%20type=%22text/css%22%20href=%22./css/index.css%22%20/%3E%0A%3C/head%3E%0A%3Cbody%3E%0A%20%20%20%20%3Cdiv%20class=%22container%22%3E%0A%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%3Cul%20class=%22list-content%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B#each%20list%7D%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cli%20class=%22list-item%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ch1%20class=%22list-title%22%3E%7B%7Bthis.title%7D%7D%3C/h1%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class=%22list-subject%22%3E%7B%7Bthis.subject%7D%7D%3C/p%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class=%22list-author%22%3E%7B%7Bthis.author%7D%7D%20%20%20%7B%7Bthis.publishTime%7D%7D%3C/p%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C/li%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B/each%7D%7D%0A%20%20%20%20%20%20%20%20%3C/ul%3E%0A%0A%0A%20%20%20%20%3Cbr%20/%3E%0A%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%3Ch1%3E%7B%7BpageInfo.title%7D%7D%3C/h1%3E%0A%20%20%20%20%20%20%3Cbr/%3E%0A%20%20%20%20%20%20%3Ch2%3E%7B%7BpageInfo.subTitle%7D%7D%3C/h2%3E%0A%20%20%20%20%20%20%3Cp%3E%7B%7BpageInfo.content%7D%7D%3C/p%3E%0A%0A%20%20%20%20%3C/div%3E%0A%0A%20%20%20%20%3Cscript%20src=%22./js/index.js%22%20%3E%3C/script%3E%0A%0A%3C/body%3E%0A%3C/html%3E';
    let data = {};

    function post_list() {
        return new Promise((resolve, reject) => {
            axios({
                    method: 'POST',
                    url: 'http://localhost:3333/mock/demo/list',
                    header: {},
                    data: {}
                })
                .then((res) => {
                    let response = res.data
                    resolve(response.data)
                }).catch((err) => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    data['list'] = await post_list()

    function get_pageInfo() {
        return new Promise((resolve, reject) => {
            axios({
                    method: 'GET',
                    url: 'http://localhost:3333/mock/demo/pageInfo'
                })
                .then((res) => {
                    let response = res.data
                    resolve(response.data)
                }).catch((err) => {
                    console.log(err)
                    reject(err)
                })
        })
    }

    data['pageInfo'] = await get_pageInfo()


    const template = decodeURI(encodeTemplate)
    const Handlebars = require('handlebars')
    const handleTemplate = Handlebars.compile(template)
    const dom = handleTemplate(data)
    return dom
}