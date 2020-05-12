const queryString = require('query-string');

const stringifiedParams = queryString.stringify({
  client_id: '1058325697473-trm8ojpitnaomh3ina07voqe17kvjcq7.apps.googleusercontent.com',
  redirect_uri: 'https://urlll.xyz/auth/google',
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