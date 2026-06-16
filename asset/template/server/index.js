import HttpHandle from '~/server/class/HttpHandle';
import '~/server/lib/forward/users';
import '~/server/lib/router/systems';

async function main() {
  const httpHandle = new HttpHandle({
    debug: true,
    logLevel: 7,
    onlyLogFail: false,
  });
  await httpHandle.listen();
}
main();
