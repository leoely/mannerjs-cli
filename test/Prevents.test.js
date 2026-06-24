import http from 'http';
import fetch from 'node-fetch';
import Prevents from '~/class/Prevents';

let server1;

beforeAll(() => {
  const prevents = new Prevents(3, 1000);
  server1 = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    if (prevents.inspect(ip, req) === false) {
      res.writeHead(304);
      res.end();
    } else {
      res.end('data');
    }
  });
  server1.listen(8007);
});

function getServerClosePromise(server) {
  return new Promise((resolve, reject) => {
    server.close(() => {
      resolve();
    });
  });
}

afterAll(async () => {
  await getServerClosePromise(server1);
});

describe('[class] Prevents;', () => {
  test('The prevents should be able to prevent frequent requests.', async () => {
    const response1 = await fetch('http://localhost:8007');
    const data1 = await response1.text();
    expect(data1).toMatch('data');
    const response2 = await fetch('http://localhost:8007');
    const data2 = await response2.text();
    expect(data2).toMatch('data');
    const response3 = await fetch('http://localhost:8007');
    expect(response3.status).toBe(304);
  });
});;
