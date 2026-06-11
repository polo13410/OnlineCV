exports.handler = async (event) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const validRanges = ['short_term', 'medium_term', 'long_term'];
  const timeRange = event.queryStringParameters?.time_range ?? 'short_term';

  if (!validRanges.includes(timeRange)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid time_range' }),
    };
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!tokenRes.ok) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Token refresh failed' }),
    };
  }

  const { access_token } = await tokenRes.json();

  const tracksRes = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=1`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  if (!tracksRes.ok) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Spotify API error' }),
    };
  }

  const data = await tracksRes.json();

  if (!data.items?.length) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'No tracks found' }),
    };
  }

  const item = data.items[0];
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      id: item.id,
      name: item.name,
      artist: item.artists[0].name,
      albumCover: item.album.images[0]?.url ?? '',
    }),
  };
};
