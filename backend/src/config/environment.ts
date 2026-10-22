import path from 'node:path';

export interface EnvironmentConfig {
  port: number;
  frontendOrigin: string;
  databasePath: string;
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '3000');

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un número entre 1 y 65535');
  }

  return port;
}

export function getEnvironmentConfig(
  environment: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  return {
    port: parsePort(environment.PORT),
    frontendOrigin: environment.FRONTEND_ORIGIN ?? 'http://localhost:4200',
    databasePath: path.resolve(
      environment.DATABASE_PATH ?? path.join('data', 'taskflow.sqlite'),
    ),
  };
}
