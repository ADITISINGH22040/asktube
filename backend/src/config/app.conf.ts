export interface HttpConfig {
  port: number;
}

export interface DatabaseConfig {
  url: string;
  schema: string;
  poolSize: number;
}

export function httpConfig(): HttpConfig {
  return {
    port: Number(process.env.PORT) || 3000
  };
}

export function databaseConfig(): DatabaseConfig {
  const dbUrl =
    process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL or TEST_DATABASE_URL is required');
  }

  const url = new URL(dbUrl);
  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  return {
    url: url.href,
    schema,
    poolSize: Number(process.env.DATABASE_POOL_SIZE) || 5
  };
}
