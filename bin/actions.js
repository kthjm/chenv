import enquirer from 'enquirer'
import opn from 'opn'
import { loadCredentials, loadConfig } from './load'
import { Chenv, authURL, getRefreshToken } from '..'

const action = (action) => 
  Promise.resolve()
  .then(action)
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

const promiseOrder = (args, action, index = 0) =>
  args[index] &&
  Promise.resolve()
  .then(() => action(args[index], index, args))
  .then(() => promiseOrder(args, action, index + 1))

const order = (items, action) =>
  !items.length
  ?
  console.log('\n > no item\n')
  :
  promiseOrder(items, async (item, index, items) => {
    console.log(item)
    await action(item, index, items)
    return index !== items.length - 1 && console.log('-')
  })

export const auth = ({ app, env }) => action(async () => {
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
  
export const upload = (src, id, options) => action(() => {
  const {
    aliasName,
    all,
    publish,
    publishTt,
    config,
    env
  } = options
  
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    items: itemMap = {}
  } = loadConfig(config)
  
  const items = [
    { src, id },
    ...aliasItems(itemMap, all, aliasName)
  ].filter(({ src }) => src)
  
  return order(items, ({ src, id }) =>
    !id
    ? chenv.insertItem(src).then(console.log)
    : chenv.updateItem(id, src).then(console.log).then(() =>
      publish ? chenv.publishItem(id, false).then(console.log) :
      publishTt ? chenv.publishItem(id, true).then(console.log) :
      false
    )
  )
})

export const remove = (id, options) => action(() => {
  const {
    aliasName,
    all,
    config,
    env
  } = options
  
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    items: itemMap = {}
  } = loadConfig(config)
  
  const items = [
    { id },
    ...aliasItems(itemMap, all, aliasName)
  ].filter(({ id }) => id)
  
  return order(items, ({ id }) =>
    chenv.removeItem(id).then(console.log)
  )
})

export const check = (id, options) => action(() => {
  const {
    aliasName,
    all,
    draft,
    published,
    config,
    env
  } = options
  
  const chenv = new Chenv(loadCredentials(env))
  
  const {
    items: itemMap = {}
  } = loadConfig(config)
  
  const items = [
    { id, projection: draft ? 'DRAFT' : published ? 'PUBLISHED' : '' },
    ...aliasItems(itemMap, all, aliasName)
  ].filter(({ id }) => id)
  
  return order(items, ({ id, projection }) =>
    chenv.checkItem(id, projection).then(console.log)
  )
})

const aliasItems = (map, all, aliasName) =>
  all
  ? map2items(map)
  : alias2items(aliasName, map)

const map2items = (map) =>
  Object
  .entries(map)
  .map(([ name, item ]) => ({ name, ...item }))

const alias2items = (aliasName, map) =>
  !aliasName
  ?
  []
  :
  aliasName
  .split(',')
  .filter(name => name)
  .map(name => ({ name, ...map[name] }))