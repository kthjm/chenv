# chenv
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/kthjm/chenv.svg?branch=master)](https://travis-ci.org/kthjm/chenv)
[![Coverage Status](https://coveralls.io/repos/github/kthjm/chenv/badge.svg?branch=master)](https://coveralls.io/github/kthjm/chenv?branch=master)

**chrome extension manager**

https://developer.chrome.com/webstore/webstore_api/items#resource

https://groups.google.com/a/chromium.org/forum/m/#!topic/chromium-apps/Orx2vQD-PSk

the value: Environment Variables Management

needs:
* CLIENT_ID
* CLIENT_SECRET
* REFRESH_TOKEN
* EXTENSION_ID

## Installation
```shell
yarn add -D chenv
```

## Usage

```json

scripts: {
    "insert": "chenv insert",
    "update": "chenv update",
    "deploy": "chenv deploy",
    "delete": "chenv delete"
}
```

```shell
chenv insert ./app
```
```shell
chenv update ./app
```
```shell
chenv deploy ./app
```
```shell
chenv delete ./app
```
