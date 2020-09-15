const { environment } = require('@rails/webpacker')
const webpack = require('webpack')
const VirtualModulesPlugin = require('webpack-virtual-modules')

const TranslationsPlugin = require('./translations')

environment.plugins.append(
  'Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery'
  })
)

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
