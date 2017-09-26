// @flow
import got from 'got'

const refreshTokenURI = 'https://accounts.google.com/o/oauth2/token'
const rootURI = `https://www.googleapis.com`
const insertURI = (): string => `${rootURI}/upload/chromewebstore/v1.1/items`
const updateURI = (id: string): string =>
   `${rootURI}/upload/chromewebstore/v1.1/items/${id}`
const publishURI = (id: string, target: string): string =>
   `${rootURI}/chromewebstore/v1.1/items/${id}/publish?publishTarget=${target}`

export type GetTokenQuery = {
   client_id: string,
   client_secret: string,
   refresh_token: string
}
type GetTokenAfn = (arg: GetTokenQuery) => Promise<string>

export const getToken: GetTokenAfn = ({
   client_id,
   client_secret,
   refresh_token
}) =>
   got
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
      .then((body: { access_token: string }) => body.access_token)

export const insert = (token: string, zip: any): Promise<void> =>
   got
      .post(insertURI(), { headers: _headers(token), body: zip })
      .then(jsonBody)
      .then(throwByUplodState)

export const update = (token: string, zip: any, id: string): Promise<void> =>
   got
      .put(updateURI(id), { headers: _headers(token), body: zip })
      .then(jsonBody)
      .then(throwByUplodState)

export const publish = (
   token: string,
   id: string,
   target: string
): Promise<void> =>
   got
      .post(publishURI(id, target), { headers: _headers(token), json: true })
      .then(jsonBody)
      .then(throwByUplodState)

const jsonBody = ({ body }) =>
   typeof body === 'object' ? body : JSON.parse(body)

const _headers = token => ({
   Authorization: `Bearer ${token}`,
   'x-goog-api-version': '2'
})

type ThrowByUplodStateFn = (body: {
   uploadState: string,
   itemError: Array<{ error_detail: string }>
}) => void

const throwByUplodState: ThrowByUplodStateFn = ({ uploadState, itemError }) => {
   if (uploadState !== 'SUCCESS') {
      throw new Error(itemError[0].error_detail)
   }
   return
}
