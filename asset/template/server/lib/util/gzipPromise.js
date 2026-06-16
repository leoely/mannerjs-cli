import zlib from 'zlib';

export default function gzipPromise(input, callback) {
  return new Promise((resolve, reject) => {
    zlib.gzip(input, (error, buffer) => {
      if (error === null) {
        resolve(buffer);
      } else {
        reject(error);
      }
    });
  });
}
