import EventEmitter from 'events';
import net from 'net';
import {
  getOwnIpAddresses,
  ByteArray,
  getAddress,
  getGTMNowString,
} from 'manner.js/server';
import Table from './Table';

const nonZeroByteArray = new ByteArray({ size: 256n, shift: 1n, });

function getBinBuf(params) {
  if (!Array.isArray(params)) {
    throw new Error('[Error] The params parameter should be an array type.');
  }
  const { length, } = params;
  if (length <= 1) {
    throw new Error('[Error] The length of the parameters should be greater than or equal to two');
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

function addBufferFlag(flag, buffer) {
  if (!Number.isInteger(flag)) {
    throw new Error('[Error] The parameter flag should be an integer type');
  }
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('[Error] The parameter buffer should be of type buffer.');
  }
  const fbytes = Buffer.from([flag]);
  return Buffer.concat([fbytes, buffer]);
}

function formatTables(tables) {
  return '[' + tables.join(', ') + ']';
}

class DistribTable extends Table {
  constructor(tb, options, port, allTables) {
    super(tb, options);
    this.global = null;
    this.dealParams(port, allTables);
    this.eventEmitter = new EventEmitter();
    this.dealReceiveBuffer = this.dealReceiveBuffer.bind(this);
    this.dealReceiveAndSendBuffer = this.dealReceiveAndSendBuffer.bind(this);
    this.count = 0;
    this.checkMemory();
  }

  setGlobal() {
    const {
      constructor: {
        name,
      },
    } = this;
    switch (name) {
      case 'DistribTable':
        this.global = global;
        break;
      default:
        throw new Error('[Error] Only distributed instances can set global object.');
    }
    this.checkMemory();
  }

  static async combine(distribTables) {
    if (!Array.isArray(distribTables)) {
      throw new Error('[Error] The parameter distribTables should be of array type.');
    }
    const serverPromises = distribTables.map((distribTable) => {
      return distribTable.setUpServer();
    });
    const clientsPromises = distribTables.map((distribTable) => {
      return distribTable.setUpClients();
    });
    await Promise.all(serverPromises.concat(clientsPromises));
    distribTables.map((distribTable) => {
      distribTable.setUpSockets(true);
    });
  }

  static async join(newDistribTables, originDistribTables, allTables) {
    originDistribTables.forEach((originDistribTable) => {
      originDistribTable.setAllTables(allTables);
    });
    distribTables = originDistribTables.concat(newDistribTables);
    distribTables.forEach((distribTable, index) => {
      distribTableindex = index;
    });
    await DistribTable.combine(newDistribTables);
  }

  static async release(distribTables) {
    if (!Array.isArray(distribTables)) {
      throw new Error('[Error] The parameter distribTables should be of array type.');
    }
    distribTables.forEach((distribTable) => {
      distribTable.closeClients();
      delete distribTable.clients;
    });
    for (let i = 0; i < distribTables.length; i += 1) {
      const distribTable = distribTables[i];
      await distribTable.closeServer();
      delete distribTable.server;
    }
    distribTables.forEach((distribTable) => {
      distribTable.closeConnections();
      delete distribTable.connections;
    });
  }

  setGlobal(global) {
    this.global = global;
  }

  setAllTables(allTables) {
    if (Array.isArray(allTables) !== true) {
      throw new Error('[Error] The parameter all tables should be array type.');
    }
    const { port, } = this;
    const ipAddresses = getOwnIpAddresses();
    const locations = [];
    ipAddresses.forEach((ipAddress) => {
      const { ipv4, ipv6, } = ipAddress;
      locations.push(getAddress(ipv4, port));
      locations.push(getAddress(ipv6, port));
    });
    const hash = {};
    allTables = allTables.map((table, index) => {
      const [ip, port] = table;
      return [ip, port, index];
    });
    const tables = allTables.filter((table, index) => {
      const [_, port] = table;
      if (hash[port] === undefined) {
        hash[port] = true;
      } else {
        throw new Error('[Error] A port can only be bound to one table');
      }
      let flag = true;
      for (let i = 0; i< locations.length ; i += 1) {
        const location = locations[i];
        const [ip] = table;
        if (getAddress(ip, port) === location) {
          const [ip] = table;
          this.index = index;
          this.ip = ip;
          flag = false;
          break;
        }
      }
      return flag;
    });
    const { ip, } = this;
    this.address = getAddress(ip, this.port);
    this.tables = tables;
  }

  dealParams(port, allTables) {
    if (!Number.isInteger(port)) {
      throw new Error('[Error] Parameter id needs to be an integer.');
    }
    if (!(port >= 0)) {
      throw new Error('[Error] Parameter id needs to be a postive integer.');
    }
    this.port = port;
    if (!Array.isArray(allTables)) {
      throw new Error('[Error] Parameter allTables needs to be of array type.');
    }
    const ipAddresses = getOwnIpAddresses();
    const locations = [];
    ipAddresses.forEach((ipAddress) => {
      const { ipv4, ipv6, } = ipAddress;
      locations.push(getAddress(ipv4, port));
      locations.push(getAddress(ipv6, port));
    });
    const hash = {};
    allTables = allTables.map((table, index) => {
      const [ip, port] = table;
      return [ip, port, index];
    });
    const tables = allTables.filter((table, index) => {
      const [_, port] = table;
      if (hash[port] === undefined) {
        hash[port] = true;
      } else {
        throw new Error('[Error] A port can only be bound to one table');
      }
      let flag = true;
      for (let i = 0; i< locations.length ; i += 1) {
        const location = locations[i];
        const [ip] = table;
        if (getAddress(ip, port) === location) {
          const [ip] = table;
          this.index = index;
          this.ip = ip;
          flag = false;
          break;
        }
      }
      return flag;
    });
    const { ip, } = this;
    this.address = getAddress(ip, this.port);
    this.tables = tables;
  }

  getTables() {
    const { tables, } = this;
    if (!Array.isArray(tables)) {
      throw new Error('[Error] The status of the tables is abnormal.');
    }
    return tables;
  }

  outputDistribOperate(operate) {
    if (typeof operate !== 'string') {
      throw new Error('[Error] The parameter operate must be of string type.');
    }
    const {
      tb,
      options: {
        debug,
      },
      constructor: {
        name,
      },
    } = this;
    operate = operate.split(' ').map((word) => {
      return word[0].toUpperCase() + word.substring(1, word.length);
    }).join(' ');
    const tables = this.getTables();
    if (debug === true) {
      const {
        fulmination,
      } = this;
      fulmination.scan(`
        (+) bold: "&"& (+) bold: * Class "[ (+) black; bgWhite: ` + name + `(+) bold: "] Operate "[ (+) black; bgWhite: ` + operate + `(+) bold: "] Successfully executed and completed. 2&
        (+) bold: "[ (+) black; bgWhite: Topology (+) bold: "] ++ * (+) underline: "b` + formatTables(tables) + `" &
        (+) bold: "[ (+) black; bgWhite: Date (+) bold: "] @@ * (+) underline: "b` + getGTMNowString() + `" 2&
      `);
    }
    this.appendToLog('Class:(' + name + ') ████ & ████ ' + 'Operate:(' + operate + ') ████ & ████ ' + 'Topology:' + formatTables(tables));
  }

  outputDistribOperateError(operate, error) {
    if (typeof operate !== 'string') {
      throw new Error('[Error] The parameter operate must be of string type.');
    }
    if (!(error instanceof Error)) {
      throw new Error('[Error] Parameter error should be of error type.');
    }
    const {
      tb,
      options: {
        debug,
      },
      constructor: {
        name,
      },
    } = this;
    operate = operate.split(' ').map((word) => {
      return word[0].toUpperCase() + word.substring(1, word.length);
    }).join(' ');
    const tables = this.getTables();
    if (debug === true) {
      const {
        fulmination,
      } = this;
      fulmination.scan(`
        (+) red; bold: !! (+) bold: * Class "[ (+) black; bgRed: ` + name + `(+) bold: "] Operate "[ (+) black; bgRed: ` + operate + `(+) bold: "] An error occurred during execution. 2&
        (+) bold: "[ (+) black; bgRed: Topology (+) bold: "] ++ * (+) underline: "b` + formatTables(tables) + `" &
        (+) bold: "[ (+) black; bgRed: Date (+) bold: "] @@ * (+) underline: "b` + getGTMNowString() + `" 2&
      `);
    }
    this.appendToLog('Class:(' + name + ') ████ & ████ ' + 'Operate:(' + operate + ') ████ & ████ ' + 'Topology:' + formatTables(tables));
    this.addToLog(error.stack + '\n');
    throw error;
  }

  getAckPromises(callback) {
    if (typeof callback !== 'function') {
      throw new Error('[Error] Parameter callback should be a funciton type.');
    }
    const { eventEmitter, } = this;
    return this.getSockets().map((socket) => {
      callback(socket);
      return new Promise((resolve, reject) => {
        eventEmitter.on('data:receive', (buffer) => {
          const data = buffer.toString();
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
      this.outputDistribOperate('close server');
    } catch (error) {
      this.outputDistribOperateError('close server', error);
    }
  }

  closeClients() {
    try {
      this.getClients().forEach((client) => {
        client.destroySoon();
      });
      this.outputDistribOperate('close client');
    } catch (error) {
      this.outputDistribOperateError('close server', error);
    }
  }

  closeConnections() {
    try {
      const { connections, } = this;
      if (!Array.isArray(connections)) {
        throw new Error('[Error] The connections is not an array type or the combine is not complete.');
      }
      connections.forEach((connection) => {
        connection.destroySoon();
      });
      this.outputDistribOperate('close connection');
    } catch (error) {
      this.outputDistribOperateError('close connection', error);
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

  getSockets() {
    this.checkCombine();
    return this.sockets;
  }

  dealReceiveAndSendBuffer(buffer, socket) {
    const flag = buffer[0];
    const {
      length,
    } = buffer;
    buffer = buffer.subarray(1, length);
    switch (flag) {
      case 0: {
        const {
          eventEmitter,
        } = this;
        eventEmitter.emit('data:receive', buffer);
        break;
      }
      case 1: {
        this.dealReceiveBuffer(buffer, socket);
        break;
      }
    }
  }

  async setUpServer() {
    try {
      const {
        tables: {
          length,
        },
      } = this;
      this.connections = [];
      const { index, } = this;
      if (length - index === 0) {
        this.server = net.createServer((connection) => {
          this.count += 1;
          this.connections.push(connection);
          connection.on('close', () => {
            this.removeConnection(connection);
          });
          connection.on('data', (buffer) => {
            this.dealReceiveAndSendBuffer(buffer, connection);
          });
          this.setUpSockets(false);
        });
        const { server, } = this;
        server.on('error', (error) => {
          throw error;
        });
        const { port, } = this;
        server.listen(port);
      } else {
        this.server = await new Promise((resolve, reject) => {
          const server = net.createServer((connection) => {
            this.count += 1;
            this.connections.push(connection);
            connection.on('close', () => {
              this.removeConnection(connection);
            });
            const { count, } = this;
            if (count === length - index) {
              resolve(server);
            } else if (count > length - index) {
              connection.on('data', (buffer) => {
                this.dealReceiveAndSendBuffer(buffer, connection);
              });
              this.setUpSockets(false);
            }
          });
          const { port, } = this;
          server.on('error', (error) => {
            throw error;
          });
          server.listen(port);
        });
      }
      this.checkMemory();
      this.outputDistribOperate('setUp server');
    } catch (error) {
      this.outputDistribOperateError('setUp server', error);
    }
  }

  async setUpClients() {
    try {
      const { tables, index, } = this;
      const clientPromises = [];
      tables.map((table) => {
        const [_1, _2, i] = table;
        if (index > i && i >= 0) {
          const [ip, port] = table;
          const clientPromise = new Promise((resolve, reject) => {
            const client = net.createConnection(port, ip, () => {
              client.ip = ip;
              client.port = port;
              resolve(client);
            });
            client.on('close', () => {
              const { ip, port, } = client;
              this.removeClient(client);
            });
          });
          clientPromises.push(clientPromise);
        }
      });
      this.clients = await Promise.all(clientPromises);
      this.checkMemory();
      this.outputDistribOperate('setUp client');
    } catch (error) {
      this.outputDistribOperateError('setUp client', error);
    }
  }

  setUpSockets(bind) {
    if (typeof bind !== 'boolean') {
      throw new Error('[Error] The parameter bind should be boolean type.');
    }
    try {
      const { clients, connections, } = this;
      this.sockets = clients.concat(connections);
      const { sockets: socketList, } = this;
      if (bind === true) {
        socketList.forEach((socket) => {
          socket.on('data', (buffer) => {
            this.dealReceiveAndSendBuffer(buffer, socket);
          });
        })
      }
      this.checkMemory();
      this.outputDistribOperate('setUp socket');
    } catch (error) {
      this.outputDistribOperateError('setUp socket', error);
    }
  }

  dealReceiveBuffer(buf, socket) {
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
    let params;
    switch (code) {
      case 4:
        params = segments.map((segment, index) => {
          switch (index) {
            case 0:
              return segment.toString();
            case 1:
              return new Function('return ' + segment.toString())();
          }
        });
        break;
      default:
        params = segments.map((segment) => {
          return nonZeroByteArray.toInt(segment);
        });
    }
    switch (code) {
      case 0: {
        if (params.length !== 2) {
          throw new Error('[Error] The parameters length should be equal to two.');
        }
        const [id, total] = params;
        this.deleteExchange(Number(id), Number(total), true);
        socket.write(addBufferFlag(0, Buffer.from('ack')));
        break;
      }
      case 1: {
        if (params.length !== 1) {
          throw new Error('[Error] The parameter length should be equal to one.');
        }
        const [id] = params;
        this.deleteDataById(Number(id));
        this.outOfOrder = true;
        this.full = false;
        socket.write(addBufferFlag(0, Buffer.from('ack')));
        break;
      }
      case 2: {
        if (params.length !== 2) {
          throw new Error('[Error] The parameters length should be equal to two.');
        }
        const [id1, id2] = params;
        this.deleteDataById(Number(id1));
        this.deleteDataById(Number(id2));
        this.outOfOrder = true;
        this.full = false;
        socket.write(addBufferFlag(0, Buffer.from('ack')));
        break;
      }
      case 3: {
        if (params.length !== 1) {
          throw new Error('[Error] The parameter length should be equal to one.');
        }
        const [highId] = params;
        const mapping = this.exchangeHighIndex(Number(highId), true);
        socket.write(addBufferFlag(0, Buffer.from('ack')));
        return mapping;
      }
      case 4: {
        if (params.length !== 2) {
          throw new Error('[Error] The parameters length should be equal to two.');
        }
        const [phrase, callback] = params;
        this.addSystemNotice(phrase, callback);
        socket.write(addBufferFlag(0, Buffer.from('ack')));
        break;
      }
      default:
        throw new Error('[Error] The code value should be in the range [0, 4]');
    }
  }

  removeClient(client) {
    try {
      const { clients, } = this;
      if (clients !== undefined) {
        for (let i = 0; i < clients.length; i += 1) {
          const currentClient = clients[i];
          if (client === currentClient) {
            clients.splice(i, 1);
            currentClient.destroySoon();
            this.setUpSockets(false);
            break;
          }
        }
        this.outputDistribTopology();
        this.outputDistribOperate('remove client');
      }
    } catch (error) {
      this.outputDistribOperateError('remove client', error);
    }
  }

  removeConnection(connection) {
    try {
      const { connections, } = this;
      if (connections !== undefined) {
        for (let i = 0; i < clients.length; i += 1) {
          const currentConneciton = connections[i];
          if (connection === connections[i]) {
            connections.splice(i, 1);
            currentConnection.destroySoon();
            this.setUpSockets(false);
            break;
          }
        }
        this.outputDistribTopology();
        this.outputDistribOperate('remove connection');
      }
    } catch (error) {
      this.outputDistribOperateError('remove connection', error);
    }
  }

  checkCombine() {
    const { server, clients, } = this;
    if (server === undefined || clients === undefined) {
      throw new Error('[Error] Distributed node integration is not yet complete.');
    }
  }

  async insertDistrib(cnt) {
    try {
      this.checkCombine();
      await this.insert(cnt);
      this.outputDistribOperate('insert distrib');
    } catch (error) {
      this.outputDistribOperateError('insert distrib', error);
    }
  }

  async deleteExchangeDistrib(id, total) {
    try {
      this.checkCombine();
      await this.deleteExchange(id, total);
      const ackPromises = this.getAckPromises((socket) => {
        socket.write(addBufferFlag(1, getBinBuf([0, id, total])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('deleteExchange distrib');
    } catch (error) {
      this.outputDistribOperateError('deleteExchange distrib', error);
    }
  }

  async deleteAllDistrib(ids) {
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      await deleteDistrib(id);
    }
    this.outputDistribOperate('deleteAll distrib');
  }

  async deleteDistrib(id) {
    try {
      this.checkCombine();
      await this.delete(id);
      const ackPromises = this.getAckPromises((socket) => {
        socket.write(addBufferFlag(1, getBinBuf([1, id])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('delete distrib');
    } catch (error) {
      this.outputDistribOperateError('delete distrib', error);
    }
  }

  async updateDistrib(obj) {
    try {
      this.checkCombine();
      await this.update(obj);
      const ackPromises = this.getAckPromises((socket) => {
        socket.write(addBufferFlag(1, getBinBuf([1, obj.id])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('update distrib');
    } catch (error) {
      this.outputDistribOperateError('update distrib', error);
    }
  }

  async exchangeContentDistrib(id1, id2) {
    try {
      this.checkCombine();
      await this.exchangeContent(id1, id2);
      const ackPromises = this.getAckPromises((socket) => {
        socket.write(addBufferFlag(1, getBinBuf([2, id1, id2])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('exchangeContent distrib');
    } catch (error) {
      this.outputDistribOperateError('exchangeContent distrib', error);
    }
  }

  async exchangeHighIndexDistrib(highId) {
    try {
      this.checkCombine();
      const mapping = await this.exchangeHighIndex(highId);
      const ackPromises = this.getAckPromises((socket) => {
        socket.write(addBufferFlag(1, getBinBuf([3, highId])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('exchangeHighIndex distrib');
      return mapping;
    } catch (error) {
      this.outputDistribOperateError('exchangeHighIndex distrib');
    }
  }

  async addSystemNoticeDistrib(phrase, callback) {
    try {
      this.checkCombine();
      this.addSystemNotice(phrase, callback);
      const ackPromises = this.getAckPromises((client) => {
        client.write(addBufferFlag(1, getBinBuf([4, phrase, callback.toString()])));
      });
      await Promise.all(ackPromises);
      this.outputDistribOperate('addSystemNotice distrib');
    } catch (error) {
      this.outputDistribOperateError('addSystemNotice distrib', error);
    }
  }
}

export default DistribTable;
