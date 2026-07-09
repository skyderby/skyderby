const { webpackConfig, merge } = require('shakapacker')
const webpack = require('webpack')

const svgRule = webpackConfig.module.rules.find(rule => rule.test.test('.svg'))
if (svgRule) {
  svgRule.exclude = svgRule.exclude
    ? new RegExp(svgRule.exclude.source + /|\.svg$/.source)
    : /\.svg$/
}

const options = {
  resolve: {
    extensions: ['.css', '.scss', '.module.css', '.module.scss', '.woff', '.svg']
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery',
      Highcharts: 'highcharts'
    })
  ]
}

const config = merge({}, webpackConfig, options)

if (config.devServer && 'https' in config.devServer) {
  const { https, ...devServer } = config.devServer
  config.devServer = { ...devServer, server: https ? 'https' : 'http' }
}

module.exports = config
