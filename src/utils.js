// @flow
import dtz from 'dtz'
import JSZip from 'jszip'
import { getToken, type GetTokenQuery } from './got.js'
import type { Readable } from 'stream'

type Ora = {
   start(text: string): void,
   succeed(): void,
   text: string
}
export type Spinner = Ora | boolean

export type ExpectAfn<T> = (text: string, afn: () => Promise<T>) => Promise<T>

const expect: ExpectAfn<*> = async function(text, afn) {
   this.start(text)
   const res: * = await afn()
   this.succeed()
   this.text = ''
   return res
}
const stub: ExpectAfn<*> = async function(text, afn) {
   const res: * = await afn()
   return res
}
export const createExpect = (spinner: Spinner | void): ExpectAfn<*> =>
   typeof spinner === 'object' && spinner.start && spinner.succeed
      ? expect.bind(spinner)
      : stub

export const tokenAndZip = async (
   expect: ExpectAfn<any>,
   getTokenQuery: GetTokenQuery,
   src: string
): Promise<{
   token: string,
   zip: Readable
}> => {
   ;(expect: ExpectAfn<string>)
   const token: string = await expect(`fetch access token`, () =>
      getToken(getTokenQuery)
   )
   ;(expect: ExpectAfn<Readable>)
   const zip: Readable = await expect(`generate zip stream`, () =>
      srcToZipStream(src)
   )
   return { token, zip }
}

const srcToZipStream = (src: string): Promise<Readable> =>
   dtz(src).then(res => res.generateNodeStream())

export const extensionZip = (json: any): JSZip => {
   const zip = new JSZip()
   zip.file('manifest.json', JSON.stringify(json, null, '\t'))
   return zip
}
