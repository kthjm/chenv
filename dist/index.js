'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var ora = _interopDefault(require('ora'))
var got = _interopDefault(require('got'))
var dtz = _interopDefault(require('dtz'))
var JSZip = _interopDefault(require('jszip'))

//
const refreshTokenURI = 'https://accounts.google.com/o/oauth2/token'
const rootURI = `https://www.googleapis.com`

const insertURI = () => `${rootURI}/upload/chromewebstore/v1.1/items`

const updateURI = id => `${rootURI}/upload/chromewebstore/v1.1/items/${id}`

const publishURI = (id, target) =>
  `${rootURI}/chromewebstore/v1.1/items/${id}/publish?publishTarget=${target}`

const getToken = ({ client_id, client_secret, refresh_token }) =>
  got
    .post(refreshTokenURI, {
      body: {
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      },
      form: true,
      json: true
    })
    .then(jsonBody)
    .then(body => body.access_token)
const insert = (token, zip) =>
  got
    .post(insertURI(), {
      headers: _headers(token),
      body: zip
    })
    .then(jsonBody)
    .then(throwByUplodState)
const update = (token, zip, id) =>
  got
    .put(updateURI(id), {
      headers: _headers(token),
      body: zip
    })
    .then(jsonBody)
    .then(throwByUplodState)
const publish = (token, id, target) =>
  got
    .post(publishURI(id, target), {
      headers: _headers(token),
      json: true
    })
    .then(jsonBody)
    .then(throwByUplodState)

const jsonBody = ({ body }) =>
  typeof body === 'object' ? body : JSON.parse(body)

const _headers = token => ({
  Authorization: `Bearer ${token}`,
  'x-goog-api-version': '2'
})

const throwByUplodState = ({ uploadState, itemError }) => {
  if (uploadState !== 'SUCCESS' && Array.isArray(itemError)) {
    throw new Error(itemError[0].error_detail)
  }

  return
}

//

const expect = async function(text, afn) {
  this.start(text)
  const res = await afn()
  this.succeed()
  this.text = ''
  return res
}

const stub = async function(text, afn) {
  const res = await afn()
  return res
}

const createExpect = spinner =>
  typeof spinner === 'object' && spinner.start && spinner.succeed
    ? expect.bind(spinner)
    : stub
const tokenAndZip = async (expect, getTokenQuery, src) => {
  const token = await expect(`fetch access token`, () =>
    getToken(getTokenQuery)
  )
  const zip = await expect(`generate zip stream from ${src}`, () =>
    srcToZipStream(src)
  )
  return {
    token,
    zip
  }
}

const srcToZipStream = src => dtz(src).then(res => res.generateNodeStream())

const extensionZip = json => {
  const zip = new JSZip()
  zip.file('manifest.json', JSON.stringify(json, null, '\t'))
  return zip
}

const deleteManifest = {
  manifest_version: 2,
  name: '(deleted)',
  version: '0'
}

//
const insertItem = arg => {
  const { getTokenQuery, src } = arg
  checkGetTokenQuery(getTokenQuery)
  checkIfString(src, `src`)
  const expect = createExpect(arg.spinner)
  return tokenAndZip(expect, getTokenQuery, src).then(({ token, zip }) =>
    expect(`insert item`, () => insert(token, zip))
  )
}
const updateItem = arg => {
  const { getTokenQuery, extension_id, src } = arg
  checkGetTokenQuery(getTokenQuery)
  checkIfString(extension_id, `process.env.EXTENSION_ID`)
  checkIfString(src, `src`)
  const expect = createExpect(arg.spinner)
  return tokenAndZip(expect, getTokenQuery, src).then(({ token, zip }) =>
    expect(`update item`, () => update(token, zip, extension_id)).then(
      () =>
        arg.publish &&
        expect(`publish item`, () =>
          publish(
            token,
            extension_id,
            arg.trustedTesters ? 'trustedTesters' : 'default'
          )
        )
    )
  )
}
const deleteItem = arg => {
  const { getTokenQuery, deleteExtensions } = arg
  checkGetTokenQuery(getTokenQuery)
  const expect = createExpect(arg.spinner)
  const zip = extensionZip(deleteManifest)
  return expect(`fetch access token`, () => getToken(getTokenQuery)).then(
    token =>
      deleteAll({
        token,
        zip,
        ids: deleteExtensions,
        spinner: arg.spinner
      })
  )
}

const checkIfString = (target, key) => {
  if (!target || typeof target !== 'string') {
    throwMessage(key)
  }
}

const deleteAll = ({ token, zip, ids, spinner }) =>
  Promise.all(
    ids.map(id => {
      const stream = zip.generateNodeStream()
      const promise = update(token, stream, id)
      return spinner ? ora.promise(promise, `delete ${id}`) : promise
    })
  )

const checkGetTokenQuery = query =>
  ['client_id', 'client_secret', 'refresh_token'].forEach(key => {
    if (!query[key]) {
      throwMessage(`process.env.${key.toUpperCase()}`)
    }
  })

const throwMessage = message => {
  throw new Error(`error: missing required ${message}`)
}

exports.insertItem = insertItem
exports.updateItem = updateItem
exports.deleteItem = deleteItem
