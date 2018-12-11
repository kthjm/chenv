# chenv

[![npm](https://img.shields.io/npm/v/chenv.svg?style=flat-square)](https://www.npmjs.com/package/chenv)
[![npm](https://img.shields.io/npm/dm/chenv.svg?style=flat-square)](https://www.npmjs.com/package/chenv)
[![Build Status](https://img.shields.io/travis/kthjm/chenv.svg?style=flat-square)](https://travis-ci.org/kthjm/chenv)
[![Coverage Status](https://img.shields.io/codecov/c/github/kthjm/chenv.svg?style=flat-square)](https://codecov.io/github/kthjm/chenv)

[![](https://i.gyazo.com/39ffa21462c1212d0e53077b6b4a51b7.jpg)](https://www.google.com/search?q=jackie+chan+drunken+master+2&tbm=isch)

cli tool to manage Chrome Web Store item.

#### Why?
- no need zip
- using `.env` as config file

## Setup

#### 1. set credentials in `.env`
```
CLIENT_ID=XXXXXXXXXX
CLIENT_SECRET=XXXXXXXXXX
```
#### 2. install and `auth`
```shell
yarn add -D chenv
yarn chenv auth
...
> REFRESH_TOKEN=XXXXXXXXXX
```
#### 3. set REFRESH_TOKEN in `.env`
```
CLIENT_ID=XXXXXXXXXX
CLIENT_SECRET=XXXXXXXXXX
REFRESH_TOKEN=XXXXXXXXXX
```

## Usage

```shell
Usage: chenv [options] [command]

Options:
  -V, --version                output the version number
  -h, --help                   output usage information

Commands:
  auth [options]               get REFRESH_TOKEN easily
  upload [options] <src> [id]  upload item (!id ? insert : update)
  remove [options] <id>        not remove but update item as "removed-like"
```
**WARNING**: No way to remove item from dashboard, Don't forget to set `id` when update item by `upload`. Or new item that has same name will be created.

## Ref
- [Using the Chrome Web Store Publish API](https://developer.chrome.com/webstore/using_webstore_api)
- [Chrome Web Store Developer Dashboard - Delete Extensions](https://groups.google.com/a/chromium.org/forum/#!topic/chromium-apps/4lu5AkM6bZw)
- [Remove app from Developer Dashboard](https://groups.google.com/a/chromium.org/forum/m/#!topic/chromium-apps/Orx2vQD-PSk)

## License
MIT (http://opensource.org/licenses/MIT)
