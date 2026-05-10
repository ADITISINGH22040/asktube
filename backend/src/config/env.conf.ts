import 'dotenv/config';

export function parseDbUrl(urlString: string | undefined): {url: string; schema: string} {
  if (!urlString) {
    throw new Error('DATABASE_URL is required');
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err);
    throw err;
  }

  const schema = url.searchParams.get('schema') ?? 'public';
  url.searchParams.delete('schema');

  return {url: url.href, schema};
}
