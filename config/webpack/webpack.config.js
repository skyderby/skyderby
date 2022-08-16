const { webpackConfig, devServer, merge } = require('shakapacker')
const VirtualModulesPlugin = require('webpack-virtual-modules')
const TranslationsPlugin = require('./translations')

const isDevelopment = process.env.NODE_ENV !== 'production'
const virtualModules = new VirtualModulesPlugin()

const svgRule = webpackConfig.module.rules.find(rule => rule.test.test('.svg'))
if (svgRule) {
  svgRule.exclude = svgRule.exclude
    ? new RegExp(svgRule.exclude.source + /|\.svg$/.source)
    : /\.svg$/
}

const reactRefreshPlugin = () => {
  const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
  return new ReactRefreshWebpackPlugin({
    overlay: {
      sockPort: devServer.port
    }
  })
}

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
    isDevelopment && reactRefreshPlugin()
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
