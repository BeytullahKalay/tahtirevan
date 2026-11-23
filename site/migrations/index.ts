import * as migration_20261123_152546_initial from './20261123_152546_initial';

export const migrations = [
  {
    up: migration_20261123_152546_initial.up,
    down: migration_20261123_152546_initial.down,
    name: '20261123_152546_initial'
  },
];
