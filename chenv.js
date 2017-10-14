#!/usr/bin/env node
const program = require('commander')
const ora = require('ora')
const { bgBlue, cyan, magenta } = require('chalk')
const dotenv = require('dotenv')
const { insertItem, updateItem, deleteItem } = require('./lib')

const spinner = ora()

const envWarn = ({ message }) =>
   console.warn(
      magenta(`
 warn: ${message}
`)
   )

const extractEnv = envPath =>
   Promise.resolve().then(() => {
      if (envPath) {
         const { error } = dotenv.config({ path: envPath })
         if (error) {
            envWarn(result.error)
         }
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
   .description('Insert item that not yet exist')
   .option(
      '-e, --env-file <dotenv>',
      'Path to dotenv file store environment variables'
   )
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
   .description('Update item that already exist')
   .option(
      '-e, --env-file <dotenv>',
      'Path to dotenv file store environment variables'
   )
   .option('-p, --publish', `Publish item directly after update`)
   .option('-t, --trusted-testers', `Set publishTarget "trustedTesters"`)
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
   .option(
      '-e, --env-file <dotenv>',
      'Path to dotenv file store environment variables'
   )
   .option('-p, --publish', `Publish directly after update (not insert)`)
   .option('-t, --trusted-testers', `Set publishTarget "trustedTesters"`)
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
   .command(`delete <id>`)
   .description('Update items as deleted style')
   .option(
      '-e, --env-file <dotenv>',
      'Path to dotenv file store environment variables'
   )
   .action((id, options) =>
      extractEnv(options.envFile)
         .then(({ getTokenQuery }) =>
            deleteItem({
               getTokenQuery,
               deleteExtensions: id.split(','),
               spinner
            })
         )
         .catch(errorHandler)
   )

program.on('--help', function() {
   console.log('')
   console.log('  Examples:')
   console.log('')
   console.log('    $ chenv deploy ./app -p')
   console.log(``)
   console.log(
      `      => process.env.EXTENSION_ID ? update(./app).then(publish) : insert(./app)`
   )
   console.log(``)
   console.log('    $ chenv delete id1,id2 -e .env')
   console.log('')
   console.log(`      => update [id1,id2] as "deleted style"(not deleted)`)
   console.log('')
})

program.parse(process.argv)
if (!program.args.length) {
   program.help()
}

function errorHandler(err) {
   if (typeof spinner === 'object' && spinner.text) {
      spinner.fail()
   }
   console.error(
      cyan(`
 ${err.message}
   `)
   )
   process.exit(1)
}
