// 将[name] 中的name配置项给到loader
export default function loader(source) {
    const options = this.getOptions()
    console.log('-----options-----')
    console.log(options)

    console.log('---source---')
    console.log(typeof source)
    console.log(source)

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
    source = source.replace(/<!-- #get -->/g, getFn)

    return source

}