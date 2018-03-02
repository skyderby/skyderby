const { environment } = require('@rails/webpacker')

const webpack = require('webpack')

environment.plugins.append('Provide',  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery'
  })
)

environment.config.merge({
  resolve: {
    alias: {
      'select2': 'select2/dist/js/select2.full.js',
    },
  }
})

module.exports = environment
