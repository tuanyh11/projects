import * as migration_20260302_145406_add_contact_submissions from './20260302_145406_add_contact_submissions';

export const migrations = [
  {
    up: migration_20260302_145406_add_contact_submissions.up,
    down: migration_20260302_145406_add_contact_submissions.down,
    name: '20260302_145406_add_contact_submissions'
  },
];
