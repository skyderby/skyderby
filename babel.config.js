module.exports = api => {
  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: { browsers: '> 1%', node: 'current' },
          useBuiltIns: 'usage',
          forceAllTransforms: true,
          corejs: 3
        }
      ],
      '@babel/preset-react'
    ],

    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      ['@babel/plugin-proposal-class-properties', { spec: true }],
    ].filter(Boolean),

    env: {
      test: {
        plugins: ['@babel/plugin-transform-modules-commonjs']
      }
    }
  }
}
