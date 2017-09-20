import puppeteer from "puppeteer";

(async ()=>{
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`https://github.com/kthjm`)
    await page.screenshot({path: `kthjm.png`})

    await browser.close()
})()
