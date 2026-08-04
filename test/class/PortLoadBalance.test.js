import PortLoadBalance from '~/class/PortLoadBalance';

describe('[class] PortLoadBalance;', () => {
  test('PortLoadBlance master node should be able to obtain the load balancing URL.', async () => {
    const portLoadBalance = new PortLoadBalance({
      host: 'mannerjs.io',
    }, 80, [
      ['192.168.63,4', '80'],
      ['192.168.63,5', '1024'],
      ['192.168.63,5', '1025'],
    ]);
  });
});
