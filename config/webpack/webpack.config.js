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

module.exports = merge({}, webpackConfig, options)
