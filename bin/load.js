import dotenv from 'dotenv'
import { join } from 'path'

const cwd = process.cwd()

export const CONFIG = 'chenv.config.js'

export const loadCredentials = (envValue) => {
  const { error } = dotenv.config({
    path: (envValue && typeof envValue === 'string')
    ? envValue
    : join(cwd, '.env')
  })

  if (error) console.warn(error.message)

  const {
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    REFRESH_TOKEN: refresh_token,
  } = process.env

  return { client_id, client_secret, refresh_token }
}

export const loadConfig = (configValue) => {
  let config = {}
  
  if (configValue) {
    config = require(join(cwd, configValue))
  } else {
    try {
      config = require(join(cwd, CONFIG))
    } catch(err) {
      if (!err.message.includes(CONFIG)) throw err
      try {
        const { chenv = {} } = require(join(cwd, 'package.json')) || {}
        config = chenv
      } catch(err) {
        if (!err.message.includes('package.json')) throw err
      }
    }
  }
  
  return 'default' in config ? config['default'] : config
}

/*
export const loadRequire = (requireValue) => 
  requireValue
  .split(',')
  .forEach(moduleName => require(moduleName))
*/