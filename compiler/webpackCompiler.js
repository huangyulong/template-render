const outerConfig = require('../configs/config')
const webpack = require('webpack')
const createWebpackConfig = (entryPath, outputPath, filename) => {
    const outerRules = outerConfig.rules
    let rules = []

    rules = outerRules.slice()


    return {
        entry: entryPath,
        output: {
            path: outputPath,
            filename
        },
        module: {
            rules
        }
    }
}


function webpackCompiler(targetFilePath, outputFilePath) {
    console.log('-----outputfilepath---',typeof outputFilePath, outputFilePath)
    const idx = outputFilePath.lastIndexOf('/')
    const newOutputPath = outputFilePath.substring(0, idx)
    const filename = outputFilePath.substring(idx+1, )
    const compiler = webpack(createWebpackConfig(targetFilePath, newOutputPath, filename))
    compiler.run((err, stats) => {
        compiler.close((closeErr) => {
            if(closeErr) console.log('webpack run compiler closeErr: ',closeErr)
        })

        if (err) {
            console.error(err.stack || err);
            if (err.details) {
              console.error(err.details);
            }
            return;
        }
        
        const info = stats.toJson({color: true});
    
        if (stats.hasErrors()) {
            console.error(info.errors);
        }
    
        if (stats.hasWarnings()) {
            console.warn(info.warnings);
        }
      
    })
}



module.exports = webpackCompiler