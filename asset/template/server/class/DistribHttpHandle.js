import net from 'net';
import {
  getOwnIpAddresses,
  ByteArray,
  getAddress,
  getGTMNowString,
} from 'manner.js/server';
import HttpHandle from './HttpHandle';

const nonZeroByteArray = new ByteArray({ size: 256n, shift: 1n, });

function getBinBuf(params) {
  if (!Array.isArray(params)) {
    throw new Error('[Error] The params parameter should be an array type.');
  }
  const { length, } = params;
  if (length <= 1) {
    throw new Error('[Error] The length of the params parameter should be greater than or equal to two');
  }
  const pbytes = [];
  params.forEach((param) => {
    switch (typeof param) {
      case 'string':
        pbytes.push(Array.from(Buffer.from(param)));
        break;
      case 'number':
        if (!Number.isInteger(param)) {
          throw new Error('[Error] If the param type is a number, ite should be an integer.');
        }
        pbytes.push(Array.from(nonZeroByteArray.fromInt(param)));
        break;
    }
    pbytes.push(0);
  });
  const buf = Buffer.from(pbytes.flat());
  return buf;
}

function formatHttpHandles(httpHandles) {
  return '[' + httpHandles.join(', ') + ']';
}

class DistribHttpHandle extends HttpHandle {
  constructor(tb, options, port, allHttpHandles) {
    super(tb, options);
    this.dealParams(port, allHttpHandles);
  }

  static async combine(distribHttpHandles) {
    if (!Array.isArray(distribHttpHandles)) {
      throw new Error('[Error] The parameter distribHttpHandles should be of array type.');
    }
    const serverPromises = distribHttpHandles.map((distribHttpHandle) => {
      return distribHttpHandle.setUpServer();
    });
    const clientsPromises = distribHttpHandles.map((distribHttpHandle) => {
      return distribHttpHandle.setUpClients();
    });
    await Promise.all(serverPromises.concat(clientsPromises));
  }

  static async join(newDistribHttpHandles, originDistribHttpHandles) {
    if (!Array.isArray(newDistribHttpHandles)) {
      throw new Error('[Error] The new distributed httpHandles should beo fo array type..');
    }
    if (!Array.isArray(originDistribHttpHandles)) {
      throw new Error('[Error] The origin distributed httpHandles should be of array type.');
    }
    const serverPromises = newDistribHttpHandles.map((distribHttpHandle) => {
      return distribHttpHandle.setUpServer();
    });
    const clientsPromises = newDistribHttpHandles.map((distribHttpHandle) => {
      return distribHttpHandle.setUpClients();
    });
    const addPromises = originDistribHttpHandles.map((originDistribHttpHandle) => {
      return newDistribHttpHandles.map((newDistribHttpHandle) => {
        const { ip, port, } = newDistribHttpHandle;
        originDistribHttpHandle.addHttpHandle(ip, port);
      });
    }).flat();
    await Promise.all(serverPromises.concat(clientsPromises).concat(addPromises));
  }

  static async release(distribHttpHandles) {
    if (!Array.isArray(distribHttpHandles)) {
      throw new Error('[Error] The parameter distribHttpHandles should be of array type.');
    }
    distribHttpHandles.forEach((distribHttpHandle) => {
      distribHttpHandle.closeClients();
      delete distribHttpHandle.clients;
    });
    for (let i = 0; i < distribHttpHandles.length; i += 1) {
      const distribHttpHandle = distribHttpHandle[i];
      await distribHttpHandle.closeServer();
      delete distribHttpHandle.server;
    }
    distribHttpHandles.forEach((distribHttpHandle) => {
      distribHttpHandle.closeConnections();
      delete distribHttpHandle.connections;
    });
  }

  dealParams(port, allHttpHandles) {
    if (!Number.isInteger(port)) {
      throw new Error('[Error] Parameter id needs to be an integer.');
    }
    if (!(port >= 0)) {
      throw new Error('[Error] Parameter id needs to be a postive integer.');
    }
    this.port = port;
    if (!Array.isArray(allHttpHandles)) {
      throw new Error('[Error] Parameter allHttpHandles needs to be of array type.');
    }
    const ipAddresses = getOwnIpAddresses();
    const locations = [];
    ipAddresses.forEach((ipAddress) => {
      const { ipv4, ipv6, } = ipAddress;
      locations.push(getAddress(ipv4, port));
      locations.push(getAddress(ipv6, port));
    });
    const hash = {};
    const httpHandles = allHttpHandles.filter((httpHandle) => {
      const [_, port] = httpHandle;
      if (hash[port] === undefined) {
        hash[port] = true;
      } else {
        throw new Error('[Error] A port can only be bound to one httpHandle');
      }
      let flag = true;
      for (let i = 0; i< locations.length ; i += 1) {
        const location = locations[i];
        const [ip] = httpHandle;
        if (getAddress(ip, port)) {
          const [ip] = httpHandle;
          this.ip = ip;
          flag = false;
          break;
        }
      }
      return flag;
    });
    this.httpHandles = allHttpHandles;
  }

  getHttpHandles() {
    const { httpHandles, } = this;
    if (!Array.isArray(httpHandles)) {
      throw new Error('[Error] The status of the httpHandles is abnormal.');
    }
    return httpHandles;
  }

  getAckPromises(callback) {
    if (typeof callback !== 'function') {
      throw new Error('[Error] Parameter callback should be a funciton type.');
    }
    return this.getClients().map((client) => {
      callback(client);
      return new Promise((resolve, reject) => {
        client.on('data', (buf) => {
          const data = buf.toString();
          switch (data) {
            case 'ack':
              resolve();
              break;
          }
        });
      });
    });
  }

  async closeServer() {
    try {
      await new Promise((resolve, reject) => {
        this.getServer().close(() => {
          resolve();
        });
      })
    } catch (error) {
    }
  }

