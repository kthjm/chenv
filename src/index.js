import {resolve} from 'path'
import dtz from 'dtz'
import chromeWebstoreUpload from 'chrome-webstore-upload'

const {
    LOGIN_PASSWORD,
    EXTENSION_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN
} = process.env



const cream = async () => {
    if(!EXTENSION_ID){

    }else{
        const cws = createWebStore()
        const zip = await dtz(resolve(__dirname, 'app'))

        const token = await cws.fetchToken()

        const stream = zip.generateNodeStream()
        const resUpload = await cws.uploadExisting(stream, token)

        if (resUpload.uploadState === 'SUCCESS') {
           const target = `default`
           const resPublish = await cws.publish(target, token)
           console.log(resPublish)
        } else {
           console.error(resUpload)
        }

        return
    }
}

const createWebStore = () =>
   chromeWebstoreUpload({
      extensionId: EXTENSION_ID,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN
   })



async function zip() {
   const zip = await recursiveZip(resolve(__dirname, 'app'))
   const stream = zip.generateNodeStream()
   return
}

(()=>{
    const passwordInput = document.querySelector(`[type="password"]`);
    const passwordNext = document.getElementById(`passwordNext`);
    // (function(){
    // 	var input = document.querySelector("[type='password']")
    // 	var button = document.getElementById(`passwordNext`);
    //
    // 	input.value = "aoikokoro"
    // 	button.click()
    // })()
    //
    // https://chrome.google.com/webstore/developer/update?utm_source=InfinityNewtab&publisherId=g08406574947643510356
    // https://chrome.google.com/webstore/developer/update
    // document.querySelector("[type='file']").files
})()

async function upload() {
   const cws = createWebStore()
   const zip = await dtz(resolve(__dirname, 'app'))

   const token = await cws.fetchToken()

   const stream = zip.generateNodeStream()
   const resUpload = await cws.uploadExisting(stream, token)

   if (resUpload.uploadState === 'SUCCESS') {
      const target = `default`
      const resPublish = await cws.publish(target, token)
      console.log(resPublish)
   } else {
      console.error(resUpload)
   }

   return
}

// upload()
