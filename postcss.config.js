const path = require('path')

module.exports = {
  plugins: [
    require('postcss-import')({
      addModulesDirectories: [
        path.resolve(__dirname, './app/javascript')
      ]
    }),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3
    })
  ]
}
