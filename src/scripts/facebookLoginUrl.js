const queryString = require('query-string');

const stringifiedParams = queryString.stringify({
    client_id: '',
    redirect_uri: 'https://url-shortener--api.herokuapp.com/auth/facebook',
    scope: ['email'].join(','), // comma seperated string
    response_type: 'code',
    auth_type: 'rerequest',
    display: 'popup',
  });
  const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;

  console.log(facebookLoginUrl);