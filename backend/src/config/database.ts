import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}

const url = new URL(dbUrl);
url.searchParams.delete('schema');

module.exports = {
  development: {
    url: url.href,
    dialect: 'postgres'
  },
  test: {
    url: process.env.TEST_DATABASE_URL?.replace(/\?schema=.*/, '') || url.href,
    dialect: 'postgres'
  },
  production: {
    url: url.href,
    dialect: 'postgres'
  }
};
