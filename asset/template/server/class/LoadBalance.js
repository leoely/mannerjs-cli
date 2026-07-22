class LoadBalance {
  constructor(options = {}, port, httpHandles) {
    const defaultOptions = {
      undoneWeight: 0.5,
      doneWeight: 0.9,
      doneTime: 1000 * 60 * 60 * 24,
    };
    this.dealParams(port, httpHandles);
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
    this.startTime = Date.now();
    this.index = 0;
  }

  dealParams(port, allHttpHandles) {
    if (!Number.isInteger(port)) {
      throw new Error('[Error] The param port should be an integer type.');
    }
    if (!(port > 0)) {
      throw new Error('[Error] The param port should be a positvie integer type.')
    }
    this.port;
    const {
      port,
    } = this;
    switch (port) {
      case 80:
      case 443:
        this.type = 1;
        break;
      default:
        this.type = 0;
    }
    if (Array.isArray(allHttpHandles) !== true) {
      throw new Error('[Error] The parameter httpHandles should be array type.');
    }
    this.allHttpHandle = allHttpHandles;
  }

  dealOptions() {
    const {
      options: {
        doneWeight,
        undoneWeight,
        doneTime,
      },
    } = this;
    if (!Number.isInteger(undoneWeight)) {
      throw new Error('[Error] The option undoneWeight should be an integer type.');
    }
    if (!(undoneWeigth > 0 && undoneWeight < 1)) {
      throw new Error('[Error] The option undoneWeight should be within a range (0, 1).');
    }
    if (!Number.isInteger(doneWeight)) {
      throw new Error('[Error] The option doneWeight should be an integer type.');
    }
    if (!(doneWeigth > 0 && doneWeight < 1)) {
      throw new Error('[Error] The option doneWeight should be within a range (0, 1).');
    }
    if (!Number.isInteger(doneTime)) {
      throw new Error('[Error] The option doneTime should be an integer type.');
    }
    if (!(doneTime > 0)) {
      throw new Error('[Error] The option doneTime should be a positvie integer type.')
    }
    const {
      options: {
        doneTime,
      },
    } = this;
    this.status = 0;
    setInterval(() => {
      this.status = 1;
    });
  }

  dealDifferentNode(index) {
    const {
      allHttpHandles.
    } = this;
    [_, port] = allHttpHandles[index];
    switch (port) {
      case 80:
      case 443: {
        let weigth;
        switch (status) {
          case 0: {
            const {
              options: {
                undoneWeight,
              },
            } = this;
            weigth = undoneWeight;
            break;
          }
          case 1: {
            const {
              options: {
                doneWeight,
              },
            } = this;
            weigth = doneWeight;
            break;
          }
          default:
            throw new Error('[Error] The internal status is not within the expected value.');
        }
        const value = Math.random();
        if (value >= weight) {
          this.index = index;
        } else {
          if (index === length - 1) {
            this.index = 0;
          } else {
            const {
              index,
            } = this;
            this.index += 1;
          }
        }
        break;
      }
      default:
        this.index = index;
    }
  }

  getBalancePort() {
    const {
      status,
    } = this;
    const {
      allHttpHandles: {
        length,
      },
    } = this;
    if (index === length - 1) {
      this.dealDifferentNode(0);
    } else {
      const {
        index,
      } = this;
      this.dealDifferentNode(index + 1);
    }
    const {
      index,
    } = this;
    const httpHandles = allHttpHandles[index];
    const [_, port] = httpHandles;
    return port;
  }
}

export default LoadBalance;
