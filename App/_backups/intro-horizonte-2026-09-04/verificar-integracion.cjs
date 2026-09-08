const { chromium } = require('C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
  fs.readFile(file, (err, data) => {res.writeHead(err ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});res.end(err ? '' : data);});
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const url = `http://127.0.0.1:${server.address().port}/index.html`;
    for (const [name,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);
      const overlay=page.locator('.technova-horizon-overlay');
      await overlay.waitFor();
      const frame=page.frameLocator('.technova-horizon-overlay iframe');
      await frame.locator('[data-skip]').waitFor();
      assert.equal(await page.locator('.dashboard').evaluate(e=>e.inert),true);
      const box=await overlay.boundingBox();assert.equal(box.width,width);assert.equal(box.height,height);
      if(name==='desktop') {
        await frame.locator('[data-pause]').click({force:true});
        await page.waitForTimeout(11000);
        assert.equal(await overlay.count(),1);
        await frame.locator('[data-pause]').click({force:true});
        await overlay.waitFor({state:'detached',timeout:14000});
      } else {
        await page.waitForTimeout(6500);
        await page.screenshot({path:path.join(__dirname,`${name}.png`)});
        await frame.locator('[data-skip]').click();
        await overlay.waitFor({state:'detached'});
      }
      assert.equal(await page.locator('.dashboard').evaluate(e=>e.inert),false);
      await page.waitForTimeout(3500);
      console.log(JSON.stringify({name,errors,overlayRemoved:true,inertRestored:true}));
      await page.close();
    }
    const page=await browser.newPage({reducedMotion:'reduce'});await page.goto(url);
    assert.equal(await page.locator('.technova-horizon-overlay').count(),0);
    console.log('reduced-motion: OK');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
