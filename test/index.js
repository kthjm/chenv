import assert from 'assert'
import rewire from 'rewire'
import sinon from 'sinon'
import envParse from 'node-env-file'

// this is used for local.
// setting {raise: false} is to avoid error in ci
// because dotenv file is ignore by git.
envParse('./test/.env', { raise: false })

const m = rewire('../src')

describe(`without CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN`, () => {
   const cause = undefined

   it(`insertItem`, () => {
      const insertItem = m.__get__(`insertItem`)
      assert.throws(
         () =>
            insertItem({
               src: '',
               getTokenQuery: {
                  client_id: cause,
                  client_secret: 'client_secret',
                  refresh_token: 'refresh_token'
               }
            }),
         /error: missing required process.env.CLIENT_ID/
      )
   })

   it(`updateItem`, () => {
      const updateItem = m.__get__(`updateItem`)
      assert.throws(
         () =>
            updateItem({
               src: '',
               getTokenQuery: {
                  client_id: 'client_id',
                  client_secret: cause,
                  refresh_token: 'refresh_token'
               }
            }),
         /error: missing required process.env.CLIENT_SECRET/
      )
   })

   it(`deleteItem`, () => {
      const deleteItem = m.__get__(`deleteItem`)
      assert.throws(
         () =>
            deleteItem({
               src: '',
               getTokenQuery: {
                  client_id: 'client_id',
                  client_secret: 'client_secret',
                  refresh_token: cause
               }
            }),
         /error: missing required process.env.REFRESH_TOKEN/
      )
   })
})

describe(`invalid CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN`, () => {
   const cause = {
      client_id: 'invalid_client_id',
      client_secret: 'invalid_client_secret',
      refresh_token: 'invalid_refresh_token'
   }

   const expect = `Response code 401 (Unauthorized)`

   it(`insertItem`, async () => {
      const insertItem = m.__get__(`insertItem`)
      try {
         await insertItem({ getTokenQuery: cause })
      } catch (err) {
         assert.deepStrictEqual(err.message, expect)
      }
   })

   it(`updateItem`, async () => {
      const updateItem = m.__get__(`updateItem`)
      try {
         await updateItem({ getTokenQuery: cause })
      } catch (err) {
         assert.deepStrictEqual(err.message, expect)
      }
   })

   it(`deleteItem`, async () => {
      const deleteItem = m.__get__(`deleteItem`)
      try {
         await deleteItem({ getTokenQuery: cause })
      } catch (err) {
         assert.deepStrictEqual(err.message, expect)
      }
   })
})

describe(`after getTokenQuery is valid`, () => {
   const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env
   const getTokenQuery = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN
   }

   describe(`invalid`, () => {
      it(`src === undefined via insertItem`, async () => {
         const cause = undefined
         const expect = 'source is undefined'

         const insertItem = m.__get__(`insertItem`)
         try {
            await insertItem({
               getTokenQuery,
               src: cause
            })
         } catch (err) {
            assert.equal(err.message, expect)
         }
      })

      it(`src === "./notExist" via updateItem`, async () => {
         const cause = `./notExist`
         const expect = 'ENOENT: no such file or directory, scandir'

         const updateItem = m.__get__(`updateItem`)
         try {
            await updateItem({
               getTokenQuery,
               src: cause
            })
         } catch (err) {
            const result = err.message.slice(0, expect.length)
            assert.equal(result, expect)
         }
      })

      it(`!src.inclides(manifest.json) via insertItem`, async () => {
         const cause = './test/withoutManifest'
         const expect = `Invalid package. Please make sure it is a valid zip file and the file manifest.json is at the root directory of the zip package.`

         const insertItem = m.__get__(`insertItem`)
         try {
            await insertItem({
               getTokenQuery,
               src: cause
            })
         } catch (err) {
            assert.deepStrictEqual(err.message, expect)
         }
      })

      it(`invalid extension_id via updateItem`, async () => {
         const cause = `not_exist_extension_id`
         const expect = `Application error (6): ${cause} not found`

         const updateItem = m.__get__(`updateItem`)
         try {
            await updateItem({
               getTokenQuery,
               src: './test/withManifest',
               extension_id: cause
            })
         } catch (err) {
            assert.deepStrictEqual(err.message, expect)
         }
      })
   })

   describe(`valid`, () => {
      it(`chenv update <source> -p`, async () => {
         const cause = true
         const updateItem = m.__get__(`updateItem`)

         const spy_publish = sinon.spy()
         const _got = {
            update: () => {},
            publish: spy_publish
         }

         await m.__with__({ _got })(() =>
            updateItem({
               getTokenQuery,
               src: './test/withManifest',
               extension_id: `not_exist_extension_id`,
               publish: cause
            })
         )

         assert.ok(spy_publish.calledOnce)
      })

      it(`chenv delete --id foo,bar,baa`, async () => {
         const cause = ['foo', 'bar', 'baa']
         const deleteItem = m.__get__(`deleteItem`)

         const spy_update = sinon.spy()
         const _got = {
            getToken: () => {},
            update: spy_update
         }
         await m.__with__({ _got })(() =>
            deleteItem({
               getTokenQuery,
               deleteExtensions: cause
            })
         )

         assert.deepStrictEqual(spy_update.callCount, cause.length)
      })
   })
})
