import assert from 'assert'
import rewire from 'rewire'
import sinon from 'sinon'
import Zip from 'jszip'

const client_id = 'client_id'
const client_secret = 'client_secret'
const refresh_token = 'refresh_token'
const credentials = { client_id, client_secret, refresh_token }

const stubMap = {
  ['dtz']: () => {
    const dtz = sinon.stub().resolves(
      new Zip()
    )

    return dtz
  },
  ['got']: () => {
    const got = sinon.stub().resolves({
      body: {
        uploadState: 'SUCCESS',
        itemError: [
          { error_detail: 'ERROR_DETAIL' }
        ],
        access_token: 'ACCESS_TOKEN',
        refresh_token: 'REFRESH_TOKEN',
      }
    })

    return got
  }
}

describe('chenv[method]()', () => {
  const modules = rewire('../src/Chenv')
  const Chenv = modules.Chenv

  const src = 'src'
  const id  = 'id'

  it('insertItem(src)', test((chenv, stubs) =>
    chenv.insertItem(src).then(() => {
      assert.equal(stubs.dtz.callCount, 1)
      assert.equal(stubs.got.callCount, 2)
    })
  ))

  it('updateItem(id, src)', test((chenv, stubs) =>
    chenv.updateItem(id, src).then(() => {
      assert.equal(stubs.dtz.callCount, 1)
      assert.equal(stubs.got.callCount, 2)
    })
  ))

  it('publishItem(id)', test((chenv, stubs) =>
    chenv.publishItem(id).then(() => {
      assert.equal(stubs.dtz.callCount, 0)
      assert.equal(stubs.got.callCount, 2)
    })
  ))

  it('removeItem(id)', test((chenv, stubs) =>
    chenv.removeItem(id).then(() => {
      assert.equal(stubs.dtz.callCount, 0)
      assert.equal(stubs.got.callCount, 2)
    })
  ))

  /*
  it('checkItem(id)', test((chenv, stubs) =>
    chenv.checkItem(id).then(() => {
      assert.equal(stubs.dtz.callCount, 0)
      assert.equal(stubs.got.callCount, 2)
    })
  ))
  */

  function test(callback) {
    return () => {
      const chenv = new Chenv(credentials)

      const stubs = {
        ['dtz']: stubMap['dtz'](),
        ['got']: stubMap['got'](),
      }

      const apiToken = rewire('../src/api.token')
      const apiItem = rewire('../src/api.item')
      const _got = { default: stubs['got'] }
      apiToken.__set__({ _got })
      apiItem.__set__({ _got })

      const locals = {
        ['_dtz']: { default: stubs['dtz'] },
        ['_api']: apiToken,
        ['_api2']: apiItem,
      }

      return modules.__with__(locals)(() => callback(chenv, stubs))
    }
  }
})

describe('throws', () => {
  const modules = rewire('../src/Chenv')
  const Chenv = modules.Chenv

  it('new Chenv()', () => {
    assert.throws(() => new Chenv())
  })

  it('zipApp(src)', async () => {
    const zipApp = modules.__get__('zipApp')
    const src = false
    try { await zipApp(src); assert.ok(false) }
    catch (err) { assert.ok(err) }
  })
})