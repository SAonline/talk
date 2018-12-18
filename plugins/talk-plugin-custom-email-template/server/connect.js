const path = require('path');
const linkify = require('linkifyjs/html');

module.exports = connectors => {
  const {
    services: { Mailer },
  } = connectors;

  // Setup the mailer. Other plugins registered before this one can replace the
  // email template by passing the same name + format for the template
  // registration.

  ['plain'].forEach(name => {
    ['txt', 'html'].forEach(format => {
      Mailer.templates.register(
        path.join(__dirname, 'emails', `${name}.${format}.ejs`),
        name,
        format
      );
    });
  });
  // Register the mail helpers. You can register your own helpers by calling
  // this function in another plugin.
  Mailer.registerHelpers({ linkify });
};
