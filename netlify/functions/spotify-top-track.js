exports.handler = async (event) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'GET' },
      body: '',
    };
  }

  const validRanges = ['short_term', 'medium_term', 'long_term', 'liked'];
  const timeRange = event.queryStringParameters?.time_range ?? 'short_term';

  if (!validRanges.includes(timeRange)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid time_range' }),
    };
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Server misconfiguration' }),
    };
  }

  try {
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

    const apiUrl =
      timeRange === 'liked'
        ? 'https://api.spotify.com/v1/me/tracks?limit=1'
        : `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=1`;

    const tracksRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

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

    // Saved-tracks items wrap the track in a `track` property
    const item = timeRange === 'liked' ? data.items[0].track : data.items[0];
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        // Serve from Netlify's CDN for 1h (stale allowed 24h while revalidating)
        // instead of re-invoking the function and the Spotify API per request
        'Netlify-CDN-Cache-Control':
          'public, durable, s-maxage=3600, stale-while-revalidate=86400',
        'Netlify-Vary': 'query=time_range',
      },
      body: JSON.stringify({
        id: item.id,
        name: item.name,
        artist: item.artists[0].name,
        albumCover: item.album.images[0]?.url ?? '',
      }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
