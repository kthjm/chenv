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

type UploadState =
'SUCCESS'
| 'IN_PROGRESS'
| 'FAILURE'
| 'NOT_FOUND'

export type UploadResponse = {
  kind: string,
  id: string,
  publicKey: string,
  uploadState: UploadState,
  itemError: { error_detail: string }[],
}

type PublishStatus =
'OK' // not documented but exist
| 'NOT_AUTHORIZED'
| 'INVALID_DEVELOPER'
| 'DEVELOPER_NO_OWNERSHIP'
| 'DEVELOPER_SUSPENDED'
| 'ITEM_NOT_FOUND'
| 'ITEM_PENDING_REVIEW'
| 'ITEM_TAKEN_DOWN'
| 'PUBLISHER_SUSPENDED'

export type PublishResponse = {
  kind: string,
  item_id: string,
  status: PublishStatus[],
  statusDetail: string[],
}

export const insertItem = ({ token, body }: {
  token: string,
  body: ReadableStream
} = {}): Promise<UploadResponse> => {
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
} = {}): Promise<UploadResponse> => {
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
} = {}): Promise<PublishResponse> => {
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
} = {}): Promise<UploadResponse> => {
  asserts(id, `[chenv] id is ${id}`)

  return got(check_uri(id, projection), {
    method: 'GET',
    headers: headers(token)
  })
  .then(requestHandler)
}

type RequestHandler = (response: {
  body: UploadResponse | PublishResponse | string
}) => UploadResponse | PublishResponse

const requestHandler: RequestHandler = (response) => {
  const body = toBody(response)
  const { uploadState, status } = body

  asserts(
    uploadState === 'SUCCESS' ||
    uploadState === 'IN_PROGRESS' ||
    (Array.isArray(status) && status.includes('OK')),
    JSON.stringify(body)
  )

  return body
}