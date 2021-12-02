const path = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'

const VirtualModulesPlugin = require('webpack-virtual-modules')
const TranslationsPlugin = require('../config/webpack/translations')


module.exports = {
  stories: ['../app/javascript/**/*.stories.@(js|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-postcss'
  ],
  typescript: {
    reactDocgen: 'none'
  },
  staticDirs: ['../public'],
  webpackFinal: async config => {
    const virtualModules = new VirtualModulesPlugin()

    config.plugins = [
      !isProduction && new ReactRefreshWebpackPlugin(),
      virtualModules,
      new TranslationsPlugin(virtualModules),
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
            modules: {
              localIdentName: '[local]__[hash:base64:5]',
            }
          }
        },
        {
          loader: require.resolve('sass-loader'),
          options: {
            sassOptions: {
              includePaths: [
                path.resolve(__dirname, '../node_modules'),
                path.resolve(__dirname, '../app/javascript')
              ]
            }
          }
        }
      ],
      include: path.resolve(__dirname, '../')
    })

    return config
  }
}

