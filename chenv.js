#!/usr/bin/env node
const program = require('commander')
const ora = require('ora')
const { bgBlue } = require('chalk')
const envParse = require('node-env-file')
const { insertItem, updateItem, deleteItem } = require('./lib')

const spinner = ora()

const extractEnv = env =>
   Promise.resolve().then(() => {
      if (env) {
         envParse(env)
      }

      const {
         CLIENT_ID,
         CLIENT_SECRET,
         REFRESH_TOKEN,
         EXTENSION_ID
      } = process.env

      return {
         getTokenQuery: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN
         },
         extension_id: EXTENSION_ID
      }
   })

program.version(require('./package.json').version)

program
   .command(`insert <source>`)
   .description('insert item that not yet exist')
   .option('-e, --env-file <DOTENV_FILE>', 'dotenv flle')
   .action((src, options) =>
      extractEnv(options.envFile)
         .then(({ getTokenQuery }) =>
            insertItem({
               src,
               getTokenQuery,
               spinner
            })
         )
         .catch(errorHandler)
   )

program
   .command(`update <source>`)
   .description('update item that already exist')
   .option('-e, --env-file <DOTENV_FILE>', 'dotenv flle')
   .option('-p, --publish', `publish directly`)
   .option('-t, --trusted-testers', `set publishTarget "trustedTesters"`)
   .action((src, options) =>
      extractEnv(options.envFile)
         .then(({ getTokenQuery, extension_id }) =>
            updateItem({
               src,
               getTokenQuery,
               extension_id,
               publish: options.publish,
               trustedTesters: options.trustedTesters,
               spinner
            })
         )
         .catch(errorHandler)
   )

program
   .command(`deploy <source>`)
   .description('!process.env.EXTENSION_ID ? insert : update')
   .option('-e, --env-file <DOTENV_FILE>', 'dotenv flle')
   .option('-p, --publish', `publish directly after "update" (not "insert")`)
   .option('-t, --trusted-testers', `set publishTarget "trustedTesters"`)
   .action((src, options) =>
      extractEnv(options.envFile)
         .then(({ getTokenQuery, extension_id }) => {
            if (extension_id) {
               console.log(bgBlue(' update '))
               return updateItem({
                  src,
                  getTokenQuery,
                  extension_id,
                  publish: options.publish,
                  trustedTesters: options.trustedTesters,
                  spinner
               })
            } else {
               console.log(bgBlue(' insert '))
               return insertItem({
                  src,
                  getTokenQuery,
                  spinner
               })
            }
         })
         .catch(errorHandler)
   )

program
   .command(`delete`)
   .description('update item as deleted style')
   .option('-e, --env-file <DOTENV_FILE>', 'dotenv flle')
   .option('--id <ID1, ID2>', `extension id to delete`)
   .action(options =>
      extractEnv(options.envFile)
         .then(({ getTokenQuery, extension_id }) => {
            const { id } = options

            if (!extension_id && !id) {
               throw new Error(
                  `error: missing required extension_id (process.env | option --id)`
               )
            }

            return deleteItem({
               getTokenQuery,
               deleteExtensions: extension_id ? [extension_id] : id.split(','),
               spinner
            })
         })
         .catch(errorHandler)
   )

program.parse(process.argv)
if (!program.args.length) {
   program.help()
}

function errorHandler(err) {
   if (typeof spinner === 'object' && spinner.text) {
      spinner.fail()
   }
   console.error(`
 ${err.message}
   `)
   process.exit(1)
}
