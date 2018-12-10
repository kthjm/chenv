import Flow from 'rollup-plugin-flow'
import Babel from 'rollup-plugin-babel'
import AutoExternal from 'rollup-plugin-auto-external'
import Prettier from 'rollup-plugin-prettier'

const shebang = '#!/usr/bin/env node'

const flow = Flow({
  pretty: true
})

const babel = Babel({
  exclude: 'node_modules/**'
})

const autoexternal = AutoExternal({
  builtins: true,
  dependencies: true
})

const prettier = Prettier({
  parser: 'babylon',
  tabWidth: 2,
  semi: false,
  singleQuote: true
})

export default [
  {
    input: 'src/index.js',
    output: {
      format: 'cjs',
      file: '.dist/index.js',
      exports: 'named'
    },
    plugins: [
      flow,
      babel,
      autoexternal,
      prettier
    ]
  },
  {
    input: 'bin/index.js',
    external: [
      '..',
      '../package.json'
    ],
    output: {
      format: 'cjs',
      file: '.bin/chenv.js',
      banner: shebang
    },
    plugins: [
      babel,
      autoexternal,
      prettier
    ]
  }
]