  closeClients() {
    try {
      this.getClients().forEach((client) => {
        client.destroySoon();
      });
    } catch (error) {
    }
  }

  closeConnections() {
    try {
      const { connections, } = this;
      if (!Array.isArray(connections)) {
        throw new Error('[Error] The connections is not an array type or the combine is not complete.');
      }
      if (connections.length === 0) {
        throw new Error('[Error] The length of the connections is zero.Perhaps the combine was not completed;');
      }
      connections.forEach((connection) => {
        connection.destroySoon();
      });
    } catch (error) {
    }
  }

  getServer() {
    const { server, } = this;
    if (server === undefined) {
      throw new Error('[Error] The current distributed cluster is not combined and cannot obtain the server');
    }
    return server;
  }

  getConnections() {
    const { server, connections, } = this;
    if (server === undefined) {
      throw new Error('[Error] The current distributed cluster is not combined and cannot obtain the connections');
    }
    return connections;
  }

  getClients() {
    const { clients, } = this;
    if (clients === undefined) {
      throw new Error('[Error] The current distributed cluster is not combined and cannot obtain the clients');
    }
    return clients;
  }

  async setUpServer() {
    try {
      const {
        httpHandles: {
          length,
        },
      } = this;
      let count = 0;
      this.connections = [];
      this.server = await new Promise((resolve, reject) => {
        const server = net.createServer((connection) => {
          connection.on('data', (buf) => {
            this.dealConnectionBuf(buf, connection);
          });
          count += 1;
          this.connections.push(connection);
          if (count === length) {
            resolve(server);
          }
        });
        const { port, } = this;
        server.on('error', (error) => {
          throw error;
        });
        server.listen(port);
      });
      const { server, } = this;
      this.checkMemory();
      return server;
    } catch (error) {
    }
  }

  async setUpClients() {
    try {
      const { httpHandles, } = this;
      const clientPromises = httpHandles.map((httpHandle) => {
        const [ip, port] = httpHandle;
        return new Promise((resolve, reject) => {
          const client = net.createConnection(port, ip, () => {
            client.ip = ip;
            client.port = port;
            resolve(client);
          });
          client.on('close', () => {
            const { ip, port, } = client;
            this.removeHttpHandle(ip, port);
          });
        });
      });
      this.clients = await Promise.all(clientPromises);
      const { client, } = this;
      this.checkMemory();
      return client;
    } catch (error) {
    }
  }

  dealConnectionBuf(buf, connection) {
    const segments = [];
    let s = 0;
    for (let i = 0; i < buf.length; i += 1) {
      if (buf[i] === 0) {
        segments.push(buf.slice(s, i));
        s = i + 1;
      }
    }
    const bigInt1 = nonZeroByteArray.toInt(segments.shift())
    const code = Number(bigInt1);
    const params = segments.map((segment, index) => {
      return nonZeroByteArray.toInt(segment);
    });
    switch (code) {
      case 0: {
        if (params.length !== 2) {
          throw new Error('[Error] The remaining parameter lengths do not match convertion.');
        }
        const [id, total] = params;
        this.deleteExchange(Number(id), Number(total), true);
        connection.write('ack');
        break;
      }
      case 1: {
        if (params.length !== 1) {
          throw new Error('[Error] The parameter lengths do not match convertion.');
        }
        const [id] = params;
        this.deleteDataById(Number(id));
        this.outOfOrder = true;
        this.full = false;
        connection.write('ack');
        break;
      }
      case 2: {
        if (params.length !== 1) {
          throw new Error('[Error] The parameters lengths do not match convertion.');
        }
        const [id] = params;
        this.deleteDataById(Number(id));
        this.outOfOrder = true;
        this.full = false;
        connection.write('ack');
        break;
      }
      case 3: {
        if (params.length !== 2) {
          throw new Error('[Error] The parameters lengths do not match convertion.');
        }
        const [id1, id2] = params;
        this.deleteDataById(Number(id1));
        this.deleteDataById(Number(id2));
        this.outOfOrder = true;
        this.full = false;
        connection.write('ack');
        break;
      }
      case 4: {
        if (params.length !== 1) {
          throw new Error('[Error] The parameters lengths do not match convertion.');
        }
        const [highId] = params;
        const mapping = this.exchangeHighIndex(Number(highId), true);
        connection.write('ack');
        return mapping;
      }
      default:
        throw new Error('[Error] The code value should be in the range [0, 5]');
    }
  }

  removeHttpHandle(ip, port) {
    try {
      const { httpHandles, } = this;
      for (let i = 0; i < httpHandles.length; i += 1) {
        const [httpHandleIp, httpHandlePort] = httpHandles[i];
        if (httpHandleIp === ip && httpHandlePort === port) {
          httpHandles.splice(i, 1);
          const { clients, } = this;
          if (Array.isArray(clients)) {
            clients.splice(i, 1);
            clients[i].destroySoon();
          }
          break;
        }
      }
    } catch (error) {
    }
  }

  async addHttpHandle(ip, port) {
    try {
      await new Promise((resolve, reject) => {
        const client = net.createConnection(port, ip, () => {
          client.ip = ip;
          client.port = port;
          resolve(client);
        });
        client.on('close', () => {
          const { ip, port, } = client;
          this.removeHttpHandle(ip, port);
        });
        const { httpHandles, clients, } = this;
        httpHandles.push([ip, port]);
        clients.push(client);
      });
      this.checkMemory();
    } catch (error) {
    }
  }

  checkCombine() {
    const { server, clients, } = this;
    if (server === undefined || clients === undefined) {
      throw new Error('[Error] Distributed node integration is not yet complete.');
    }
  }
}

export default DistribHttpHandle;
