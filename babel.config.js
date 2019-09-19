module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { browsers: '> 1%' },
        useBuiltIns: 'usage',
        forceAllTransforms: true,
        corejs: 3
      }
    ]
  ],

  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-react-jsx',
    ['@babel/plugin-proposal-class-properties', { spec: true }]
  ]
}
