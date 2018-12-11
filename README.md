# chenv

[![npm](https://img.shields.io/npm/v/chenv.svg?style=flat-square)](https://www.npmjs.com/package/chenv)
[![npm](https://img.shields.io/npm/dm/chenv.svg?style=flat-square)](https://www.npmjs.com/package/chenv)
[![Build Status](https://img.shields.io/travis/kthjm/chenv.svg?style=flat-square)](https://travis-ci.org/kthjm/chenv)
[![Coverage Status](https://img.shields.io/codecov/c/github/kthjm/chenv.svg?style=flat-square)](https://codecov.io/github/kthjm/chenv)

![](https://i1.wp.com/www.memories-of-movie.com/wp-content/uploads/2015/07/suiken02-1.jpg)

CLI tool to manage Chrome Web Store item.

- Using `.env` as config file
- No need zip

## Setup

#### 1. set credentials in `.env`
```
CLIENT_ID=XXXXXXXXXX
CLIENT_SECRET=XXXXXXXXXX
```
#### 2. install and `init`
```shell
yarn add -D chenv
yarn chenv init
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
  init [options]               get REFRESH_TOKEN easily
  upload [options] <src> [id]  upload item (!id ? insert : update)
  remove [options] <id>        not remove but update item as "removed-like"
```

## Ref
- [Using the Chrome Web Store Publish API](https://developer.chrome.com/webstore/using_webstore_api)
- [Chrome Web Store Developer Dashboard - Delete Extensions](https://groups.google.com/a/chromium.org/forum/#!topic/chromium-apps/4lu5AkM6bZw)
- [Remove app from Developer Dashboard](https://groups.google.com/a/chromium.org/forum/m/#!topic/chromium-apps/Orx2vQD-PSk)

## License
MIT (http://opensource.org/licenses/MIT)
