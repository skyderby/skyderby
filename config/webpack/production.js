process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const environment = require('./environment')

const CSSLoader = environment.loaders
  .get('moduleSass')
  .use.find(el => el.loader === 'css-loader')

CSSLoader.options = Object.assign(CSSLoader.options, {
  modules: {
    localIdentName: '[hash:base64:5]'
  },
  sourceMap: true
})

module.exports = environment.toWebpackConfig()
