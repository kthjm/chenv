import program from 'commander'
import enquirer from 'enquirer'
import dotenv from 'dotenv'
import opn from 'opn'
import { join } from 'path'
import { Chenv, authURL, getRefreshToken } from '..'
import packageJson from '../package.json'

const optionMap = {
  envFile: [
    '-e, --env-file <file>',
    'dotenv filepath storing environment variables [default = ".env"]'
  ],
  app: [
    '-a, --app <name..>',
    'specify the app to open the url (sindresorhus/opn)'
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

const loadCredentials = (envFile) => {
  const { error } = dotenv.config({
    path: (envFile && typeof envFile === 'string')
    ? envFile
    : join(process.cwd(), '.env')
  })

  if (error) console.warn(error.message)

  const {
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    REFRESH_TOKEN: refresh_token,
  } = process.env

  return { client_id, client_secret, refresh_token }
}

const errorHandler = (err) => {
  console.error(err)
  process.exit(1)
}

program.version(packageJson.version)

program
.command(`auth`)
.description('get REFRESH_TOKEN easily')
.option(...optionMap['app'])
.option(...optionMap['envFile'])
.action(({ app, envFile }) =>
  Promise.resolve().then(async () => {
    const { client_id, client_secret } = loadCredentials(envFile)
  
    if (!client_id || !client_secret) {
      return console.log('\n > Please set CLIENT_ID and CLIENT_SECRET\n')
    }
    
    const auth_uri = authURL(client_id)
    const msg = 'Tell me code by authorize:'
    
    const message = await opn(auth_uri, {
      wait: true,
      app: app ? app.split(',') : undefined
    })
    .then(() => msg)
    .catch(() => msg + '\n' + auth_uri + '\n')
    
    const { code } = await enquirer.prompt({ name: 'code', type: 'input', message })
    const refresh_token = await getRefreshToken({ client_id, client_secret, code })
    return console.log(`\n > REFRESH_TOKEN=${refresh_token}\n`)
  })
  .catch(errorHandler)
)

program
.command(`upload <src> [id]`)
.description('upload item (!id ? insert : update)')
.option(...optionMap['publish'])
.option(...optionMap['publishTt'])
.option(...optionMap['envFile'])
.action((src, id, { envFile, publish, publishTt }) => {
  const chenv = new Chenv(loadCredentials(envFile))

  return Promise.resolve().then(() =>
    !id
    ? chenv.insertItem(src)
    : chenv.updateItem(id, src).then((res) =>
      publish   ? chenv.publishItem(id, false) :
      publishTt ? chenv.publishItem(id, true)  :
      res
    )
  )
  .then(console.log)
  .catch(errorHandler)
})

program
.command(`remove <id>`)
.description('not remove but update item as "removed-like"')
.option(...optionMap['envFile'])
.action((id, { envFile }) => {
  const chenv = new Chenv(loadCredentials(envFile))

  return chenv.removeItem(id)
  .then(console.log)
  .catch(errorHandler)
})

/*

program
.command(`check <id>`)
.description('check item information')
.option(...optionMap['draft'])
.option(...optionMap['published'])
.option(...optionMap['envFile'])
.action((id, { envFile, draft, published }) => {
  const chenv = new Chenv(loadCredentials(envFile))

  const projection =
  draft     ? 'DRAFT'     :
  published ? 'PUBLISHED' :
  ''

  return chenv.checkItem(id, projection)
  .then(console.log)
  .catch(errorHandler)
})

*/

program.on('--help', () => console.log(''))
program.parse(process.argv)
if (!program.args.length) {
  program.help()
}