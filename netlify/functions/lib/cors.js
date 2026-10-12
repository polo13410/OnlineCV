const ALLOWED_ORIGINS = [
  'https://paulpera.ch',
  'https://www.paulpera.ch',
  'https://paulpera.netlify.app',
];
// Deploy previews and branch deploys: https://<anything>--paulpera.netlify.app
const NETLIFY_DEPLOY_RE = /^https:\/\/[a-z0-9-]+--paulpera\.netlify\.app$/;

/** JSON + CORS headers echoing the request origin when it is one of ours. */
exports.corsHeaders = (event) => {
  const origin = event.headers?.origin ?? '';
  const allowOrigin =
    ALLOWED_ORIGINS.includes(origin) || NETLIFY_DEPLOY_RE.test(origin)
      ? origin
      : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
    'Content-Type': 'application/json',
  };
};
