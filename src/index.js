// @flow
import ora from 'ora'
import { getToken, insert, update, publish, type GetTokenQuery } from './got.js'
import {
   createExpect,
   tokenAndZip,
   extensionZip,
   type Spinner
} from './utils.js'
import { createManifest, deleteManifest } from './manifest.js'

type InsertItem$Arg = {
   src: string,
   getTokenQuery: GetTokenQuery,
   spinner?: Spinner
}
export const insertItem = (arg: InsertItem$Arg): Promise<*> => {
   const { getTokenQuery, src } = arg
   checkGetTokenQuery(getTokenQuery)
   checkIfString(src, `src`)

   const expect = createExpect(arg.spinner)
   return tokenAndZip(expect, getTokenQuery, src).then(({ token, zip }) =>
      expect(`insert item`, (): Promise<void> => insert(token, zip))
   )
}

type UpdataItem$Arg = {
   src: string,
   getTokenQuery: GetTokenQuery,
   extension_id: string,
   publish?: boolean,
   trustedTesters?: boolean,
   spinner?: Spinner
}
export const updateItem = (arg: UpdataItem$Arg): Promise<*> => {
   const { getTokenQuery, extension_id, src } = arg
   checkGetTokenQuery(getTokenQuery)
   checkIfString(extension_id, `process.env.EXTENSION_ID`)
   checkIfString(src, `src`)

   const expect = createExpect(arg.spinner)
   return tokenAndZip(expect, getTokenQuery, src).then(({ token, zip }) =>
      expect(`update item`, (): Promise<void> =>
         update(token, zip, extension_id)
      ).then(
         () =>
            arg.publish &&
            expect(`publish item`, () =>
               publish(
                  token,
                  extension_id,
                  arg.trustedTesters ? 'trustedTesters' : 'default'
               )
            )
      )
   )
}

export const deleteItem = (arg: {
   getTokenQuery: GetTokenQuery,
   deleteExtensions: Array<string>,
   spinner?: Spinner
}): Promise<*> => {
   const { getTokenQuery, deleteExtensions } = arg
   checkGetTokenQuery(getTokenQuery)
   const expect = createExpect(arg.spinner)
   const zip = extensionZip(deleteManifest)
   return expect(`fetch access token`, () => getToken(getTokenQuery)).then(
      (token: string) =>
         deleteAll({
            token,
            zip,
            ids: deleteExtensions,
            spinner: arg.spinner
         })
   )
}

const checkIfString = (target: string, key: string): void => {
   if (!target || typeof target !== 'string') {
      throwMessage(key)
   }
}

const deleteAll = ({ token, zip, ids, spinner }) =>
   Promise.all(
      ids.map(id => {
         const stream = zip.generateNodeStream()
         const promise = update(token, stream, id)
         return spinner ? ora.promise(promise, `delete ${id}`) : promise
      })
   )

const checkGetTokenQuery = query =>
   ['client_id', 'client_secret', 'refresh_token'].forEach(key => {
      if (!query[key]) {
         throwMessage(`process.env.${key.toUpperCase()}`)
      }
   })

const throwMessage = message => {
   throw new Error(`error: missing required ${message}`)
}
