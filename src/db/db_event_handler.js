var rofl = require('../log/file_logger');

var watchConnections = function (_client, name) {
  
  _client.on('serverDescriptionChanged', function(event) {
    rofl.trace(name, {}, 'serverDescriptionChanged', event);
  });
  
  _client.on('serverHeartbeatStarted', function(event) {
    rofl.trace(name, {}, 'serverHeartbeatStarted', event);
  });
  
  _client.on('serverHeartbeatSucceeded', function(event) {
    rofl.trace(name, {}, 'serverHeartbeatSucceeded', event);
  });
  
  _client.on('serverHeartbeatFailed', function(event) {
    rofl.warn(name, {}, 'serverHeartbeatFailed', event);
  });
  
  _client.on('serverOpening', function(event) {
    rofl.trace(name, {}, 'serverOpening', event);
  });
  
  _client.on('serverClosed', function(event) {
    rofl.warn(name, {}, 'serverClosed', event);
  });
  
  _client.on('topologyOpening', function(event) {
    rofl.trace(name, {}, 'topologyOpening', event);
  });
  
  _client.on('topologyClosed', function(event) {
    rofl.warn(name, {}, 'topologyClosed', event);
  });
  
  _client.on('topologyDescriptionChanged', function(event) {
    rofl.trace(name, {}, 'topologyDescriptionChanged', event);
  });
};

module.exports = watchConnections;

