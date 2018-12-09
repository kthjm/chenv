const TARGET = '8'

module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: TARGET }
        }],
        '@babel/preset-flow',
        'power-assert'
      ],
      plugins: [
        'istanbul'
      ]
    },
    build: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: { node: TARGET }
        }]
      ]
    },
  }
}