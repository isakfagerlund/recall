#!/usr/bin/env node
/**
 * Script to update migrations.js with SQL content from .sql files
 * Run this after generating new migrations with: bun run db:generate
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../db/migrations');
const migrationsJsPath = path.join(migrationsDir, 'migrations.js');
const journalPath = path.join(migrationsDir, 'meta/_journal.json');

// Read journal to get migration entries
const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));

// Read all SQL migration files
const migrations = {};
journal.entries.forEach((entry, index) => {
  const sqlFileName = `${entry.tag}.sql`;
  const sqlFilePath = path.join(migrationsDir, sqlFileName);
  
  if (fs.existsSync(sqlFilePath)) {
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    const migrationKey = `m${String(index).padStart(4, '0')}`;
    migrations[migrationKey] = sqlContent;
  }
});

// Generate the migrations.js file content
const migrationsContent = `// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo
// This file is auto-generated. Do not edit manually. Run 'bun run db:update-migrations' after generating migrations.

import journal from './meta/_journal.json';

// SQL migration content (converted from .sql files for Metro compatibility)
${Object.entries(migrations).map(([key, sql]) => {
  // Escape backticks and template literal syntax
  const escapedSql = sql.replace(/`/g, '\\`').replace(/\${/g, '\\${');
  return `const ${key} = \`${escapedSql}\`;`;
}).join('\n')}

export default {
  journal,
  migrations: {
    ${Object.keys(migrations).join(',\n    ')}
  }
};
`;

fs.writeFileSync(migrationsJsPath, migrationsContent, 'utf8');
console.log('✅ Updated migrations.js with SQL content from migration files');

