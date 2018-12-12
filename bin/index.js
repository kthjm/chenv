import program from 'commander'
import enquirer from 'enquirer'
import opn from 'opn'
import options from './options'
import { loadCredentials, loadConfig } from './load'
import { Chenv, authURL, getRefreshToken } from '..'
import packageJson from '../package.json'

const errorHandler = (err) => {
  console.error(err)
  process.exit(1)
}

program.version(packageJson.version)

program
.command(`auth`)
.description('get REFRESH_TOKEN easily')
.option(...options['app'])
.option(...options['env'])
.action(({ app, env }) =>
  Promise.resolve().then(async () => {
    const { client_id, client_secret } = loadCredentials(env)

    if (!client_id || !client_secret) {
      return console.log('\n > Please set CLIENT_ID and CLIENT_SECRET\n')
    }

    const auth_uri = authURL(client_id)

    // no wait
    opn(auth_uri, { wait: false, app: app ? app.split(',') : undefined })

    const { code } = await enquirer.prompt({
      name: 'code',
      type: 'input',
      message: 'Tell me code by authorize:' + '\n' + auth_uri + '\n'
    })

    const refresh_token = await getRefreshToken({ client_id, client_secret, code })
    return console.log(`\n > REFRESH_TOKEN=${refresh_token}\n`)
  })
  .catch(errorHandler)
)

program
.command(`upload [src] [id]`)
.description('upload item (!id ? insert : update)')
.option(...options['aliasName'])
.option(...options['publish'])
.option(...options['publishTt'])
.option(...options['config'])
.option(...options['env'])
.action((s, i, { aliasName, publish, publishTt, config, env }) =>
  Promise.resolve().then(() => {
    const chenv = new Chenv(loadCredentials(env))
    const { alias = {} } = loadConfig(config)
    const { src, id } = alias[aliasName] || { src: s, id: i }
    
    return !id
    ? chenv.insertItem(src).then(console.log)
    : chenv.updateItem(id, src).then(console.log).then(() =>
      publish ? chenv.publishItem(id, false).then(console.log) :
      publishTt ? chenv.publishItem(id, true).then(console.log) :
      false
    )
  })
  .catch(errorHandler)
)

program
.command(`remove [id]`)
.description('not remove but update item as "removed-like"')
.option(...options['aliasName'])
.option(...options['config'])
.option(...options['env'])
.action((i, { aliasName, env }) =>
  Promise.resolve().then(() => {
    const chenv = new Chenv(loadCredentials(env))
    const { alias = {} } = loadConfig(config)
    const { id } = alias[aliasName] || { id: i }
    
    return chenv.removeItem(id).then(console.log)
  })
  .catch(errorHandler)
)

/*

program
.command(`check [id]`)
.description('check item information')
.option(...options['aliasName'])
.option(...options['config'])
.option(...options['draft'])
.option(...options['published'])
.option(...options['env'])
.action((i, { env, draft, published }) =>
  Promise.resolve().then(() => {
    const chenv = new Chenv(loadCredentials(env))
    const { alias = {} } = loadConfig(config)
    const { id } = alias[aliasName] || { id: i }
    
    const projection =
    draft     ? 'DRAFT'     :
    published ? 'PUBLISHED' :
    ''
    
    return chenv.checkItem(id, projection).then(console.log)
  })
  .catch(errorHandler)
)

*/

program.on('--help', () => console.log(''))
program.parse(process.argv)
if (!program.args.length) {
  program.help()
}