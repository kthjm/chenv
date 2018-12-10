// @flow

export const throws = (message) => {
  throw new Error(message)
}

export const asserts = (condition, message) => {
  return !condition && throws(message)
}

export const joinParams = (params) => {
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

export const toBody = ({ body }) =>
  typeof body === 'object'
  ? body
  : JSON.parse(body)