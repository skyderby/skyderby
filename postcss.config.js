const path = require('path')

module.exports = {
  plugins: [
    [
      'postcss-import',
      {
        addModulesDirectories: [path.resolve(__dirname, './app/javascript')]
      }
    ],
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009'
        },
        stage: 3
      }
    ]
  ]
}
