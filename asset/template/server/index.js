import HttpHandle from '~/server/class/HttpHandle';
import '~/server/lib/forward/users';
import '~/server/lib/router/systems';

const httpHandle = new HttpHandle({
  debug: true,
  logLevel: 7,
  onlyLogFail: false,
});
httpHandle.listen();
