import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type SqliteDatabase = Database.Database;

export function createDatabase(databasePath: string): SqliteDatabase {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  const sourceSchemaPath = path.resolve(
    process.cwd(),
    'src',
    'database',
    'schema.sql',
  );
  const compiledSchemaPath = path.resolve(
    process.cwd(),
    'dist',
    'src',
    'database',
    'schema.sql',
  );
  const schemaPath = fs.existsSync(sourceSchemaPath)
    ? sourceSchemaPath
    : compiledSchemaPath;
  database.exec(fs.readFileSync(schemaPath, 'utf8'));
  return database;
}
