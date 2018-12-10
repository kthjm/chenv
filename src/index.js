// @flow
export * from './token'
export * from './item'

import dtz from 'dtz'
import Zip from 'jszip'
import { asserts } from './util'
import { getAccessToken } from './token'
import {
  insertItem,
  updateItem,
  publishItem,
  checkItem,
} from './item'

const manifestMap = {
  ['remove']: {
    manifest_version: 2,
    name: '(removed)',
    version: '0',
  },
  ['create']: {
    manifest_version: 2,
    name: '',
    version: '0.0.0',
  },
}

const zipApp = async (src) => {
  asserts(src, `[chenv] src is ${src}`)
  const zip = await dtz(src)
  return zip.generateNodeStream()
}

const zipEmpty = (manifestJson): JSZip => {
  const zip = new Zip()
  zip.file('manifest.json', JSON.stringify(manifestJson))
  return zip.generateNodeStream()
}

export default class Chenv {
  constructor({ client_id, client_secret, refresh_token } = {}) {
    asserts(client_id, `client_id is required`)
    asserts(client_secret, `client_secret is required`)
    asserts(refresh_token, `refresh_token is required`)
    this.token = undefined
    this.credentials = { client_id, client_secret, refresh_token }
  }
  
  setToken() {
    return this.token
    ? false
    : getAccessToken(this.credentials).then(token => this.token = token)
  }
  
  async insertItem(src) {
    await this.setToken()
    return insertItem({
      token: this.token,
      body: await zipApp(src)
    })
  }
  
  async updateItem(id, src) {
    await this.setToken()
    return updateItem({
      token: this.token,
      body: await zipApp(src),
      id
    })
  }
  
  async publishItem(id, trustedTesters) {
    await this.setToken()
    return publishItem({
      token: this.token,
      target: trustedTesters ? 'trustedTesters' : 'default',
      id,
    })
  }
  
  async removeItem(id) {
    await this.setToken()
    return updateItem({
      token: this.token,
      body: zipEmpty(manifestMap['remove']),
      id
    })
  }
  
  async checkItem(id, projection) {
    await this.setToken()
    return checkItem({
      token: this.token,
      projection,
      id
    })
  }
}