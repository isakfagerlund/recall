// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from "./meta/_journal.json";
import m0000 from "./0000_amusing_meltdown.sql";
import m0001 from "./0001_mysterious_nextwave.sql";
import m0002 from "./0002_flat_angel.sql";

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
  },
};
