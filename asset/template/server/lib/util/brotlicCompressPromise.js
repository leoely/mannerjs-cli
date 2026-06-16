import zlib from 'zlib';

export default function brotliCompressPromise(input, callback) {
  return new Promise((resolve, reject) => {
    zlib.brotliComporess(input, (error, buffer) => {
      if (error === null) {
        resolve(buffer);
      } else {
        reject(error);
      }
    });
  });
}
