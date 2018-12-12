// @flow
import got from 'got'
import { asserts, joinParams, toBody } from './util'

const oauth2_uri = 'https://accounts.google.com/o/oauth2'
const auth_uri = `${oauth2_uri}/auth`
const token_uri = `${oauth2_uri}/token`
const redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'

export const authURL = (client_id: string): string => {
  asserts(client_id, `[chenv] client_id is required`)
  
  return auth_uri + joinParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/chromewebstore'
  })
}

export const getRefreshToken = ({ client_id, client_secret, code }: {
  client_id: string,
  client_secret: string,
  code: string
} = {}): Promise<string> => {
  asserts(client_id, `[chenv] client_id is required`)
  asserts(client_secret, `[chenv] client_secret is required`)
  asserts(code, `[chenv] code is required`)
  
  return got(token_uri, {
    method: 'POST',
    json: true,
    body: {
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }
  })
  .then(toBody)
  .then(({ refresh_token }) => refresh_token)
}

export const getAccessToken = ({ client_id, client_secret, refresh_token }: {
  client_id: string,
  client_secret: string,
  refresh_token: string
} = {}): Promise<string> => {
  asserts(client_id, `[chenv] client_id is required`)
  asserts(client_secret, `[chenv] client_secret is required`)
  asserts(refresh_token, `[chenv] refresh_token is required`)
  
  return got(token_uri, {
    method: 'POST',
    json: true,
    body: {
      client_id,
      client_secret,
      refresh_token,
      redirect_uri,
      grant_type: 'refresh_token'
    }
  })
  .then(toBody)
  .then(({ access_token }) => access_token)
}