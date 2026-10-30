import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(projectDirectory, '..', 'src', 'database', 'schema.sql');
const destinationDirectory = path.join(projectDirectory, '..', 'dist', 'src', 'database');
const destination = path.join(destinationDirectory, 'schema.sql');

fs.mkdirSync(destinationDirectory, { recursive: true });
fs.copyFileSync(source, destination);
