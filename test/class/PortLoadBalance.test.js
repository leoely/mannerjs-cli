import PortLoadBalance from '~/class/PortLoadBalance';

describe('[class] PortLoadBalance;', () => {
  test('PortLoadBlance should be able to obtain the load balancing URL.', async () => {
    const portLoadBalance = new PortLoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    //console.log(portLoadBalance.getLocation('/login'));
  });

  test('PortLoadBalance should be able to generate a redirect HTML template.', async () => {
    const portLoadBalance = new PortLoadBalance({
      protocal: 'https',
      weight: 0.5,
      mode: 'default',
      enable: true,
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    portLoadBalance.setHtml(`
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
    expect(portLoadBalance.getRedirectHtml('https://www-slv2.manner.io:1025/login')).toMatch('<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta name=description content=\"\"><link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap\"rel=stylesheet><link rel=icon href=favicon.png><script>let parsedUrl=new URL(window.location),loadBalanceTimeValue=parsedUrl.searchParams.get(\"loadBalanceTime\"),loadBalanceTime=parseInt(loadBalanceTimeValue);(Number.isNaN(loadBalanceTime)||loadBalanceTime<=void 0)&&(window.location=\"https://www-slv2.manner.io:1025/login\")</script><script defer=defer src=main.bundle.js></script>');
  });
});
