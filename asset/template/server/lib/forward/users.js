import { MultiFetch, } from 'manner.js/server';
import global from '~/server/obj/global';

const { fwd, } = global;

const multiFetch1 = new MultiFetch([
  'http://localhost:8001',
  'http://localhost:8002',
  'http://localhost:8003',
  'http://localhost:8004',
]);

fwd.attach('/login', multiFetch1);
