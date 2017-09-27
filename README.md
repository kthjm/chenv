# chenv
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/kthjm/chenv.svg?branch=master)](https://travis-ci.org/kthjm/chenv)
[![Coverage Status](https://coveralls.io/repos/github/kthjm/chenv/badge.svg?branch=master)](https://coveralls.io/github/kthjm/chenv?branch=master)

A CLI tool to deploy chrome extension continuously by enviroment variables.

There is no need to touch zip file anymore with chenv.

<!-- ![](https://nysanda.files.wordpress.com/2014/11/shaolinwoodenmen_hongkonglegends_movie_29.png) -->

## Setup
At first, you need to get 3 acccess keys via Chrome Web Store API.
* `CLIENT_ID`
* `CLIENT_SECRET`
* `REFRESH_TOKEN`

[Here](https://developer.chrome.com/webstore/using_webstore_api) is how to get them that are used as environment variables in chenv.

## Installation
```shell
yarn add -D chenv
```
## Usage

```shell
Usage: chenv [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    insert [options] <source>  Insert item that not yet exist
    update [options] <source>  Update item that already exist
    deploy [options] <source>  !process.env.EXTENSION_ID ? insert : update
    delete [options] <id>      Update items as deleted style
```

`<source>` should be just a folder contain `manifest.json` not zip file.

## Commands

All commands have `-e, --env-file` option that path to dotenv file store 3 variables above.

dotenv file like:
```env
CLIENT_ID=XXXXXXXX
CLIENT_SECRET=XXXXXXXX
REFRESH_TOKEN=XXXXXXXX
EXTENSION_ID=XXXXXXXX # after insert
```
This file is parsed by [node-env-file](https://github.com/grimen/node-env-file). If not exist in process cause only warning without error.

### insert

[Inserts a new item](https://developer.chrome.com/webstore/webstore_api/items/insert) has option only `-e`.

### update

[Updates an existing item](https://developer.chrome.com/webstore/webstore_api/items/update) requires `process.env.EXTENSION_ID`.

#### options
`-p, --publish`  
`-t, --trusted-testers`

Both are about [Items:Publish](https://developer.chrome.com/webstore/webstore_api/items/publish). If `-p`, The item will be published directly after update.

### deploy

Works as `!process.env.EXTENSION_ID ? insert : update`.

This is useful in cases such as deploying applications that have not yet deployed via ci service.

If you use [travis's script deployment](https://docs.travis-ci.com/user/deployment/script/), setting like:

.travis.yml
```yml
deploy:
  provider: script
  script: yarn deploy
  skip_cleanup: true
  on:
    tags: true
```
package.json
```json
scripts: {
  "deploy": "node ./node_modules/chenv/chenv.js deploy ./app -p"
}
```
The way that refering chenv.js via `node_modules/.bin` will be [failed](https://github.com/travis-ci/travis-ci/issues/8505) in travis's script deployment.

But using `deploy` is also dangerous because Chrome Web Store Dashboard doesn't allow developers to remove item from dashboard. So if you miss setting the item's id as `EXTENSION_ID` variable in environment after first `deploy`, and if the next `deploy`, you insert as new the same item to dashboard even though it has same name. And there is no way to remove it now. This is unpleasant.

* [Chrome Web Store Developer Dashboard - Delete Extensions](https://groups.google.com/a/chromium.org/forum/#!topic/chromium-apps/4lu5AkM6bZw)
* [Remove app from Developer Dashboard](https://groups.google.com/a/chromium.org/forum/m/#!topic/chromium-apps/Orx2vQD-PSk)


### delete

`delete` update item as deleted style. argument `<id>` can take multiple by a comma.
"deleted style" means not to delete item but change exist item's name and version.
To distinguish between "real" and "deleted" extensions like this:

![](https://i.gyazo.com/94b02957e23015795a13ef991e600589.png)

This is suffering solution to the problem `deploy` can cause.

## License
MIT (http://opensource.org/licenses/MIT)
