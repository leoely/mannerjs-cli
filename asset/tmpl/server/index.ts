import HttpHandle from '~/server/class/HttpHandle';
import '~/server/lib/forward/users';
import '~/server/lib/router/updates';

const httpHandle: HttpHandle = new HttpHandle({
  debug: true,
  logLevel: 7,
});
httpHandle.listen();
