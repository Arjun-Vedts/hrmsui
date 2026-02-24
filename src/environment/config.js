// src/environment/config.js
const env = process.env.REACT_APP_ENV || 'development'; 


let environment;

if (env === 'production') {
  environment = require('./environment.prod').default;
} else {
  environment = require('./environment.dev').default;
}

export default environment;