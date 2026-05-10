import 'dotenv/config';

function getDbUrl(): string | undefined {
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
}

export const DATABASE_URL = getDbUrl();

export const DATABASE_SCHEMA = DATABASE_URL
  ? new URL(DATABASE_URL).searchParams.get('schema') ?? 'public'
  : 'public';
