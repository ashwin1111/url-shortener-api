const queryString = require('query-string');

const stringifiedParams = queryString.stringify({
  client_id: '',
  redirect_uri: 'https://url-shortener--api.herokuapp.com/auth/google',
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '),
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent',
});

const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
console.log('googleLoginUrl', googleLoginUrl);