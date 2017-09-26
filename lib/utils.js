'use strict'

Object.defineProperty(exports, '__esModule', {
   value: true
})
exports.extensionZip = exports.tokenAndZip = exports.createExpect = undefined

var _dtz = require('dtz')

var _dtz2 = _interopRequireDefault(_dtz)

var _jszip = require('jszip')

var _jszip2 = _interopRequireDefault(_jszip)

var _got = require('./got.js')

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

function _asyncToGenerator(fn) {
   return function() {
      var gen = fn.apply(this, arguments)
      return new Promise(function(resolve, reject) {
         function step(key, arg) {
            try {
               var info = gen[key](arg)
               var value = info.value
            } catch (error) {
               reject(error)
               return
            }
            if (info.done) {
               resolve(value)
            } else {
               return Promise.resolve(value).then(
                  function(value) {
                     step('next', value)
                  },
                  function(err) {
                     step('throw', err)
                  }
               )
            }
         }
         return step('next')
      })
   }
}

const expect = (() => {
   var _ref = _asyncToGenerator(function*(text, afn) {
      this.start(text)
      const res = yield afn()
      this.succeed()
      this.text = ''
      return res
   })

   return function expect(_x, _x2) {
      return _ref.apply(this, arguments)
   }
})()
const stub = (() => {
   var _ref2 = _asyncToGenerator(function*(text, afn) {
      const res = yield afn()
      return res
   })

   return function stub(_x3, _x4) {
      return _ref2.apply(this, arguments)
   }
})()
const createExpect = (exports.createExpect = spinner =>
   typeof spinner === 'object' && spinner.start && spinner.succeed
      ? expect.bind(spinner)
      : stub)

const tokenAndZip = (exports.tokenAndZip = (() => {
   var _ref3 = _asyncToGenerator(function*(expect, getTokenQuery, src) {
      expect
      const token = yield expect(`fetch access token`, function() {
         return (0, _got.getToken)(getTokenQuery)
      })
      expect
      const zip = yield expect(`generate zip stream from ${src}`, function() {
         return srcToZipStream(src)
      })
      return { token, zip }
   })

   return function tokenAndZip(_x5, _x6, _x7) {
      return _ref3.apply(this, arguments)
   }
})())

const srcToZipStream = src =>
   (0, _dtz2.default)(src).then(res => res.generateNodeStream())

const extensionZip = (exports.extensionZip = json => {
   const zip = new _jszip2.default()
   zip.file('manifest.json', JSON.stringify(json, null, '\t'))
   return zip
})
