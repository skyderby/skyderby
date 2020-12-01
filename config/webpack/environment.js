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

module.exports = environment
