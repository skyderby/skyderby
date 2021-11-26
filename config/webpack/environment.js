const { environment } = require('@rails/webpacker')
const VirtualModulesPlugin = require('webpack-virtual-modules')

const TranslationsPlugin = require('./translations')

const virtualModules = new VirtualModulesPlugin()

environment.plugins.append('VirtualModulesPlugin', virtualModules)
environment.plugins.append('TranslationsPlugin', new TranslationsPlugin(virtualModules))

environment.splitChunks()

const babelLoader = environment.loaders.get('babel')

environment.loaders.insert(
  'svg',
  {
    test: /\.svg$/,
    use: babelLoader.use.concat([
      {
        loader: 'react-svg-loader',
        options: {
          jsx: true
        }
      }
    ])
  },
  { before: 'file' }
)

const fileLoader = environment.loaders.get('file')
fileLoader.exclude = /\.(svg)$/i

function hotfixPostcssLoaderConfig(subloader) {
  const subloaderName = subloader.loader
  if (subloaderName === 'postcss-loader') {
    if (subloader.options.postcssOptions) {
      console.log(
        '\x1b[31m%s\x1b[0m',
        'Remove postcssOptions workaround in config/webpack/environment.js'
      )
    } else {
      subloader.options.postcssOptions = subloader.options.config
      delete subloader.options.config
    }
  }
}

environment.loaders.keys().forEach(loaderName => {
  const loader = environment.loaders.get(loaderName)
  loader.use.forEach(hotfixPostcssLoaderConfig)
})

module.exports = environment
