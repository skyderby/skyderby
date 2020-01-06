const { environment } = require('@rails/webpacker')
const webpack = require('webpack')

environment.plugins.append(
  'Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery'
  })
)

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
