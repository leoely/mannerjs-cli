import PortLoadBalance from '~/class/PortLoadBalance';

describe('[class] PortLoadBalance;', () => {
  test('PortLoadBlance master node should be able to obtain the load balancing URL.', async () => {
    const portLoadBalance = new PortLoadBalance({
      protocal: 'https',
      weight: 0.5,
      default: 'default',
    }, 80, [
      ['www-mstr.manner.io', 80],
      ['www-slv1.manner.io', 1024],
      ['www-slv2.manner.io', 80],
      ['www-slv2.manner.io', 1024],
      ['www-slv2.manner.io', 1025],
    ]);
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
    console.log(portLoadBalance.getLocation('/login'));
  });
});
