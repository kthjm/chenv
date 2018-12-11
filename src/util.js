// @flow

type AnyObject = { [key: string]: any }

export const toBody = ({ body }: { body: AnyObject | string }): AnyObject =>
  typeof body === 'object'
  ? body
  : JSON.parse(body)

export const throws = (message: string): void => {
  throw new Error(message)
}

export const asserts = (condition: any, message: string): void => {
  if (!condition) throws(message)
  return
}

export const joinParams = (params: AnyObject): string => {
  const entries =
  Object
  .entries(params)
  .filter(([ key, value ]) =>
    Boolean(value)
    || typeof value === 'boolean'
    || typeof value === 'number'
  )
  .map(([ key, value ]) => {
    const str: any = value;(str: string)
    return `${key}=${str}`
  })

  return entries.length
  ? '?' + entries.join('&')
  : ''
}