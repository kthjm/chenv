import program from 'commander'
import * as actions from './actions'
import { CONFIG } from './load'
import packageJson from '../package.json'

const options = {
  env: [
    '-e, --env <file>',
    'env filepath (default: ".env")'
  ],
  app: [
    '--app <name..>',
    'specify the app to open the url (sindresorhus/opn)'
  ],
  aliasName: [
    '-a, --alias-name <name..>',
    'config.alias[name] will be used'
  ],
  all: [
    '--all',
    'config.alias will be used'
  ],
  config: [
    '-c, --config <file>',
    `config filepath (default: "${CONFIG}" || package.json)`
  ],
  publish: [
    '-p, --publish',
    `(ignored when !id) publish item directly after update`
  ],
  publishTt: [
    '-t, --publish-tt',
    `(ignored when !id) publish item directly after update to only "trustedTesters"`
  ],
  draft: [
    '-d, --draft',
    `projection=DRAFT`
  ],
  published: [
    '-p, --published',
    `projection=PUBLISHED`
  ],
}

program.version(packageJson.version)

program
.command(`auth`)
.description('get REFRESH_TOKEN easily')
.option(...options['app'])
.option(...options['env'])
.action(actions['auth'])

program
.command(`upload [src] [id]`)
.description('upload item (!id ? insert : update)')
.option(...options['aliasName'])
.option(...options['all'])
.option(...options['publish'])
.option(...options['publishTt'])
.option(...options['config'])
.option(...options['env'])
.action(actions['upload'])

program
.command(`remove [id]`)
.description('not remove but update item as "removed-like"')
.option(...options['aliasName'])
.option(...options['all'])
.option(...options['config'])
.option(...options['env'])
.action(actions['remove'])

/*
program
.command(`check [id]`)
.description('check item information')
.option(...options['aliasName'])
.option(...options['all'])
.option(...options['draft'])
.option(...options['published'])
.option(...options['config'])
.option(...options['env'])
.action(actions['check'])
*/

program.on('--help', () => console.log(''))
program.parse(process.argv)
if (!program.args.length) {
  program.help()
}