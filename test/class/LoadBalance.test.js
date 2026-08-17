import {
  getOwnIpAddresses,
} from 'manner.js/server';
import LoadBalance from '~/class/LoadBalance';

describe('[class] LoadBalance;', () => {
  test('LoadBlance should be able to obtain the load balancing URL.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    expect(loadBalance.getLocation('/login')).toMatch('https://www-mstr-1.manner.io:80/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv-1.manner.io:1024/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv-2.manner.io:80/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv-2.manner.io:1024/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv-2.manner.io:1025/login');
  });

  test('LoadBalance when enable should be able to generate a redirect HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    const now = Date.now();
    await loadBalance.startUp();
    loadBalance.setTemporaryHostnameResolve({
      'www-mstr-1.manner.io': '127.0.0.1',
      'www-slv-1.manner.io': '127.0.0.1',
      'www-slv-2.manner.io': '192.168.1.2',
    });
    loadBalance.setLoadBalanceTime(now);
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    expect(loadBalance.getHtmlContent(undefined, 'https://www-slv-2.manner.io:1025/login')).toMatch(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=${now})&&(window.location=\"https://www-slv-2.manner.io:1025/login\")</script>`);
  });

  test('LoadBalance when disable should be able to generate a normal HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      enable: false,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    expect(loadBalance.getHtmlContent(undefined, 'https://www-slv-1.manner.io:1024/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance when pointing to oneself should be able to generate a normal HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    const [addr] = getOwnIpAddresses();
    await loadBalance.startUp();
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    expect(loadBalance.getHtmlContent('/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance should be able to resolve DNS correctly', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    const [addr] = getOwnIpAddresses();
    await loadBalance.startUp();
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    expect(loadBalance.getHtmlContent('/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance should be able record logs correctly', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      orderIndex: true,
      logInterval: 3,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    const [addr] = getOwnIpAddresses();
    await loadBalance.startUp();
    const now = Date.now();
    loadBalance.setLoadBalanceTime(now);
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    expect(loadBalance.getHtmlContent('/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script><main id=root>');
    expect(loadBalance.getHtmlContent('/login')).toMatch(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=${now})&&(window.location=\"https://www-slv-1.manner.io:1024/login?loadBalanceTime=${now}\")</script>`);
    expect(loadBalance.getHtmlContent('/login')).toMatch(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=${now})&&(window.location=\"https://www-slv-2.manner.io:80/login?loadBalanceTime=${now}\")</script>`);
    expect(loadBalance.getHtmlContent('/login')).toMatch(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=${now})&&(window.location=\"https://www-slv-2.manner.io:1024/login?loadBalanceTime=${now}\")</script>`);
    expect(loadBalance.getHtmlContent('/login')).toMatch(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=${now})&&(window.location=\"https://www-slv-2.manner.io:1025/login?loadBalanceTime=${now}\")</script>`);
  });

  test('LoadBalance should be able to calculate master load-related data', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    await loadBalance.startUp();
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    for (let i = 0; i < 20; i += 1) {
      loadBalance.getHtmlContent('/login');
    }
    const redirect = loadBalance.getRedirect();
    expect(redirect).toBeGreaterThan(2);
    expect(redirect).toBeLessThan(3);
    const myself = loadBalance.getMyself();
    expect(myself).toBeGreaterThan(0);
    expect(myself).toBeLessThan(2);
    const load = loadBalance.getLoad();
    expect(load).toBeGreaterThan(51);
    expect(load).toBeLessThan(66);
  });

  test('LoadBalance should be able to calculate slave load-related data', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 1024, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    await loadBalance.startUp();
    loadBalance.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    for (let i = 0; i < 20; i += 1) {
      loadBalance.getHtmlContent('/login');
    }
    const redirect = loadBalance.getRedirect();
    expect(redirect).toBeGreaterThan(1);
    expect(redirect).toBeLessThan(2.1);
    const myself = loadBalance.getMyself();
    expect(myself).toBeGreaterThan(0);
    expect(myself).toBeLessThan(2);
    const load = loadBalance.getLoad();
    expect(load).toBeGreaterThan(45);
    expect(load).toBeLessThan(60);
  });

  test('LoadBalance should be able to automatically calculate its weight', async () => {
    const loadBalance1 = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    await loadBalance1.startUp();
    loadBalance1.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    for (let i = 0; i < 20; i += 1) {
      loadBalance1.getHtmlContent('/login');
    }
    const masterData = loadBalance1.getData();
    const loadBalance2 = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 1024, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    await loadBalance2.startUp();
    loadBalance2.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    for (let i = 0; i < 20; i += 1) {
      loadBalance2.getHtmlContent('/login');
    }
    const slaveData = loadBalance2.getData();
    const w = LoadBalance.getDeltaWeightWhenSlaveEnable(masterData, slaveData);
    expect(w).toBeGreaterThan(0.13);
    expect(w).toBeLessThan(0.44);
    loadBalance1.setWeight(w);
    loadBalance2.setWeight(w);
    expect(loadBalance1.options.weight).toBeGreaterThan(0.13);
    expect(loadBalance1.options.weight).toBeLessThan(0.44);
    expect(loadBalance2.options.weight).toBeGreaterThan(0.13);
    expect(loadBalance2.options.weight).toBeLessThan(0.44);
  });

  test('LoadBalance should be able to generate new master nodes.', async () => {
    const loadBalance1 = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 80, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    loadBalance1.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    await loadBalance1.startUp();
    for (let i = 0; i < 20; i += 1) {
      loadBalance1.getHtmlContent('/login');
    }
    const loadBalance2 = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
      computeInterval: 1,
      orderIndex: true,
    }, 1024, [
      ['www-mstr-1.manner.io', 80],
      ['www-slv-1.manner.io', 1024],
      ['www-slv-2.manner.io', 80],
      ['www-slv-2.manner.io', 1024],
      ['www-slv-2.manner.io', 1025],
    ]);
    loadBalance2.setHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="favicon.png" />
          <script defer="defer" src="main.bundle.js"></script>
        </head>
        <body>
          <main id="root" />
        </body>
      </html>
    `);
    await loadBalance2.startUp();
    for (let i = 0; i < 20; i += 1) {
      loadBalance2.getHtmlContent('/login');
    }
    LoadBalance.removeHttpHandle(['www-mstr-1.manner.io', 80], [
      loadBalance1,
      loadBalance2,
    ]);
    expect(JSON.stringify(loadBalance2.httpHandles)).toMatch('[[\"www-slv-1.manner.io\",80],[\"www-slv-2.manner.io\",80],[\"www-slv-2.manner.io\",1024],[\"www-slv-2.manner.io\",1025]]');
  });
});
