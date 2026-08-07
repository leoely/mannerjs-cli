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
      ['stackoverflow.com', 1024],
      ['github.com', 80],
      ['google.com', 1024],
      ['leetcode.com', 1025],
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
      mode: 'default',
      enable: true,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['stackoverflow.com', 1024],
      ['github.com', 80],
      ['google.com', 1024],
      ['leetcode.com', 1025],
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
    expect(loadBalance.getHtmlContent('https://www-slv2.manner.io:1025/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=void 0)&&(window.location=\"https://www-slv2.manner.io:1025/login\")</script><script defer=defer src=main.bundle.js></script>');
  });

  test('LoadBalance when disable should be able to generate a normal HTML template.', async () => {
    const loadBalance = new LoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      enable: false,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['stackoverflow.com', 1024],
      ['github.com', 80],
      ['google.com', 1024],
      ['leetcode.com', 1025],
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
    expect(loadBalance.getHtmlContent('https://www-slv1.manner.io:1024/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script defer=defer src=main.bundle.js></script>');
  });
});
