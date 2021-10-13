const { expect } = require('chai')
const fs = require('fs')

var screenshot = async function(page, name, content) {
  console.log('taking a screenshot ' + name)
  await page.screenshot({path: '/artifacts/screenshots/' + name + '.png'})
  console.log('saving state of the DOM (source code)')
  fs.writeFile('/artifacts/dom-captures/' + name + '.html', content, function(err) {
    if (err) {
      return console.log(err);
    }
    else {
      console.log('File ' + name + ' has been saved.');
      result = true
    }
    expect(result).to.be.true;
  });
}

it('It should be possible to interact with the site', async function() {
  this.timeout(50000);
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  var result = false
  try {
    const page = await browser.newPage()
    console.log('set viewport')
    await page.setViewport({ width: 1280, height: 800 })
    console.log('go to the home page')
    await page.goto('http://' + process.env.DOMAIN + '/index.html')
    await page.waitForSelector('.clickme')
    await page.click('.clickme')
    await page.waitForSelector('.show-on-click')
    await screenshot(page, 'after-click', await page.content());
  }
  catch (error) {
    console.log('Exception alert')
    await browser.close()
    console.log(error);
  }
  await browser.close()
});

it('The config file should be good', async function() {
  this.timeout(50000);
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({
     headless: true,
     args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  var result = false
  try {
    const page = await browser.newPage()
    console.log('set viewport')
    await page.setViewport({ width: 1280, height: 800 })
    console.log('go to the home page')
    const response = await page.goto('http://' + process.env.DOMAIN + '/admin/')
    await page.waitForSelector('h1,button')
    content = await page.content();
    await screenshot(page, 'debug-netlify', content);
    expect(content).to.not.have.string('Config Errors');
  }
  catch (error) {
    console.log('Exception alert')
    await browser.close()
    console.log(error);
  }
  await browser.close()
});
