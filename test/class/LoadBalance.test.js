import LoadBalance from '~/class/LoadBalance';

describe('[class] LoadBalance;', () => {
  test('LoadBlance should be able to obtain the load balancing URL.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      orderIndex: true,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    expect(loadBalance.getLocation('/login')).toMatch('https://www-mstr.manner.io:80/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv1.manner.io:1024/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv2.manner.io:80/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv2.manner.io:1024/login');
    expect(loadBalance.getLocation('/login')).toMatch('https://www-slv2.manner.io:1025/login');
  });

  test('LoadBalance when enable should be able to generate a redirect HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'test',
      enable: true,
      minify: true,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    loadBalance.setTemporaryCNAME_HASH({
      'www-mstr.manner.io': '127.0.0.1',
      'www-slv1.manner.io': '192.168.1.1',
      'www-slv2.manner.io': '192.168.1.2',
      'www-slv2.manner.io': '192.168.1.3',
      'www-slv2.manner.io': '192.168.1.4',
    });
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
    expect(loadBalance.getHtmlContent(undefined, 'https://www-slv2.manner.io:1025/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=void 0)&&(window.location=\"https://www-slv2.manner.io:1025/login\")</script><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance when disable should be able to generate a normal HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      enable: false,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    loadBalance.setTemporaryCNAME_HASH({
      'www-mstr.manner.io': '127.0.0.1',
      'www-slv1.manner.io': '192.168.1.1',
      'www-slv2.manner.io': '192.168.1.2',
      'www-slv2.manner.io': '192.168.1.3',
      'www-slv2.manner.io': '192.168.1.4',
    });
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
    expect(loadBalance.getHtmlContent(undefined, 'https://www-slv1.manner.io:1024/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance when pointing to oneself should be able to generate a normal HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      enable: false,
      orderIndex: true,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    loadBalance.setTemporaryCNAME_HASH({
      'www-mstr.manner.io': '127.0.0.1',
      'www-slv1.manner.io': '192.168.1.1',
      'www-slv2.manner.io': '192.168.1.2',
      'www-slv2.manner.io': '192.168.1.3',
      'www-slv2.manner.io': '192.168.1.4',
    });
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
});
