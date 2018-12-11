// @flow
import got from 'got'
import { throws, asserts, joinParams, toBody } from './util'

const base_uri = `https://www.googleapis.com`

const insert_uri =
`${base_uri}/upload/chromewebstore/v1.1/items`

const update_uri = (id) =>
`${insert_uri}/${id}`

const publish_uri = (id) =>
`${check_uri(id)}/publish`

const check_uri = (id, projection) =>
`${base_uri}/chromewebstore/v1.1/items/${id}${joinParams({ projection })}`

const headers = (access_token) => {
  asserts(access_token, `[chenv] access_token is invalid`)
  return {
    'x-goog-api-version': '2',
    'Authorization': `Bearer ${access_token}`
  }
}

export type ItemResource = {
  kind: string,
  id: string,
  publicKey: string,
  uploadState: string,
  itemError: { error_detail: string }[]
}

export const insertItem = ({ token, body }: {
  token: string,
  body: ReadableStream
} = {}): Promise<ItemResource> => {
  asserts(body, `[chenv] body is required`)

  return got(insert_uri, {
    method: 'POST',
    headers: headers(token),
    body
  })
  .then(requestHandler)
}

export const updateItem = ({ token, id, body }: {
  token: string,
  id: string,
  body: ReadableStream
} = {}): Promise<ItemResource> => {
  asserts(id, `[chenv] id is ${id}`)
  asserts(body, `[chenv] body is required`)

  return got(update_uri(id), {
    method: 'PUT',
    headers: headers(token),
    body
  })
  .then(requestHandler)
}

export const publishItem = ({ token, id, target }: {
  token: string,
  id: string,
  target: string
} = {}): Promise<ItemResource> => {
  asserts(id, `[chenv] id is ${id}`)
  asserts(target, `[chenv] target is ${target}`)

  return got(publish_uri(id), {
    method: 'POST',
    headers: headers(token),
    json: true,
    body: { target }
  })
  .then(requestHandler)
}

export const checkItem = ({ token, id, projection }: {
  token: string,
  id: string,
  projection?: string
} = {}): Promise<ItemResource> => {
  asserts(id, `[chenv] id is ${id}`)

  return got(check_uri(id, projection), {
    method: 'GET',
    headers: headers(token)
  })
  .then(requestHandler)
}

const requestHandler = (res: { body: ItemResource | string }): ItemResource => {
  const body = toBody(res)

  if (body.uploadState !== 'SUCCESS') {
    throws(JSON.stringify(body))
  }

  return body
}