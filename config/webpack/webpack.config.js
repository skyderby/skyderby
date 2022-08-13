const { webpackConfig, devServer, merge } = require('shakapacker')
const VirtualModulesPlugin = require('webpack-virtual-modules')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const isDevelopment = process.env.NODE_ENV !== 'production'

const TranslationsPlugin = require('./translations')

const virtualModules = new VirtualModulesPlugin()

const svgRule = webpackConfig.module.rules.find(rule => rule.test.test('.svg'))
if (svgRule) {
  svgRule.exclude = svgRule.exclude
    ? new RegExp(svgRule.exclude.source + /|\.svg$/.source)
    : /\.svg$/
}

// Patch css-loader rule to support css-modules
const cssLoader = require.resolve('css-loader')
webpackConfig.module.rules.forEach(rule => {
  rule?.use?.forEach(loader => {
    if (loader?.loader === cssLoader) {
      loader.options.modules = {
        auto: true
      }
    }
  })
})

const options = {
  resolve: {
    extensions: [
      '.css',
      '.scss',
      '.module.css',
      '.module.scss',
      '.woff',
      '.svg',
      '.ts',
      '.tsx'
    ]
  },
  plugins: [
    virtualModules,
    new TranslationsPlugin(virtualModules),
    isDevelopment &&
      new ReactRefreshWebpackPlugin({
        overlay: {
          sockPort: devServer.port
        }
      })
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true
            }
          }
        ]
      }
    ]
  }
}

module.exports = merge({}, webpackConfig, options)
