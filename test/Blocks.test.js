import Blocks from '~/class/Blocks';

describe('[class] Blocks;', () => {
  test('Blocks should be able to intercept request based on ip.', async () => {
    const blocks = new Blocks(1000);
    expect(blocks.examine('127.0.0.1')).toBe(true);
    expect(blocks.examine('127.0.0.1')).toBe(false);
    expect(blocks.examine('127.0.0.1')).toBe(false);
    expect(blocks.examine('127.0.0.1')).toBe(false);
    expect(blocks.examine('127.0.0.1')).toBe(false);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    expect(blocks.examine('127.0.0.1')).toBe(true);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
    expect(blocks.examine('127.0.0.1')).toBe(false);
  });

  test('Blocks should be able to support ipv6 addresses.', async () => {
    const blocks = new Blocks(1000);
    expect(blocks.examine('::1')).toBe(true);
    expect(blocks.examine('::1')).toBe(false);
    expect(blocks.examine('::1')).toBe(false);
    expect(blocks.examine('::1')).toBe(false);
    expect(blocks.examine('::1')).toBe(false);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    expect(blocks.examine('::1')).toBe(true);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
    expect(blocks.examine('::1')).toBe(false);
  });
});
