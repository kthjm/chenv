const TARGET = '8'

module.exports = {
  presets: [],
  plugins: [],
  env: {
    just: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: TARGET }
        }],
        '@babel/preset-flow'
      ]
    },
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