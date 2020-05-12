const queryString = require('query-string');

const params = queryString.stringify({
    client_id: '0329fbed363d9dee78cd',
    redirect_uri: 'https://urlll.xyz/auth/github',
    scope: ['read:user', 'user:email'].join(' '), // space seperated string
    allow_signup: true,
  });
  
  const githubLoginUrl = `https://github.com/login/oauth/authorize?${params}`;
  console.log(githubLoginUrl);