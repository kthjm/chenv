// @flow
import got from 'got'
import { throws, asserts, joinParams, toBody } from './util'

const base_uri = `https://www.googleapis.com`

const insert_uri =
`${base_uri}/upload/chromewebstore/v1.1/items`

const update_uri = (id) =>
`${insert_uri}/${id}`

const check_uri = (id, projection) =>
`${base_uri}/chromewebstore/v1.1/items/${id}${joinParams({ projection })}`

const publish_uri = (id) =>
`${check_uri(id)}/publish`

const headers = (access_token) => {
  asserts(access_token, `[chenv] access_token is ${access_token}`)
  return {
    'x-goog-api-version': '2',
    'Authorization': `Bearer ${access_token}`
  }
}

export const insertItem = ({ token, body } = {}) => {
  asserts(body, `[chenv] body is ${body}`)
  return got(insert_uri, {
    method: 'POST',
    headers: headers(token),
    body
  })
  .then(requestHandler)
}

export const updateItem = ({ token, id, body } = {}) => {
  asserts(id, `[chenv] id is ${id}`)
  asserts(body, `[chenv] body is ${body}`)
  return got(update_uri(id), {
    method: 'PUT',
    headers: headers(token),
    body
  })
  .then(requestHandler)
}

export const publishItem = ({ token, id, target } = {}) => {
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

export const checkItem = ({ token, id, projection } = {}) => {
  asserts(id, `[chenv] id is ${id}`)
  return got(check_uri(id, projection), {
    method: 'GET',
    headers: headers(token)
  })
  .then(requestHandler)
}

const requestHandler = (res) => {
  const body = toBody(res)
  const { uploadState, itemError } = body
  return (!uploadState || uploadState === 'SUCCESS')
  ? body
  : throws(JSON.stringify(itemError || body))
}