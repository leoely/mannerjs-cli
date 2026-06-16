import zlib from 'zlib';

export default function deflatetPromise(input, callback) {
  return new Promise((resolve, reject) => {
    zlib.deflate(input, (error, buffer) => {
      if (error === null) {
        resolve(buffer);
      } else {
        reject(error);
      }
    });
  });
}
