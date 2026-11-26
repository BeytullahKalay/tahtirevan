import * as migration_20261123_152546_initial from './20261123_152546_initial';
import * as migration_20261126_184354_on_siparis from './20261126_184354_on_siparis';

export const migrations = [
  {
    up: migration_20261123_152546_initial.up,
    down: migration_20261123_152546_initial.down,
    name: '20261123_152546_initial',
  },
  {
    up: migration_20261126_184354_on_siparis.up,
    down: migration_20261126_184354_on_siparis.down,
    name: '20261126_184354_on_siparis'
  },
];
