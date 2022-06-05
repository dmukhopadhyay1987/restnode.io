var gateway = require('./gateway');
var rofl = require('./log/file_logger');
var port = process.env.PORT || 555;
gateway.listen(port, () => {
  rofl.info('', {}, 'restnode.io server listening on port', port);
});
