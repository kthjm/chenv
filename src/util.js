// @flow

type Body = { [key]: any }

export const toBody = ({ body }: { body: Body | string }): Body =>
  typeof body === 'object'
  ? body
  : JSON.parse(body)

export const throws = (message) => {
  throw new Error(message)
}

export const asserts = (condition: any, message: string): void => {
  if (!condition) throws(message)
  return
}

export const joinParams = (params: { [key]: any }): string => {
  const entries =
  Object
  .entries(params)
  .filter(([ key, value ]) =>
    Boolean(value)
    || typeof value === 'boolean'
    || typeof value === 'number'
  )
  .map(([ key, value ]) =>
    `${key}=${value}`
  )
  
  return entries.length
  ? '?' + entries.join('&')
  : ''
}