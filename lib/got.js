'use strict'

Object.defineProperty(exports, '__esModule', {
   value: true
})
exports.publish = exports.update = exports.insert = exports.getToken = undefined

var _got = require('got')

var _got2 = _interopRequireDefault(_got)

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

const refreshTokenURI = 'https://accounts.google.com/o/oauth2/token'

const rootURI = `https://www.googleapis.com`
const insertURI = () => `${rootURI}/upload/chromewebstore/v1.1/items`
const updateURI = id => `${rootURI}/upload/chromewebstore/v1.1/items/${id}`
const publishURI = (id, target) =>
   `${rootURI}/chromewebstore/v1.1/items/${id}/publish?publishTarget=${target}`

const getToken = (exports.getToken = ({
   client_id,
   client_secret,
   refresh_token
}) =>
   _got2.default
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
      .then(body => body.access_token))

const insert = (exports.insert = (token, zip) =>
   _got2.default
      .post(insertURI(), { headers: _headers(token), body: zip })
      .then(jsonBody)
      .then(throwByUplodState))

const update = (exports.update = (token, zip, id) =>
   _got2.default
      .put(updateURI(id), { headers: _headers(token), body: zip })
      .then(jsonBody)
      .then(throwByUplodState))

const publish = (exports.publish = (token, id, target) =>
   _got2.default
      .post(publishURI(id, target), { headers: _headers(token), json: true })
      .then(jsonBody)
      .then(throwByUplodState))

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
