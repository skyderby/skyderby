const path = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  stories: ['../app/javascript/**/*.stories.@(js|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y'
  ],
  webpackFinal: async config => {
    config.plugins = [
      !isProduction && new ReactRefreshWebpackPlugin(),
      ...config.plugins
    ].filter(Boolean)

    config.resolve.modules = [
      path.resolve(__dirname, '../app/javascript'),
      'node_modules'
    ]

    const fileLoaderRule = config.module.rules.find(
      rule => rule.test && rule.test.test('.svg')
    )
    fileLoaderRule.exclude = /\.svg$/

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      loader: require.resolve('@svgr/webpack')
    })

    config.module.rules.push({
      test: /\.scss$/,
      loaders: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 1,
            modules: true
          }
        },
        require.resolve('sass-loader')
      ]
    })

    return config
  }
}

