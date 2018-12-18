const path = require('path');
const translations = path.join(__dirname, 'translations.yml');

const connect = require('./connect');

module.exports = {
  connect,
  translations,
};
