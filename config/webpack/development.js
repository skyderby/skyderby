const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment')

environment.plugins.append('ReactRefreshWebpackPlugin', new ReactRefreshWebpackPlugin())

module.exports = environment.toWebpackConfig()
