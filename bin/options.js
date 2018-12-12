import { CONFIG } from './load'

export default {
  env: [
    '-e, --env <file>',
    'env filepath (default: ".env")'
  ],
  app: [
    '-a, --app <name..>',
    'specify the app to open the url (sindresorhus/opn)'
  ],
  aliasName: [
    '-a, --alias-name <name>',
    'config.alias[name] will be used'
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