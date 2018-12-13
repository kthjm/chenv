import enquirer from 'enquirer'
import opn from 'opn'
import { loadCredentials, loadConfig } from './load'
import { Chenv, authURL, getRefreshToken } from '..'

const frame = (action) => 
  Promise.resolve()
  .then(action)
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

const alias2items = (aliasName, map) =>
  !aliasName
  ?
  []
  :
  aliasName
  .split(',')
  .filter(name => name)
  .map(name => ({ name, ...map[name] }))

const promiseOrder = (args, action, index = 0) =>
  !args[index]
  ?
  false
  :
  Promise.resolve()
  .then(() => action(args[index], index, args))
  .then(() => promiseOrder(args, action, index + 1))
  
export const auth = ({ app, env }) => frame(async () => {
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
  
export const upload = (src, id, { aliasName, publish, publishTt, config, env }) => frame(() => {
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    alias: aliasMap = {}
  } = loadConfig(config)
  
  const items = [
    { src, id },
    ...alias2items(aliasName, aliasMap)
  ].filter(({ src }) => src)
  
  return !items.length
  ? console.log('\n > no item\n')
  : promiseOrder(items, ({ name, src, id }) => {
    console.log({ name, src, id })
    return !id
    ? chenv.insertItem(src).then(console.log)
    : chenv.updateItem(id, src).then(console.log).then(() =>
      publish ? chenv.publishItem(id, false).then(console.log) :
      publishTt ? chenv.publishItem(id, true).then(console.log) :
      false
    )
  })
})

export const remove = (id, { aliasName, config, env }) => frame(() => {
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    alias: aliasMap = {}
  } = loadConfig(config)
  
  const items = [
    { id },
    ...alias2items(aliasName, aliasMap)
  ].filter(({ id }) => id)
  
  return !items.length
  ? console.log('\n > no item\n')
  : promiseOrder(items, ({ name, id }) => {
    console.log({ name, id })
    return chenv.removeItem(id).then(console.log)
  })
})

export const check = (id, { aliasName, draft, published, config, env }) => frame(() => {
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    alias: aliasMap = {}
  } = loadConfig(config)
  
  const items = [
    { id, projection: draft ? 'DRAFT' : published ? 'PUBLISHED' : '' },
    ...alias2items(aliasName, aliasMap)
  ].filter(({ id }) => id)
  
  return !items.length
  ? console.log('\n > no item\n')
  : promiseOrder(items, ({ name, id, projection }) => {
    console.log({ name, id, projection })
    return chenv.checkItem(id, projection).then(console.log)
  })
})