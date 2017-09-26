'use strict'

Object.defineProperty(exports, '__esModule', {
   value: true
})
exports.deleteItem = exports.updateItem = exports.insertItem = undefined

var _ora = require('ora')

var _ora2 = _interopRequireDefault(_ora)

var _got = require('./got.js')

var _utils = require('./utils.js')

var _manifest = require('./manifest.js')

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

const insertItem = (exports.insertItem = arg => {
   const getTokenQuery = arg.getTokenQuery,
      src = arg.src

   checkGetTokenQuery(getTokenQuery)
   const expect = (0, _utils.createExpect)(arg.spinner)

   return (0, _utils.tokenAndZip)(
      expect,
      getTokenQuery,
      src
   ).then(({ token, zip }) =>
      expect(`insert item`, () => (0, _got.insert)(token, zip))
   )
})

const updateItem = (exports.updateItem = arg => {
   const getTokenQuery = arg.getTokenQuery,
      src = arg.src,
      extension_id = arg.extension_id

   checkGetTokenQuery(getTokenQuery)
   const expect = (0, _utils.createExpect)(arg.spinner)

   return (0, _utils.tokenAndZip)(
      expect,
      getTokenQuery,
      src
   ).then(({ token, zip }) =>
      expect(`update item`, () =>
         (0, _got.update)(token, zip, extension_id)
      ).then(
         () =>
            arg.publish &&
            expect(`publish item`, () =>
               (0, _got.publish)(
                  token,
                  extension_id,
                  arg.trustedTesters ? 'trustedTesters' : 'default'
               )
            )
      )
   )
})

const deleteItem = (exports.deleteItem = arg => {
   const getTokenQuery = arg.getTokenQuery,
      deleteExtensions = arg.deleteExtensions

   checkGetTokenQuery(getTokenQuery)
   const expect = (0, _utils.createExpect)(arg.spinner)
   const zip = (0, _utils.extensionZip)(_manifest.deleteManifest)
   return expect(`fetch access token`, () =>
      (0, _got.getToken)(getTokenQuery)
   ).then(token =>
      deleteAll({
         token,
         zip,
         ids: deleteExtensions,
         spinner: arg.spinner
      })
   )
})

const deleteAll = ({ token, zip, ids, spinner }) =>
   Promise.all(
      ids.map(id => {
         const stream = zip.generateNodeStream()
         const promise = (0, _got.update)(token, stream, id)
         return spinner
            ? _ora2.default.promise(promise, `delete ${id}`)
            : promise
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
