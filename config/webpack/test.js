process.env.NODE_ENV = 'development'

const environment = require('./environment')

module.exports = environment.toWebpackConfig()
