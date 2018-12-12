// @flow
import dtz from 'dtz'
import Zip from 'jszip'
import { asserts } from './util'
import { getAccessToken } from './api.token'
import {
  insertItem,
  updateItem,
  publishItem,
  checkItem,
  type UploadResponse,
  type PublishResponse,
} from './api.item'

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

const zipEmpty = (manifestJson) => {
  const zip = new Zip()
  zip.file('manifest.json', JSON.stringify(manifestJson))
  return zip.generateNodeStream()
}

type Credentials = {
  client_id: string,
  client_secret: string,
  refresh_token: string,
}

export class Chenv {
  token: string
  credentials: Credentials

  constructor({ client_id, client_secret, refresh_token }: Credentials = {}) {
    asserts(client_id, `client_id is required`)
    asserts(client_secret, `client_secret is required`)
    asserts(refresh_token, `refresh_token is required`)
    this.token = ''
    this.credentials = { client_id, client_secret, refresh_token }
  }

  setToken() {
    return this.token
    ? false
    : getAccessToken(this.credentials).then(token => this.token = token)
  }

  async insertItem(src: string): Promise<UploadResponse> {
    await this.setToken()
    return insertItem({
      token: this.token,
      body: await zipApp(src)
    })
  }

  async updateItem(id: string, src: string): Promise<UploadResponse> {
    await this.setToken()
    return updateItem({
      token: this.token,
      body: await zipApp(src),
      id
    })
  }

  async publishItem(id: string, trustedTesters?: boolean): Promise<PublishResponse> {
    await this.setToken()
    return publishItem({
      token: this.token,
      target: trustedTesters ? 'trustedTesters' : 'default',
      id,
    })
  }

  async removeItem(id: string): Promise<UploadResponse> {
    await this.setToken()
    return updateItem({
      token: this.token,
      body: zipEmpty(manifestMap['remove']),
      id
    })
  }

  /*
  ref: https://developer.chrome.com/webstore/webstore_api/items/get
  async checkItem(id: string, projection: string): Promise<UploadResponse> {
    await this.setToken()
    return checkItem({
      token: this.token,
      projection,
      id
    })
  }
  */
}