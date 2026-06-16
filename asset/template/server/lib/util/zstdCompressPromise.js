import zlib from 'zlib';

export default function zstdCompressPromise(input, callback) {
  return new Promise((resolve, reject) => {
    zlib.zstdComporess(input, (error, buffer) => {
      if (error === null) {
        resolve(buffer);
      } else {
        reject(error);
      }
    });
  });
}
