#!/usr/bin/env node
'use strict'

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var program = _interopDefault(require('commander'))
var enquirer = _interopDefault(require('enquirer'))
var dotenv = _interopDefault(require('dotenv'))
var path = require('path')
var Chenv = require('..')
var Chenv__default = _interopDefault(Chenv)
var packageJson = _interopDefault(require('../package.json'))

const optionMap = {
  ['envFile']: [
    '-e, --env-file <file>',
    'dotenv filepath storing environment variables'
  ],
  ['publish']: ['-p, --publish', `publish item directly after update`],
  ['publishTt']: [
    '-t, --publish-tt',
    `publish item directly after update to only "trustedTesters"`
  ],
  ['projectionDraft']: ['-d, --projection-draft', ``],
  ['projectionPublished']: ['-p, --projection-published', ``]
}

const loadCredentials = envFile => {
  const { error } = dotenv.config({
    path:
      typeof envFile === 'string' ? envFile : path.join(process.cwd(), '.env')
  })
  if (error) console.warn(error)
  const {
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    REFRESH_TOKEN: refresh_token
  } = process.env
  return {
    client_id,
    client_secret,
    refresh_token
  }
}

const errorHandler = err => {
  console.error(err)
  process.exit(1)
}

program.version(packageJson.version)
program
  .command(`init`)
  .description('')
  .option(...optionMap['envFile'])
  .action(({ envFile }) => {
    const { client_id, client_secret } = loadCredentials(envFile)
    return enquirer
      .prompt({
        name: 'code',
        type: 'input',
        message:
          'Tell me code by authorize:' + '\n' + Chenv.authURL(client_id) + '\n'
      })
      .then(({ code }) =>
        Chenv.getRefreshToken({
          client_id,
          client_secret,
          code
        })
      )
      .then(refresh_token => {
        console.log('')
        console.log(`REFRESH_TOKEN=${refresh_token}`)
        console.log('')
      })
      .catch(errorHandler)
  })
program
  .command(`upload <src> [id]`)
  .description('')
  .option(...optionMap['envFile'])
  .option(...optionMap['publish'])
  .option(...optionMap['publishTt'])
  .action((src, id, { envFile, publish, publishTt }) => {
    const chenv = new Chenv__default(loadCredentials(envFile))
    return Promise.resolve()
      .then(() =>
        !id
          ? chenv.insertItem(src)
          : chenv
              .updateItem(id, src)
              .then(() =>
                publish
                  ? chenv.publishItem(id, false)
                  : publishTt
                  ? chenv.publishItem(id, true)
                  : false
              )
      )
      .catch(errorHandler)
  })
program
  .command(`check <id>`)
  .description('check item')
  .option(...optionMap['envFile'])
  .option(...optionMap['projectionDraft'])
  .option(...optionMap['projectionPublished'])
  .action((id, { envFile, projectionDraft, projectionPublished }) => {
    const chenv = new Chenv__default(loadCredentials(envFile))
    return chenv
      .checkItem(
        id,
        projectionDraft ? 'DRAFT' : projectionPublished ? 'PUBLISHED' : ''
      )
      .then(console.log)
      .catch(errorHandler)
  })
program
  .command(`remove <id>`)
  .description('update item as "removed-like"')
  .option(...optionMap['envFile'])
  .action((id, { envFile }) => {
    const chenv = new Chenv__default(loadCredentials(envFile))
    return chenv.removeItem(id).catch(errorHandler)
  })
/*
program.on('--help', function() {
  console.log('')
  console.log('  Examples:')
  console.log('')
  console.log('    $ chenv upload ./app -p')
  console.log(``)
  console.log(
    `      => process.env.EXTENSION_ID ? update(./app).then(publish) : insert(./app)`
  )
  console.log(``)
  console.log('    $ chenv delete id1,id2 -e .env')
  console.log('')
  console.log(`      => update [id1,id2] as "deleted style"(not deleted)`)
  console.log('')
})
*/

program.parse(process.argv)
if (!program.args.length) program.help() // function errorHandler(err) {
//   if (typeof spinner === 'object' && spinner.text) {
//     spinner.fail()
//   }
//   console.error(
//     cyan(`
// ${err.message}
//   `)
//   )
//   process.exit(1)
// }
